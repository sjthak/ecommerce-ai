const router = require("express").Router();
const axios = require("axios");

const AI_URL = process.env.AI_SERVICE_URL;

router.post("/chat", async (req, res) => {
  try {
    const response = await axios.post(`${AI_URL}/chat/`, req.body, {
      timeout: 60000  // เพิ่ม timeout เป็น 60 วินาที เผื่อ cold start
    });
    res.json(response.data);
  } catch (err) {
    console.error("AI chat error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

router.post("/search", async (req, res) => {
  try {
    const response = await axios.post(`${AI_URL}/search/`, req.body, {
      timeout: 60000
    });
    res.json(response.data);
  } catch (err) {
    console.error("AI search error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;