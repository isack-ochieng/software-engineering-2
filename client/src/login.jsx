import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Mail, Lock, Eye, EyeOff, Building2, LogIn, 
  AlertCircle, CheckCircle, Fingerprint 
} from "lucide-react";
import "./App.css";
import api from "./api";

function Login() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!formData.email || !formData.password) {
      setError("Please enter your email and password");
      setLoading(false);
      return;
    }

    try {
      console.log("🔄 Attempting login for:", formData.email);

      const res = await api.post("/login", {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        rememberMe: formData.rememberMe,
      });

      console.log("✅ Login successful - Response received");

      // Save to storage
      const storage = formData.rememberMe ? localStorage : sessionStorage;
      storage.setItem("token", res.data.token);
      storage.setItem("user", JSON.stringify(res.data.user || {}));

      console.log("✅ Token and user data saved to storage");

      setSuccess("Login successful! Redirecting to dashboard...");

      // Short delay so user can see success message
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 1000);

    } catch (err) {
      console.error("❌ Login error:", err.response?.data || err.message);

      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message.includes("Network Error") || err.code === "ERR_NETWORK") {
        setError("Cannot connect to server. Make sure backend is running on port 5000.");
      } else {
        setError("Invalid email or password. Please try again.");
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
          <h2 className="signup-form-title">Welcome Back</h2>
          <p className="signup-welcome-text">Sign in to access your employee dashboard</p>

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

          <div className="signup-input-group">
            <label className="signup-label">Email Address</label>
            <div className="signup-input-wrapper">
              <Mail size={18} className="signup-input-icon" />
              <input
                type="email"
                name="email"
                placeholder="john.doe@taifasystems.com"
                value={formData.email}
                onChange={handleChange}
                className="signup-input"
                autoComplete="email"
                disabled={loading}
              />
            </div>
          </div>

          <div className="signup-input-group">
            <label className="signup-label">Password</label>
            <div className="signup-input-wrapper">
              <Lock size={18} className="signup-input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className="signup-input"
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="signup-eye-button"
                disabled={loading}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="signup-options-row">
            <label className="signup-checkbox-label">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="signup-checkbox"
              />
              <span className="signup-checkbox-text">Remember me</span>
            </label>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="signup-button"
          >
            {loading ? (
              <span>Signing in...</span>
            ) : (
              <span className="signup-button-content">
                <LogIn size={18} />
                <span>Sign In</span>
              </span>
            )}
          </button>

          <p className="signup-text">
            Don't have an account?{" "}
            <Link to="/signup" className="signup-link">Create Account</Link>
          </p>

          <div className="signup-security-note">
            <Fingerprint size={14} />
            <span>Your data is protected with enterprise-grade security</span>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;