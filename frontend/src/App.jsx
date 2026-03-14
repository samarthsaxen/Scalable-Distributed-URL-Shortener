import { useState, useEffect } from "react";
import "./App.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function TimelineChart({ data }) {
  if (!data || data.length === 0) {
    return <p className="muted-text">No click activity recorded yet.</p>;
  }

  const width = 640;
  const height = 220;
  const padding = 28;
  const maxY = Math.max(...data.map((point) => point.clicks), 1);

  const points = data.map((point, index) => {
    const x =
      data.length === 1
        ? width / 2
        : padding + (index * (width - padding * 2)) / (data.length - 1);
    const y = height - padding - (point.clicks / maxY) * (height - padding * 2);
    return { x, y, ...point };
  });

  const polylinePoints = points.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg" role="img" aria-label="Clicks over time chart">
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} className="axis-line" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} className="axis-line" />
        <polyline points={polylinePoints} className="chart-line" />
        {points.map((point) => (
          <g key={point.date}>
            <circle cx={point.x} cy={point.y} r="4" className="chart-dot" />
          </g>
        ))}
      </svg>
      <div className="chart-labels">
        {points.map((point) => (
          <span key={point.date}>
            {point.date} ({point.clicks})
          </span>
        ))}
      </div>
    </div>
  );
}

