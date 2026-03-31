const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  email:      { type: String, required: true, unique: true, lowercase: true },
  password:   { type: String, required: true },
  employeeId: { type: String, required: true, unique: true },
  role:       { type: String, default: "employee" },
  department: { type: String, default: "" },
  isActive:   { type: Boolean, default: true },
  lastLogin:  { type: Date, default: null },
  createdAt:  { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", userSchema);
