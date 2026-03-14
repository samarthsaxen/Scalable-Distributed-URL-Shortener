const express = require("express");
const router = express.Router();

const {
  shortenUrl,
  redirectUrl,
  getUrlStats,
  getUrlTimeline,
  checkAliasAvailability
} = require("../controllers/urlController");

router.post("/shorten", shortenUrl);
router.get("/alias/:shortCode/availability", checkAliasAvailability);
router.get("/stats/:shortCode", getUrlStats);
router.get("/stats/:shortCode/timeline", getUrlTimeline);
router.get("/:shortCode", redirectUrl);

module.exports = router;
