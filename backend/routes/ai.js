const router = require("express").Router();
const axios = require("axios");
require("dotenv").config();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL;

// POST /api/ai/chat
router.post("/chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    const response = await axios.post(`${AI_SERVICE_URL}/chat/`, {
      message,
      history
    });

    res.json(response.data);

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/ai/search
router.post("/search", async (req, res) => {
  try {
    const { query, limit = 5 } = req.body;

    const response = await axios.post(`${AI_SERVICE_URL}/search/`, {
      query,
      limit
    });

    res.json(response.data);

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;