const URL = require("../models/URL");
const { nanoid } = require("nanoid");
const redisClient = require("../config/redis");
const validator = require("validator");

const CUSTOM_CODE_REGEX = /^[a-zA-Z0-9_-]{4,20}$/;
const DEFAULT_BASE_URL = "http://localhost:5000";

const getBaseUrl = () => process.env.BASE_URL || DEFAULT_BASE_URL;

const isValidHttpUrl = (value) =>
  validator.isURL(value, {
    protocols: ["http", "https"],
    require_protocol: true
  });

exports.shortenUrl = async (req, res) => {
  try {
    const { originalUrl, customCode, expiresIn } = req.body;

    if (!originalUrl || !isValidHttpUrl(originalUrl)) {
      return res.status(400).json({ error: "Invalid URL. Use http/https URL." });
    }

    let expiresAt = null;
    if (expiresIn !== undefined && expiresIn !== null && expiresIn !== "") {
      const expiresInNumber = Number(expiresIn);
      if (!Number.isFinite(expiresInNumber) || expiresInNumber <= 0) {
        return res.status(400).json({ error: "expiresIn must be a positive number (seconds)." });
      }
      expiresAt = new Date(Date.now() + expiresInNumber * 1000);
    }

    let shortCode = customCode ? customCode.trim() : "";

    if (shortCode) {
      if (!CUSTOM_CODE_REGEX.test(shortCode)) {
        return res.status(400).json({
          error: "Invalid custom code. Use 4-20 characters: letters, numbers, '-' or '_'."
        });
      }

      const existing = await URL.findOne({ shortCode });
      if (existing) {
        return res.status(400).json({ error: "Short code already exists" });
      }
    } else {
      shortCode = nanoid(6);
      let existing = await URL.findOne({ shortCode });
      while (existing) {
        shortCode = nanoid(6);
        existing = await URL.findOne({ shortCode });
      }
    }

    const newUrl = new URL({
      originalUrl: originalUrl.trim(),
      shortCode,
      expiresAt
    });

    await newUrl.save();

    res.status(201).json({
      message: "Short URL created",
      shortUrl: `${getBaseUrl()}/api/${shortCode}`,
      shortCode,
      expiresAt
    });
  } catch (error) {
    console.error("shortenUrl error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.redirectUrl = async (req, res) => {
  try {
    const { shortCode } = req.params;
    const now = new Date();

    const cachedUrl = await redisClient.get(shortCode);

    if (cachedUrl) {
      if (!isValidHttpUrl(cachedUrl)) {
        return res.status(400).json({ error: "Invalid redirect URL stored in cache" });
      }

      await URL.updateOne(
        { shortCode },
        {
          $inc: { clicks: 1 },
          $push: { clickEvents: { $each: [now], $slice: -200 } }
        }
      );

      return res.redirect(cachedUrl);
    }

    const url = await URL.findOne({ shortCode });

    if (!url) {
      return res.status(404).json({ error: "URL not found" });
    }

    if (url.expiresAt && url.expiresAt < now) {
      return res.status(410).json({ error: "URL expired" });
    }

    if (!isValidHttpUrl(url.originalUrl)) {
      return res.status(400).json({ error: "Invalid target URL" });
    }

    if (url.expiresAt) {
      const ttlSeconds = Math.max(1, Math.floor((url.expiresAt.getTime() - Date.now()) / 1000));
      await redisClient.set(shortCode, url.originalUrl, { EX: ttlSeconds });
    } else {
      await redisClient.set(shortCode, url.originalUrl);
    }

    url.clicks += 1;
    url.clickEvents.push(now);
    if (url.clickEvents.length > 200) {
      url.clickEvents = url.clickEvents.slice(-200);
    }
    await url.save();

    res.redirect(url.originalUrl);
  } catch (error) {
    console.error("redirectUrl error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getUrlStats = async (req, res) => {
  try {
    const { shortCode } = req.params;

    const url = await URL.findOne({ shortCode });

    if (!url) {
      return res.status(404).json({ error: "URL not found" });
    }

    const shortUrl = `${getBaseUrl()}/api/${url.shortCode}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(shortUrl)}`;

    res.json({
      originalUrl: url.originalUrl,
      shortCode: url.shortCode,
      shortUrl,
      qrCodeUrl,
      clicks: url.clicks,
      createdAt: url.createdAt,
      expiresAt: url.expiresAt,
      isExpired: Boolean(url.expiresAt && url.expiresAt < new Date())
    });
  } catch (error) {
    console.error("getUrlStats error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getUrlTimeline = async (req, res) => {
  try {
    const { shortCode } = req.params;
    const url = await URL.findOne({ shortCode });

    if (!url) {
      return res.status(404).json({ error: "URL not found" });
    }

    const clicksByDay = {};
    for (const eventDate of url.clickEvents || []) {
      const day = new Date(eventDate).toISOString().slice(0, 10);
      clicksByDay[day] = (clicksByDay[day] || 0) + 1;
    }

    const timeline = Object.entries(clicksByDay)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .map(([date, clicks]) => ({ date, clicks }));

    res.json({
      shortCode: url.shortCode,
      totalClicks: url.clicks,
      timeline
    });
  } catch (error) {
    console.error("getUrlTimeline error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.checkAliasAvailability = async (req, res) => {
  try {
    const { shortCode } = req.params;
    const code = (shortCode || "").trim();

    if (!CUSTOM_CODE_REGEX.test(code)) {
      return res.status(400).json({
        available: false,
        error: "Alias must be 4-20 chars and contain only letters, numbers, '-' or '_'."
      });
    }

    const existing = await URL.findOne({ shortCode: code });
    return res.json({
      alias: code,
      available: !existing
    });
  } catch (error) {
    console.error("checkAliasAvailability error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};
