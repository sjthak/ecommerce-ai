const router = require("express").Router();
const mongoose = require("mongoose");

// Schema ตรงกับ data ที่ import ไว้
const productSchema = new mongoose.Schema({
  product_id: String,
  title: String,
  main_category: String,
  price: Number,
  image_url: String,
  short_description: String,
}, { collection: "products" });

const Product = mongoose.model("Product", productSchema);

// GET /api/products — ดึงสินค้าทั้งหมด
router.get("/", async (req, res) => {
  try {
    const { category, min_price, max_price, limit = 20, page = 1 } = req.query;
    
    let filter = {};
    if (category) filter.main_category = category;
    if (min_price || max_price) {
      filter.price = {};
      if (min_price) filter.price.$gte = parseFloat(min_price);
      if (max_price) filter.price.$lte = parseFloat(max_price);
    }

    const products = await Product
      .find(filter, { embedding: 0 })  // ไม่ส่ง embedding กลับ
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      total,
      page: parseInt(page),
      products
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/products/:id — ดึงสินค้าชิ้นเดียว
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findOne(
      { product_id: req.params.id },
      { embedding: 0 }
    );

    if (!product) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }

    res.json({ success: true, product });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;