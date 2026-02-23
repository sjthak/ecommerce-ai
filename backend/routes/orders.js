const router = require("express").Router();
const Order = require("../models/Order");
const authMiddleware = require("../middleware/auth");

// POST /api/orders — สร้างคำสั่งซื้อ
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { items, shipping, total } = req.body;

    if (!items?.length) return res.status(400).json({ message: "No items in cart" });
    if (!shipping?.name || !shipping?.address)
      return res.status(400).json({ message: "Shipping info required" });

    const order = await Order.create({
      user: req.user.id,
      items, shipping, total,
      status: "pending"
    });

    res.status(201).json({ success: true, order });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders — ดูคำสั่งซื้อของตัวเอง
router.get("/", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;