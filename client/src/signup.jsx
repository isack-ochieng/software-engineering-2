import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff, Briefcase, Building2, CheckCircle, AlertCircle } from "lucide-react";
import "./App.css";

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name:"", email:"", password:"", confirmPassword:"", employeeId:"", role:"", department:"" });
  const [showPassword, setShowPassword]             = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const getStrength = (p) => {
    let s = 0;
    if (p.length >= 8) s++; if (p.match(/[a-z]/)) s++; if (p.match(/[A-Z]/)) s++;
    if (p.match(/[0-9]/)) s++; if (p.match(/[^a-zA-Z0-9]/)) s++;
    return s;
  };
  const ps    = getStrength(formData.password);
  const stTxt = !formData.password ? "" : ps <= 2 ? "Weak" : ps <= 4 ? "Medium" : "Strong";
  const stCol = !formData.password ? "" : ps <= 2 ? "#ff4444" : ps <= 4 ? "#ffa500" : "#00c851";

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);

    if (!formData.name || !formData.email || !formData.password || !formData.employeeId) {
      setError("Please fill in all required fields (*)"); setLoading(false); return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match"); setLoading(false); return;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long"); setLoading(false); return;
    }

    try {
      const res = await axios.post("/signup", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        employeeId: formData.employeeId,
        role: formData.role || "employee",
        department: formData.department || "General",
      });

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
          {error   && <div className="signup-alert-error"><AlertCircle size={18}/><span style={{whiteSpace:"pre-wrap"}}>{error}</span></div>}
          {success && <div className="signup-alert-success"><CheckCircle size={18}/><span>{success}</span></div>}

          <div className="signup-input-group">
            <label className="signup-label">Full Name <span className="signup-required">*</span></label>
            <div className="signup-input-wrapper">
              <User size={18} className="signup-input-icon"/>
              <input type="text" name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} className="signup-input"/>
            </div>
          </div>

          <div className="signup-input-group">
            <label className="signup-label">Employee ID <span className="signup-required">*</span></label>
            <div className="signup-input-wrapper">
              <Briefcase size={18} className="signup-input-icon"/>
              <input type="text" name="employeeId" placeholder="EMP-2024-001" value={formData.employeeId} onChange={handleChange} className="signup-input"/>
            </div>
          </div>

          <div className="signup-input-group">
            <label className="signup-label">Email Address <span className="signup-required">*</span></label>
            <div className="signup-input-wrapper">
              <Mail size={18} className="signup-input-icon"/>
              <input type="email" name="email" placeholder="john.doe@taifasystems.com" value={formData.email} onChange={handleChange} className="signup-input"/>
            </div>
          </div>

          <div className="signup-row">
            <div className="signup-input-group" style={{flex:1,marginRight:"1rem"}}>
              <label className="signup-label">Role</label>
              <select name="role" value={formData.role} onChange={handleChange} className="signup-select">
                <option value="">Select Role</option>
                <option value="developer">Developer</option>
                <option value="designer">Designer</option>
                <option value="manager">Manager</option>
                <option value="hr">HR Specialist</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            <div className="signup-input-group" style={{flex:1}}>
              <label className="signup-label">Department</label>
              <select name="department" value={formData.department} onChange={handleChange} className="signup-select">
                <option value="">Select Department</option>
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Sales & Marketing">Sales & Marketing</option>
                <option value="IT Support">IT Support</option>
              </select>
            </div>
          </div>

          <div className="signup-input-group">
            <label className="signup-label">Password <span className="signup-required">*</span></label>
            <div className="signup-input-wrapper">
              <Lock size={18} className="signup-input-icon"/>
              <input type={showPassword?"text":"password"} name="password" placeholder="Create a strong password" value={formData.password} onChange={handleChange} className="signup-input"/>
              <button type="button" onClick={()=>setShowPassword(!showPassword)} className="signup-eye-button">
                {showPassword?<EyeOff size={18}/>:<Eye size={18}/>}
              </button>
            </div>
            {formData.password && (
              <div className="signup-password-strength">
                <div className="signup-strength-bar" style={{width:`${(ps/5)*100}%`,backgroundColor:stCol}}/>
                <span className="signup-strength-text" style={{color:stCol}}>{stTxt} Password</span>
              </div>
            )}
          </div>

          <div className="signup-input-group">
            <label className="signup-label">Confirm Password <span className="signup-required">*</span></label>
            <div className="signup-input-wrapper">
              <Lock size={18} className="signup-input-icon"/>
              <input type={showConfirmPassword?"text":"password"} name="confirmPassword" placeholder="Confirm your password" value={formData.confirmPassword} onChange={handleChange} className="signup-input"/>
              <button type="button" onClick={()=>setShowConfirmPassword(!showConfirmPassword)} className="signup-eye-button">
                {showConfirmPassword?<EyeOff size={18}/>:<Eye size={18}/>}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="signup-button">
            {loading ? "Creating Account..." : "Create Account"}
          </button>
          <p className="signup-text">Already have an account? <Link to="/login" className="signup-link">Sign in</Link></p>
        </form>
      </div>
    </div>
  );
}
export default Signup;