function App() {
  const [url, setUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [expiresIn, setExpiresIn] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [latestShortCode, setLatestShortCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [statsCode, setStatsCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [aliasStatus, setAliasStatus] = useState({ loading: false, checked: false, available: false, message: "" });

  useEffect(() => {
    const savedHistory = localStorage.getItem("shortenerHistory");
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("shortenerHistory", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    const value = customCode.trim();

    if (!value) {
      setAliasStatus({ loading: false, checked: false, available: false, message: "" });
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setAliasStatus((prev) => ({ ...prev, loading: true }));
        const res = await fetch(`${API_BASE_URL}/api/alias/${encodeURIComponent(value)}/availability`);
        const data = await res.json();

        if (!res.ok) {
          setAliasStatus({
            loading: false,
            checked: true,
            available: false,
            message: data.error || "Alias unavailable"
          });
          return;
        }

        setAliasStatus({
          loading: false,
          checked: true,
          available: data.available,
          message: data.available ? "Alias is available" : "Alias is already taken"
        });
      } catch {
        setAliasStatus({
          loading: false,
          checked: true,
          available: false,
          message: "Could not verify alias right now"
        });
      }
    }, 450);

    return () => clearTimeout(timeoutId);
  }, [customCode]);

  const resetMessages = () => {
    setError("");
    setSuccess("");
  };

  const fetchTimeline = async (code) => {
    if (!code) return;

    setTimelineLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/stats/${code}/timeline`);
      const data = await res.json();
      if (res.ok) {
        setTimeline(data.timeline || []);
      } else {
        setTimeline([]);
      }
    } catch {
      setTimeline([]);
    }
    setTimelineLoading(false);
  };

  const handleShorten = async () => {
    resetMessages();
    setShortUrl("");
    setCopied(false);
    setLoading(true);

    const trimmedUrl = url.trim();
    const trimmedCode = customCode.trim();

    if (!trimmedUrl) {
      setError("Please enter a URL first.");
      setLoading(false);
      return;
    }

    try {
      const body = { originalUrl: trimmedUrl };
      if (trimmedCode) body.customCode = trimmedCode;
      if (expiresIn) body.expiresIn = Number(expiresIn);

      const res = await fetch(`${API_BASE_URL}/api/shorten`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      setShortUrl(data.shortUrl);
      setLatestShortCode(data.shortCode);
      setSuccess("Short URL generated successfully!");

      setHistory((prevHistory) => [
        {
          original: trimmedUrl,
          short: data.shortUrl,
          shortCode: data.shortCode,
          createdAt: new Date().toISOString()
        },
        ...prevHistory
      ]);

      setUrl("");
      setCustomCode("");
    } catch {
      setError("Server error. Please try again.");
    }

    setLoading(false);
  };

  const fetchStats = async () => {
    resetMessages();
    setStats(null);

    const code = statsCode.trim();
    if (!code) {
      setError("Enter a short code to fetch analytics.");
      return;
    }

    setStatsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/stats/${code}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Stats not found");
        setStatsLoading(false);
        return;
      }

      setStats(data);
      await fetchTimeline(code);
    } catch {
      setError("Failed to fetch analytics");
    }

    setStatsLoading(false);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setError("Failed to copy to clipboard.");
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("shortenerHistory");
  };

  return (
    <div className="app-shell">
      <div className="bg-orb orb-a" />
      <div className="bg-orb orb-b" />

      <div className="card">
        <header className="app-header">
          <h1>Smart URL Shortener</h1>
          <p className="subheading">
            Production-minded URL shortening with caching, expiration control, and analytics.
          </p>
        </header>

        <main className="app-main">
          <section className="section">
            <h2>Shorten a URL</h2>
            <p className="section-copy">
              Create branded short links instantly. Optionally set a custom code and expiration time.
            </p>

            <label className="field-label">Destination URL</label>
            <input
              type="text"
              placeholder="https://example.com/your-long-link"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />

            <div className="row-fields">
              <div>
                <label className="field-label">Custom short code</label>
                <input
                  type="text"
                  placeholder="my-brand-link"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                />
                {customCode.trim() && (
                  <p
                    className={`alias-status ${
                      aliasStatus.loading
                        ? "checking"
                        : aliasStatus.available
                          ? "available"
                          : "unavailable"
                    }`}
                  >
                    {aliasStatus.loading ? "Checking alias..." : aliasStatus.message}
                  </p>
                )}
              </div>

              <div>
                <label className="field-label">Expire in seconds</label>
                <input
                  type="number"
                  min="1"
                  placeholder="3600"
                  value={expiresIn}
                  onChange={(e) => setExpiresIn(e.target.value)}
                />
              </div>
            </div>

            <button onClick={handleShorten} disabled={loading}>
              {loading ? "Shortening..." : "Shorten URL"}
            </button>

            {error && <div className="message error-message">{error}</div>}
            {success && <div className="message success-message">{success}</div>}

            {shortUrl && (
              <div className="result">
                <h3>Your short link is ready</h3>
                <a href={shortUrl} target="_blank" rel="noreferrer">
                  {shortUrl}
                </a>

                <div className="inline-actions">
                  <button onClick={copyToClipboard} className="secondary-btn">
                    {copied ? "Copied ✓" : "Copy Link"}
                  </button>
                </div>

                <div className="qr-panel">
                  <p className="muted-text">Scan QR to open this link instantly</p>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(shortUrl)}`}
                    alt="QR code for short URL"
                  />
                </div>

                {latestShortCode && (
                  <p className="muted-text">
                    Tip: use code <strong>{latestShortCode}</strong> in analytics below.
                  </p>
                )}
              </div>
            )}
          </section>

          <section className="section">
            <div className="section-header">
              <div>
                <h2>Recent URLs</h2>
                <p className="section-copy">Your latest generated links (stored locally in browser).</p>
              </div>
              <button onClick={clearHistory} className="danger-btn" disabled={history.length === 0}>
                Clear History
              </button>
            </div>

            {history.length === 0 ? (
              <p className="empty-text">No URLs yet</p>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Original URL</th>
                      <th>Short URL</th>
                      <th>Code</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item, index) => (
                      <tr key={`${item.short}-${index}`}>
                        <td>{item.original}</td>
                        <td>
                          <a href={item.short} target="_blank" rel="noreferrer">
                            {item.short}
                          </a>
                        </td>
                        <td>{item.shortCode || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="section">
            <h2>Analytics</h2>
            <p className="section-copy">Track performance of any short code in real time.</p>

            <input
              type="text"
              placeholder="Enter short code (e.g. aB12_X)"
              value={statsCode}
              onChange={(e) => setStatsCode(e.target.value)}
            />

            <button onClick={fetchStats} disabled={statsLoading}>
              {statsLoading ? "Loading..." : "Get Stats"}
            </button>

            {stats && (
              <div className="result analytics">
                <p>
                  <strong>Original URL:</strong> {stats.originalUrl}
                </p>
                <p>
                  <strong>Short URL:</strong>{" "}
                  <a href={stats.shortUrl} target="_blank" rel="noreferrer">
                    {stats.shortUrl}
                  </a>
                </p>
                <p>
                  <strong>Clicks:</strong> {stats.clicks}
                </p>
                <p>
                  <strong>Created:</strong> {new Date(stats.createdAt).toLocaleString()}
                </p>
                <p>
                  <strong>Expires:</strong>{" "}
                  {stats.expiresAt ? new Date(stats.expiresAt).toLocaleString() : "Never"}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span className={stats.isExpired ? "status-badge expired" : "status-badge active"}>
                    {stats.isExpired ? "Expired" : "Active"}
                  </span>
                </p>

                {stats.qrCodeUrl && (
                  <div className="qr-panel">
                    <p className="muted-text">QR code for this short link</p>
                    <img src={stats.qrCodeUrl} alt="Analytics QR code" />
                  </div>
                )}

                <div className="timeline-panel">
                  <h4>Clicks Over Time</h4>
                  {timelineLoading ? <p className="muted-text">Loading chart...</p> : <TimelineChart data={timeline} />}
                </div>
              </div>
            )}
          </section>
        </main>

        <footer className="app-footer">Built with React + Node.js + Redis + MongoDB</footer>
      </div>
    </div>
  );
}

export default App;
