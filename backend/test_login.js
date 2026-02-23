const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  // เปลี่ยนเป็น email และ password ที่ใช้สมัครจริงๆ ครับ
  const email = "sajittha.sinlathamdi@gmail.com";
  const password = "123456"; // ← ใส่ password จริงที่กรอกตอน register

  const user = await User.findOne({ email });
  console.log("User found:", !!user);

  if (user) {
    const match = await user.comparePassword(password);
    console.log("Password match:", match);
  }

  mongoose.disconnect();
});