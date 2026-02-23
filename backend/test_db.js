const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log("Collections:", collections.map(c => c.name));
  
  // เช็คจำนวน documents ตรงๆ
  const count = await mongoose.connection.db.collection("products").countDocuments();
  console.log("Total products:", count);

  // ดู document ตัวอย่าง
  const sample = await mongoose.connection.db.collection("products").findOne({}, { projection: { embedding: 0 } });
  console.log("Sample:", JSON.stringify(sample, null, 2));

  mongoose.disconnect();
});