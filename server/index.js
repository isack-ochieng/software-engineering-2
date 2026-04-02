const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authenticateToken = require("./middleware/auth");
const User = require("./models/User"); // Single model
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

const JWT_SECRET = "taifa-secret-2026";

// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/taifa_db") // Renamed for clarity
  .then(() => console.log("✅ MongoDB connected to taifa_db"))
  .catch(err => console.error("❌ MongoDB error:", err.message));

// ── SIGNUP (Create new employee/user) ─────────────────────────────────────
app.post("/signup", async (req, res) => {
  console.log("📥 Signup:", req.body.email);
  const { name, email, password, employeeId, role, department, phone, position } = req.body;

  if (!name || !email || !password || !employeeId) {
    return res.status(400).json({ message: "Please fill in all required fields (*)" });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters long" });
  }

  try {
    // Check if user exists
    const existing = await User.findOne({ 
      $or: [{ email: email.toLowerCase() }, { employeeId }] 
    });
    
    if (existing) {
      if (existing.email === email.toLowerCase()) {
        return res.status(400).json({ message: "User with this email already exists" });
      }
      return res.status(400).json({ message: "Employee ID already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user/employee
    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      employeeId,
      role: role || "employee",
      department: department || "General",
      position: position || role || "Staff",
      phone: phone || "",
      status: "Active",
      isActive: true,
      joinedDate: new Date(),
      photo: name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() // Auto-generate initials
    });

    await user.save();
    console.log("✅ Created user/employee:", user.email);

    // Generate token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.role, 
        name: user.name,
        department: user.department 
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      message: "Account created successfully!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        employeeId: user.employeeId,
        role: user.role,
        department: user.department,
        position: user.position,
        status: user.status,
        phone: user.phone,
        photo: user.photo
      }
    });
  } catch (err) {
    console.error("❌ Signup error:", err.message);
    if (err.code === 11000) {
      return res.status(400).json({ message: "Email or Employee ID already registered." });
    }
    res.status(500).json({ message: "Error creating account: " + err.message });
  }
});

// ── LOGIN ────────────────────────────────────────────────────────────────
app.post("/login", async (req, res) => {
  console.log("📥 Login:", req.body.email);
  const { email, password, rememberMe } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Please enter your email and password" });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    
    if (!user.isActive || user.status === "Inactive") {
      return res.status(401).json({ message: "Account is deactivated. Please contact administrator" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.role, 
        name: user.name,
        department: user.department 
      },
      JWT_SECRET,
      { expiresIn: rememberMe ? "30d" : "1d" }
    );

    console.log("✅ Login successful:", user.email);
    
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        employeeId: user.employeeId,
        role: user.role,
        department: user.department,
        position: user.position,
        status: user.status,
        phone: user.phone,
        photo: user.photo,
        joinedDate: user.joinedDate
      }
    });
  } catch (err) {
    console.error("❌ Login error:", err.message);
    res.status(500).json({ message: "Error logging in. Please try again." });
  }
});

// ── GET ALL EMPLOYEES (Now from unified collection) ─────────────────────
app.get("/api/employees", authenticateToken, async (req, res) => {
  try {
    // Get all users, exclude password
    const employees = await User.find({ isActive: true })
      .select('-password')
      .sort({ name: 1 });
    
    console.log(`📊 Retrieved ${employees.length} employees`);
    res.json(employees);
  } catch (err) {
    console.error("❌ Error fetching employees:", err);
    res.status(500).json({ message: "Error fetching employees", error: err.message });
  }
});

// ── GET SINGLE EMPLOYEE ─────────────────────────────────────────────────
app.get("/api/employees/:id", authenticateToken, async (req, res) => {
  try {
    const employee = await User.findById(req.params.id).select('-password');
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.json(employee);
  } catch (err) {
    console.error("❌ Error fetching employee:", err);
    res.status(500).json({ message: "Error fetching employee" });
  }
});

// ── UPDATE EMPLOYEE ─────────────────────────────────────────────────────
app.put("/api/employees/:id", authenticateToken, async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password; // Never update password here
    delete updates._id; // Don't allow ID changes
    
    const employee = await User.findByIdAndUpdate(
      req.params.id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    
    res.json(employee);
  } catch (err) {
    console.error("❌ Error updating employee:", err);
    res.status(500).json({ message: "Error updating employee" });
  }
});

// ── SEED INITIAL EMPLOYEES (Optional - for demo data) ───────────────────
app.post("/api/seed-employees", async (req, res) => {
  try {
    const count = await User.countDocuments();
    if (count > 0) {
      return res.json({ message: "Database already has data", count });
    }

    const sampleEmployees = [
      {
        name: "John Doe",
        email: "john.doe@taifa.com",
        password: await bcrypt.hash("password123", 10),
        employeeId: "EMP001",
        role: "admin",
        department: "Engineering",
        position: "Senior Software Engineer",
        phone: "+254 712 345 678",
        status: "Active",
        isActive: true,
        joinedDate: new Date("2024-01-15"),
        photo: "JD"
      },
      {
        name: "Jane Smith",
        email: "jane.smith@taifa.com",
        password: await bcrypt.hash("password123", 10),
        employeeId: "EMP002",
        role: "manager",
        department: "Product",
        position: "Product Manager",
        phone: "+254 723 456 789",
        status: "Active",
        isActive: true,
        joinedDate: new Date("2024-02-01"),
        photo: "JS"
      },
      {
        name: "Michael Omondi",
        email: "michael.omondi@taifa.com",
        password: await bcrypt.hash("password123", 10),
        employeeId: "EMP003",
        role: "employee",
        department: "Design",
        position: "UX Designer",
        phone: "+254 734 567 890",
        status: "Away",
        isActive: true,
        joinedDate: new Date("2024-01-20"),
        photo: "MO"
      }
    ];

    const employees = await User.insertMany(sampleEmployees);
    res.status(201).json({ 
      message: "Employees seeded successfully", 
      count: employees.length,
      employees: employees.map(e => ({ ...e.toObject(), password: undefined }))
    });
  } catch (err) {
    console.error("❌ Seed error:", err);
    res.status(500).json({ message: "Error seeding employees", error: err.message });
  }
});

// ── GET CURRENT USER ────────────────────────────────────────────────────
app.get("/api/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Error fetching user data" });
  }
});

// ── HEALTH CHECK ────────────────────────────────────────────────────────
app.get("/health", (_, res) => res.json({ status: "OK", timestamp: new Date() }));
app.get("/test", (_, res) => res.json({ message: "Server is working!" }));

// ── START SERVER ────────────────────────────────────────────────────────
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Test: http://localhost:${PORT}/test`);
  console.log(`📊 Database: taifa_db\n`);
});