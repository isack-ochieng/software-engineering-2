// models/Employee.js
const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  employeeId: { type: String, required: true, unique: true },
  role: { type: String, required: true },
  department: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, default: "" },
  status: { 
    type: String, 
    enum: ["Active", "Away", "Inactive"], 
    default: "Active" 
  },
  photo: { type: String, default: "" }, // initials like "AO"
  joined: { type: Date, default: Date.now },
  location: { type: String, default: "Nairobi, Kenya" },
  manager: { type: String, default: "" },
  // Link to User if needed
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

module.exports = mongoose.model("Employee", employeeSchema);