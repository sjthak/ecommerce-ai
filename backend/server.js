const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
const productsRouter = require("./routes/products");
const aiRouter = require("./routes/ai");
const authRouter = require("./routes/auth");
const ordersRouter = require("./routes/orders");

app.use("/api/orders", ordersRouter);
app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/ai", aiRouter);

// Health check
app.get("/", (req, res) => {
  res.json({ status: "Backend is running " });
});

// เชื่อมต่อ MongoDB แล้วค่อย start server
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log(" MongoDB connected");
    app.listen(process.env.PORT || 5000, () => {
      console.log(` Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => {
    console.error(" MongoDB connection error:", err);
  });