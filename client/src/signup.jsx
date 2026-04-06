import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  User, Mail, Lock, Eye, EyeOff, Briefcase, Building2,
  Phone, CheckCircle, AlertCircle, Calendar
} from "lucide-react";
import "./App.css";
import api from "./api"; // ← Import the configured API instance  

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    employeeId: "",
    role: "",
    department: "",
    phone: "",
    position: "",
    employmentType: "Full-time",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Password strength calculation
  const getStrength = (pwd) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.match(/[a-z]/)) strength++;
    if (pwd.match(/[A-Z]/)) strength++;
    if (pwd.match(/[0-9]/)) strength++;
    if (pwd.match(/[^a-zA-Z0-9]/)) strength++;
    return strength;
  };
  const strengthScore = getStrength(formData.password);
  const strengthText = !formData.password ? "" : strengthScore <= 2 ? "Weak" : strengthScore <= 4 ? "Medium" : "Strong";
  const strengthColor = !formData.password ? "" : strengthScore <= 2 ? "#ff4444" : strengthScore <= 4 ? "#ffa500" : "#00c851";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Required fields validation
    if (!formData.name || !formData.email || !formData.password || !formData.employeeId) {
      setError("Please fill in all required fields (*)");
      setLoading(false);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }

    try {
      const res = await api.post("/signup", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        employeeId: formData.employeeId,
        role: formData.role || "employee",
        department: formData.department || "General",
        phone: formData.phone,
        position: formData.position,
        employmentType: formData.employmentType,
      });

      // Store token and user info (using sessionStorage for this session)
      sessionStorage.setItem("token", res.data.token);
      sessionStorage.setItem("user", JSON.stringify(res.data.user));

      setSuccess("Account created! Taking you to your dashboard...");
      setTimeout(() => navigate("/dashboard"), 1200);
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Cannot reach server. Make sure the backend is running.\nIn a new terminal: cd server && npm start");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-background-pattern" />
      <div className="signup-card">
        <div className="signup-header">
          <Building2 size={48} color="white" />
          <h1 className="signup-title">Taifa Systems</h1>
          <p className="signup-subtitle">Employee Management System</p>
        </div>
        <form onSubmit={handleSubmit} className="signup-form">
          <h2 className="signup-form-title">Create Account</h2>
          {error && (
            <div className="signup-alert-error">
              <AlertCircle size={18} />
              <span style={{ whiteSpace: "pre-wrap" }}>{error}</span>
            </div>
          )}
          {success && (
            <div className="signup-alert-success">
              <CheckCircle size={18} />
              <span>{success}</span>
            </div>
          )}

          {/* Full Name */}
          <div className="signup-input-group">
            <label className="signup-label">
              Full Name <span className="signup-required">*</span>
            </label>
            <div className="signup-input-wrapper">
              <User size={18} className="signup-input-icon" />
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                className="signup-input"
              />
            </div>
          </div>

          {/* Employee ID */}
          <div className="signup-input-group">
            <label className="signup-label">
              Employee ID <span className="signup-required">*</span>
            </label>
            <div className="signup-input-wrapper">
              <Briefcase size={18} className="signup-input-icon" />
              <input
                type="text"
                name="employeeId"
                placeholder="EMP-2024-001"
                value={formData.employeeId}
                onChange={handleChange}
                className="signup-input"
              />
            </div>
          </div>

          {/* Email */}
          <div className="signup-input-group">
            <label className="signup-label">
              Email Address <span className="signup-required">*</span>
            </label>
            <div className="signup-input-wrapper">
              <Mail size={18} className="signup-input-icon" />
              <input
                type="email"
                name="email"
                placeholder="john.doe@taifasystems.com"
                value={formData.email}
                onChange={handleChange}
                className="signup-input"
              />
            </div>
          </div>

          {/* Phone & Position in a row */}
          <div className="signup-row">
            <div className="signup-input-group" style={{ flex: 1, marginRight: "1rem" }}>
              <label className="signup-label">Phone Number</label>
              <div className="signup-input-wrapper">
                <Phone size={18} className="signup-input-icon" />
                <input
                  type="tel"
                  name="phone"
                  placeholder="+254 712 345 678"
                  value={formData.phone}
                  onChange={handleChange}
                  className="signup-input"
                />
              </div>
            </div>
            <div className="signup-input-group" style={{ flex: 1 }}>
              <label className="signup-label">Position / Job Title</label>
              <div className="signup-input-wrapper">
                <Briefcase size={18} className="signup-input-icon" />
                <input
                  type="text"
                  name="position"
                  placeholder="e.g., Senior Software Engineer"
                  value={formData.position}
                  onChange={handleChange}
                  className="signup-input"
                />
              </div>
            </div>
          </div>

          {/* Role & Department in a row */}
          <div className="signup-row">
            <div className="signup-input-group" style={{ flex: 1, marginRight: "1rem" }}>
              <label className="signup-label">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="signup-select"
              >
                <option value="">Select Role</option>
                <option value="developer">Developer</option>
                <option value="designer">Designer</option>
                <option value="manager">Manager</option>
                <option value="hr">HR Specialist</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            <div className="signup-input-group" style={{ flex: 1 }}>
              <label className="signup-label">Department</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="signup-select"
              >
                <option value="">Select Department</option>
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Sales & Marketing">Sales & Marketing</option>
                <option value="IT Support">IT Support</option>
              </select>
            </div>
          </div>

          {/* Employment Type */}
          <div className="signup-input-group">
            <label className="signup-label">Employment Type</label>
            <div className="signup-input-wrapper">
              <Calendar size={18} className="signup-input-icon" />
              <select
                name="employmentType"
                value={formData.employmentType}
                onChange={handleChange}
                className="signup-select"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Intern">Intern</option>
              </select>
            </div>
          </div>

          {/* Password */}
          <div className="signup-input-group">
            <label className="signup-label">
              Password <span className="signup-required">*</span>
            </label>
            <div className="signup-input-wrapper">
              <Lock size={18} className="signup-input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
                className="signup-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="signup-eye-button"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {formData.password && (
              <div className="signup-password-strength">
                <div
                  className="signup-strength-bar"
                  style={{
                    width: `${(strengthScore / 5) * 100}%`,
                    backgroundColor: strengthColor,
                  }}
                />
                <span className="signup-strength-text" style={{ color: strengthColor }}>
                  {strengthText} Password
                </span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="signup-input-group">
            <label className="signup-label">
              Confirm Password <span className="signup-required">*</span>
            </label>
            <div className="signup-input-wrapper">
              <Lock size={18} className="signup-input-icon" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="signup-input"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="signup-eye-button"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit" disabled={loading} className="signup-button">
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          {/* Login Link */}
          <p className="signup-text">
            Already have an account? <Link to="/login" className="signup-link">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Signup;