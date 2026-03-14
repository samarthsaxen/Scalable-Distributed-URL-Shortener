const redis = require("redis");

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

const redisClient = redis.createClient({
  url: redisUrl
});

redisClient.on("connect", () => {
  console.log(`Redis Connected (${redisUrl})`);
});

redisClient.on("reconnecting", () => {
  console.warn("Redis reconnecting...");
});

redisClient.on("error", (err) => {
  console.error("Redis Error:", err.message || err);
});

(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error("Failed to connect Redis:", err.message || err);
  }
})();

module.exports = redisClient;
