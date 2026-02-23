const router = require("express").Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (user) => jwt.sign(
  { id: user._id, name: user.name, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "Email already registered" });

    const user = await User.create({ name, email, password });
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt:", email, password); // ← เพิ่ม

    const user = await User.findOne({$or: [{ email }, { name: email }]}).select("+password");
    console.log("User found:", !!user); // ← เพิ่ม
    console.log("User password field:", user?.password); // ← เพิ่ม

    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const match = await user.comparePassword(password);
    console.log("Match:", match); // ← เพิ่ม

    if (!match)
      return res.status(400).json({ message: "Invalid email or password" });

    const token = generateToken(user);
    res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email } });

  } catch (err) {
    console.log("Error:", err); // ← เพิ่ม
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me
router.get("/me", require("../middleware/auth"), (req, res) => {
  res.json({ success: true, user: req.user });
});

module.exports = router;