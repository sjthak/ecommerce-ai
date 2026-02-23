const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  await mongoose.connection.db.collection("users").deleteMany({});
  console.log("✅ Users cleared");
  mongoose.disconnect();
});