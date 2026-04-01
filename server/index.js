const express = require("express");
const mongoose = require("mongoose");
const cors    = require("cors");
const authenticateToken = require("./middleware/auth");
const Employee = require("./models/Employee");
const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");
const User    = require("./models/authDB");

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

const JWT_SECRET = "taifa-secret-2026";

// ── MongoDB ───────────────────────────────────────────────────────────────────
mongoose.connect("mongodb://127.0.0.1:27017/authDB")
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err  => console.error("❌ MongoDB error:", err.message));

// ── SIGNUP ────────────────────────────────────────────────────────────────────
app.post("/signup", async (req, res) => {
  console.log("📥 Signup:", req.body.email);
  const { name, email, password, employeeId, role, department } = req.body;

  if (!name || !email || !password || !employeeId)
    return res.status(400).json({ message: "Please fill in all required fields (*)" });
  if (password.length < 8)
    return res.status(400).json({ message: "Password must be at least 8 characters long" });

  try {
    const existing = await User.findOne({ $or: [{ email: email.toLowerCase() }, { employeeId }] });
    if (existing) {
      if (existing.email === email.toLowerCase())
        return res.status(400).json({ message: "User with this email already exists" });
      return res.status(400).json({ message: "Employee ID already exists" });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      employeeId,
      role: role || "employee",
      department: department || "",
      isActive: true,
    });
    await user.save();
    console.log("✅ Created:", user.email);

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      message: "Account created successfully!",
      token,
      user: { id: user._id, name: user.name, email: user.email, employeeId: user.employeeId, role: user.role, department: user.department }
    });
  } catch (err) {
    console.error("❌ Signup error:", err.message, "code:", err.code);
    if (err.code === 11000) return res.status(400).json({ message: "Email or Employee ID already registered." });
    res.status(500).json({ message: "Error creating account: " + err.message });
  }
});

// ── LOGIN ─────────────────────────────────────────────────────────────────────
app.post("/login", async (req, res) => {
  console.log("📥 Login:", req.body.email);
  const { email, password, rememberMe } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Please enter your email and password" });

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });
    if (!user.isActive) return res.status(401).json({ message: "Account is deactivated. Please contact administrator" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: rememberMe ? "30d" : "1d" }
    );

    console.log("✅ Login:", user.email);
    res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, employeeId: user.employeeId, role: user.role, department: user.department }
    });
  } catch (err) {
    console.error("❌ Login error:", err.message);
    res.status(500).json({ message: "Error logging in. Please try again." });
  }
});

// Protected: Get all employees
app.get("/api/employees", authenticateToken, async (req, res) => {
  try {
    const employees = await Employee.find().sort({ name: 1 });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: "Error fetching employees" });
  }
});

// Protected: Get single employee
app.get("/api/employees/:id", authenticateToken, async (req, res) => {
  try {
    const emp = await Employee.findById(req.params.id);
    if (!emp) return res.status(404).json({ message: "Employee not found" });
    res.json(emp);
  } catch (err) {
    res.status(500).json({ message: "Error fetching employee" });
  }
});

// Optional: Add more (POST, PUT, DELETE) later

// Protected test route
app.get("/api/me", authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// ── HEALTH / TEST ─────────────────────────────────────────────────────────────
app.get("/health", (_, res) => res.json({ status: "OK", timestamp: new Date() }));
app.get("/test",   (_, res) => res.json({ message: "Server is working!" }));

// ── START ─────────────────────────────────────────────────────────────────────
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Test: http://localhost:${PORT}/test\n`);
});
