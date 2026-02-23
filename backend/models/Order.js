const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [{
    product_id: String,
    title: String,
    image_url: String,
    price: Number,
    qty: Number
  }],
  shipping: {
    name: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    zip: String,
    country: String
  },
  total: Number,
  status: { type: String, default: "pending" }
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);