import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Building2, LogIn, AlertCircle, CheckCircle, Fingerprint } from "lucide-react";
import "./App.css";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email:"", password:"", rememberMe:false });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);

    if (!formData.email || !formData.password) {
      setError("Please enter your email and password"); setLoading(false); return;
    }

    try {
      const res = await axios.post("/login", {
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe,
      });

      const storage = formData.rememberMe ? localStorage : sessionStorage;
      storage.setItem("token", res.data.token);
      storage.setItem("user", JSON.stringify(res.data.user));
      setSuccess("Login successful! Taking you to your dashboard...");
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
      <div className="signup-background-pattern"/>
      <div className="signup-card">
        <div className="signup-header">
          <Building2 size={48} color="white"/>
          <h1 className="signup-title">Taifa Systems</h1>
          <p className="signup-subtitle">Employee Management System</p>
        </div>
        <form onSubmit={handleSubmit} className="signup-form">
          <h2 className="signup-form-title">Welcome Back</h2>
          <p className="signup-welcome-text">Sign in to access your employee dashboard</p>

          {error   && <div className="signup-alert-error"><AlertCircle size={18}/><span style={{whiteSpace:"pre-wrap"}}>{error}</span></div>}
          {success && <div className="signup-alert-success"><CheckCircle size={18}/><span>{success}</span></div>}

          <div className="signup-input-group">
            <label className="signup-label">Email Address</label>
            <div className="signup-input-wrapper">
              <Mail size={18} className="signup-input-icon"/>
              <input type="email" name="email" placeholder="john.doe@taifasystems.com" value={formData.email} onChange={handleChange} className="signup-input" autoComplete="email"/>
            </div>
          </div>

          <div className="signup-input-group">
            <label className="signup-label">Password</label>
            <div className="signup-input-wrapper">
              <Lock size={18} className="signup-input-icon"/>
              <input type={showPassword?"text":"password"} name="password" placeholder="Enter your password" value={formData.password} onChange={handleChange} className="signup-input" autoComplete="current-password"/>
              <button type="button" onClick={()=>setShowPassword(!showPassword)} className="signup-eye-button">
                {showPassword?<EyeOff size={18}/>:<Eye size={18}/>}
              </button>
            </div>
          </div>

          <div className="signup-options-row">
            <label className="signup-checkbox-label">
              <input type="checkbox" name="rememberMe" checked={formData.rememberMe} onChange={handleChange} className="signup-checkbox"/>
              <span className="signup-checkbox-text">Remember me</span>
            </label>
          </div>

          <button type="submit" disabled={loading} className="signup-button">
            {loading
              ? <span>Signing in...</span>
              : <span className="signup-button-content"><LogIn size={18}/><span>Sign In</span></span>
            }
          </button>

          <p className="signup-text">Don't have an account? <Link to="/signup" className="signup-link">Create Account</Link></p>

          <div className="signup-security-note">
            <Fingerprint size={14}/>
            <span>Your data is protected with enterprise-grade security</span>
          </div>
        </form>
      </div>
    </div>
  );
}
export default Login;
