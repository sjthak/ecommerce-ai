const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const users = await User.find({}, { password: 0 });
  console.log("Users:", JSON.stringify(users, null, 2));
  console.log("Total:", users.length);
  mongoose.disconnect();
});