// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    photo: {
      type: String,
      default: "",
    },
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    role: {
      type: String,
      default: "employee",
      enum: ["employee", "developer", "designer", "manager", "hr", "admin"],
      index: true,
    },
    department: {
      type: String,
      default: "General",
      index: true,
    },
    position: {
      type: String,
      default: "",
      trim: true,
    },
    employmentType: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Intern"],
      default: "Full-time",
    },
    status: {
      type: String,
      enum: ["Active", "Away", "Inactive"],
      default: "Active",
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    joinedDate: {
      type: Date,
      default: Date.now,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true, // Automatically handles createdAt & updatedAt
  }
);

// ✅ Pure async pre-save hook (NO 'next' at all) - This fixes the error
userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

// Compare password method (used during login)
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Update last login method
userSchema.methods.updateLastLogin = async function () {
  this.lastLogin = new Date();
  return this.save();
};

// Virtual for display
userSchema.virtual("fullInfo").get(function () {
  return `${this.name} (${this.employeeId}) - ${this.role} at ${this.department}`;
});

userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("User", userSchema);