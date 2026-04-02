import React, { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard, Users, Bell, Search, Filter, ChevronDown, X, Edit2,
  Mail, Phone, Calendar, Building2, User, Check,
  Briefcase, MapPin, Clock, Star, Menu, ChevronRight,
  UserCheck, UserX, Activity, TrendingUp, LogOut
} from "lucide-react";
import "./Dashboard.css";
import api from "./api";

// ─── Avatar Component ─────────────────────────────────────────────────────────
const Avatar = ({ initials, size = "md", color }) => {
  const colors = ["av-blue","av-purple","av-teal","av-amber","av-rose","av-indigo","av-emerald","av-orange"];
  const colorClass = color || colors[initials.charCodeAt(0) % colors.length];
  return <div className={`avatar avatar-${size} ${colorClass}`}>{initials}</div>;
};

// ─── Status Pill ──────────────────────────────────────────────────────────────
const StatusPill = ({ status }) => (
  <span className={`status-pill status-${status.toLowerCase()}`}>
    <span className="status-dot" />
    {status}
  </span>
);

// ─── Top Bar ──────────────────────────────────────────────────────────────────
const TopBar = ({ currentUser, notifications, onBellClick, showNotifications, onMarkAllRead, notifRef }) => {
  const unread = notifications.filter(n => !n.read).length;
  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="topbar-breadcrumb">
          <span className="topbar-brand">Taifa Systems</span>
          <ChevronRight size={14} className="breadcrumb-sep" />
          <span className="topbar-page">Dashboard</span>
        </div>
      </div>
      <div className="topbar-right">
        <div className="topbar-notif-wrap" ref={notifRef}>
          <button className="notif-btn" onClick={onBellClick}>
            <Bell size={20} />
            {unread > 0 && <span className="notif-badge">{unread}</span>}
          </button>
          {showNotifications && (
            <div className="notif-panel">
              <div className="notif-header">
                <span className="notif-title">Notifications</span>
                <button className="notif-mark-all" onClick={onMarkAllRead}>Mark all read</button>
              </div>
              <div className="notif-list">
                {notifications.map(n => (
                  <div key={n.id} className={`notif-item ${n.read ? "notif-read" : ""}`}>
                    <div className={`notif-icon notif-${n.type}`}>
                      {n.type === "warning" ? <Clock size={14}/> : n.type === "success" ? <Check size={14}/> : <Bell size={14}/>}
                    </div>
                    <div className="notif-content">
                      <p className="notif-text">{n.text}</p>
                      <span className="notif-time">{n.time}</span>
                    </div>
                    {!n.read && <div className="notif-unread-dot"/>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="topbar-user">
          <Avatar initials={currentUser.initials} size="sm" />
          <div className="topbar-user-info">
            <span className="topbar-user-name">{currentUser.name}</span>
            <span className="topbar-user-role">{currentUser.role}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Sidebar (only Dashboard & Employees) ─────────────────────────────────────
const Sidebar = ({ activePage, setActivePage, collapsed, setCollapsed }) => {
  const navItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "employees", icon: Users, label: "Employees" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <aside className={`sidebar ${collapsed ? "sidebar-collapsed" : ""}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Building2 size={24} />
          {!collapsed && <span className="sidebar-brand">Taifa</span>}
        </div>
        <button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)}>
          <Menu size={18} />
        </button>
      </div>
      <nav className="sidebar-nav">
        {navItems.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            className={`sidebar-item ${activePage === id ? "sidebar-item-active" : ""}`}
            onClick={() => setActivePage(id)}
            title={collapsed ? label : ""}
          >
            <Icon size={20} />
            {!collapsed && <span>{label}</span>}
            {activePage === id && !collapsed && <ChevronRight size={14} className="sidebar-active-arrow"/>}
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button className="sidebar-item sidebar-logout" onClick={handleLogout}>
          <LogOut size={20} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, color, sub }) => (
  <div className={`stat-card stat-${color}`}>
    <div className="stat-icon"><Icon size={22}/></div>
    <div className="stat-body">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  </div>
);

// ─── Dashboard Home Page ──────────────────────────────────────────────────────
const DashboardPage = ({ employees, setActivePage, onSelectEmployee, loading }) => {
  const total = employees.length;
  const active = employees.filter(e => e.status === "Active").length;
  const away = employees.filter(e => e.status === "Away").length;
  const inactive = employees.filter(e => e.status === "Inactive").length;
  const recent = [...employees].sort((a, b) => new Date(b.joined) - new Date(a.joined)).slice(0, 5);

  if (loading) return <div className="page-content"><p>Loading dashboard...</p></div>;

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back! Here's what's happening today.</p>
        </div>
      </div>
      <div className="stat-grid">
        <StatCard label="Total Employees" value={total} icon={Users} color="blue" sub="All staff" />
        <StatCard label="Active" value={active} icon={UserCheck} color="green" sub={`${total ? Math.round(active/total*100) : 0}% of total`} />
        <StatCard label="Away" value={away} icon={Activity} color="amber" sub="On leave/remote" />
        <StatCard label="Inactive" value={inactive} icon={UserX} color="red" sub="Needs attention" />
      </div>
      <div className="section-header">
        <h2 className="section-title">Recent Employees</h2>
        <button className="btn-link" onClick={() => setActivePage("employees")}>View all →</button>
      </div>
      <div className="recent-table">
        <div className="rtable-head">
          <span>Name</span><span>Role</span><span>Department</span><span>Status</span>
        </div>
        {recent.map(emp => (
          <div key={emp._id || emp.id} className="rtable-row" 
               onClick={() => { setActivePage("employees"); onSelectEmployee(emp); }}>
            <div className="rtable-name">
              <Avatar initials={emp.photo || emp.name.split(" ").map(n => n[0]).join("").slice(0,2)} size="sm"/>
              <span>{emp.name}</span>
            </div>
            <span className="rtable-role">{emp.role}</span>
            <span className="rtable-dept">{emp.department}</span>
            <StatusPill status={emp.status}/>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Employee Card ────────────────────────────────────────────────────────────
const EmployeeCard = ({ emp, onClick }) => (
  <div className="emp-card" onClick={() => onClick(emp)}>
    <div className="emp-card-top">
      <Avatar initials={emp.photo || emp.name.split(" ").map(n => n[0]).join("").slice(0,2)} size="lg"/>
      <StatusPill status={emp.status}/>
    </div>
    <div className="emp-card-body">
      <h3 className="emp-name">{emp.name}</h3>
      <p className="emp-role">{emp.role}</p>
      <div className="emp-info-row"><Mail size={13}/><span>{emp.email}</span></div>
      <div className="emp-info-row"><Phone size={13}/><span>{emp.phone || "Not provided"}</span></div>
      <div className="emp-info-row"><Building2 size={13}/><span>{emp.department}</span></div>
      <div className="emp-info-row"><Briefcase size={13}/><span>{emp.position || emp.role}</span></div>
    </div>
  </div>
);

// ─── Employees Page ───────────────────────────────────────────────────────────
const EmployeesPage = ({ employees, preSelected, onSelectEmployee, loading }) => {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [deptFilter, setDeptFilter] = useState("All");

  useEffect(() => { if (preSelected) onSelectEmployee(preSelected); }, [preSelected]);

  const departments = ["All", ...new Set(employees.map(e => e.department))];
  const allRoles = ["All", ...new Set(employees.map(e => e.role))];

  const filtered = employees.filter(emp => {
    const q = search.toLowerCase();
    const matchSearch = emp.name.toLowerCase().includes(q) || 
                       emp.email.toLowerCase().includes(q) || 
                       emp.role.toLowerCase().includes(q);
    const matchRole = roleFilter === "All" || emp.role === roleFilter;
    const matchDept = deptFilter === "All" || emp.department === deptFilter;
    return matchSearch && matchRole && matchDept;
  });

  if (loading) return <div className="page-content"><p>Loading employees...</p></div>;

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Employees</h1>
          <p className="page-subtitle">{filtered.length} of {employees.length} employees shown</p>
        </div>
      </div>
      <div className="filter-bar">
        <div className="search-wrap">
          <Search size={16} className="search-icon"/>
          <input className="search-input" placeholder="Search by name, email, role..." value={search} onChange={e => setSearch(e.target.value)}/>
          {search && <button className="search-clear" onClick={() => setSearch("")}><X size={14}/></button>}
        </div>
        <div className="filter-selects">
          <div className="select-wrap">
            <Filter size={14}/>
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="filter-select">
              {allRoles.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div className="select-wrap">
            <Building2 size={14}/>
            <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="filter-select">
              {departments.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
        </div>
      </div>
      <div className="emp-grid">
        {filtered.length === 0
          ? <div className="empty-state"><Users size={40}/><p>No employees found</p></div>
          : filtered.map(emp => <EmployeeCard key={emp._id || emp.id} emp={emp} onClick={onSelectEmployee}/>)
        }
      </div>
    </div>
  );
};

// ─── Profile Modal with Edit Own Profile Only & Full Editable Fields ─────────
const ProfileModal = ({ emp, onClose, currentUser, onEmployeeUpdated }) => {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(emp ? { ...emp } : {});
  const [saving, setSaving] = useState(false);

  if (!emp) return null;

  const isOwnProfile = currentUser.id === emp._id || currentUser.id === emp.id;

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await api.put(`/api/employees/${emp._id}`, {
        name: form.name,
        email: form.email,
        phone: form.phone,
        department: form.department,
      });
      // Update the local employee data
      onEmployeeUpdated(response.data);
      setEditing(false);
      // Optionally show a notification (can be passed from parent)
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><X size={18}/></button>
        <div className="modal-hero">
          <Avatar initials={emp.photo || emp.name.split(" ").map(n => n[0]).join("").slice(0,2)} size="xl"/>
          <div className="modal-hero-info">
            {editing ? (
              <input 
                className="modal-edit-input" 
                value={form.name} 
                onChange={e => setForm({...form, name: e.target.value})}
                placeholder="Full Name"
              />
            ) : (
              <h2 className="modal-name">{form.name}</h2>
            )}
            <p className="modal-role">{form.role}</p>
            <StatusPill status={emp.status}/>
          </div>
        </div>
        <div className="modal-details">
          {/* Email */}
          <div className="modal-detail-row">
            <Mail size={16}/>
            <div className="detail-group">
              <span className="detail-label">Email</span>
              {editing ? (
                <input 
                  className="modal-edit-input" 
                  value={form.email || ""} 
                  onChange={e => setForm({...form, email: e.target.value})}
                />
              ) : (
                <span className="detail-value">{form.email || "—"}</span>
              )}
            </div>
          </div>
          {/* Phone */}
          <div className="modal-detail-row">
            <Phone size={16}/>
            <div className="detail-group">
              <span className="detail-label">Phone</span>
              {editing ? (
                <input 
                  className="modal-edit-input" 
                  value={form.phone || ""} 
                  onChange={e => setForm({...form, phone: e.target.value})}
                />
              ) : (
                <span className="detail-value">{form.phone || "—"}</span>
              )}
            </div>
          </div>
          {/* Department */}
          <div className="modal-detail-row">
            <Building2 size={16}/>
            <div className="detail-group">
              <span className="detail-label">Department</span>
              {editing ? (
                <input 
                  className="modal-edit-input" 
                  value={form.department || ""} 
                  onChange={e => setForm({...form, department: e.target.value})}
                />
              ) : (
                <span className="detail-value">{form.department || "—"}</span>
              )}
            </div>
          </div>
          {/* Additional read-only fields for completeness */}
          <div className="modal-detail-row">
            <Briefcase size={16}/>
            <div className="detail-group">
              <span className="detail-label">Position</span>
              <span className="detail-value">{form.position || form.role || "—"}</span>
            </div>
          </div>
          <div className="modal-detail-row">
            <Calendar size={16}/>
            <div className="detail-group">
              <span className="detail-label">Joined</span>
              <span className="detail-value">{form.joined ? new Date(form.joined).toLocaleDateString() : "—"}</span>
            </div>
          </div>
        </div>
        <div className="modal-actions">
          {isOwnProfile && (
            editing ? (
              <>
                <button className="btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : <><Check size={16}/> Save Changes</>}
                </button>
                <button className="btn-ghost" onClick={() => { setEditing(false); setForm({...emp}); }}>Cancel</button>
              </>
            ) : (
              <button className="btn-primary" onClick={() => setEditing(true)}><Edit2 size={16}/> Edit My Profile</button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Root Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const storedUser = JSON.parse(
    localStorage.getItem("user") || sessionStorage.getItem("user") || "{}"
  );
  
  const currentUser = {
    id: storedUser.id || storedUser._id,   // ensure we have an ID for comparison
    name: storedUser.name || "Admin User",
    role: storedUser.role || "Administrator",
    initials: (storedUser.name || "Admin User").split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase()
  };

  const [activePage, setActivePage] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Welcome to your dashboard", time: "Just now", type: "success", read: false }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [preSelectedEmployee, setPreSelectedEmployee] = useState(null);
  const notifRef = useRef(null);

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/api/employees");
        setEmployees(res.data || []);
        // Add a success notification
        setNotifications(prev => [
          { id: Date.now(), text: "Employee data loaded successfully", time: "Just now", type: "success", read: false },
          ...prev
        ]);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.response?.data?.message || "Failed to load employees");
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  // Close notifications on outside click
  useEffect(() => {
    const handler = e => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = () => setNotifications(ns => ns.map(n => ({...n, read: true})));

  const handleSelectEmployee = emp => {
    setSelectedEmployee(emp);
    setPreSelectedEmployee(null);
  };

  const handleDashboardSelectEmployee = emp => {
    setPreSelectedEmployee(emp);
    setActivePage("employees");
    setTimeout(() => setSelectedEmployee(emp), 100);
  };

  const handleEmployeeUpdated = (updatedEmployee) => {
    // Update the employees list with the new data
    setEmployees(prev => prev.map(emp => 
      (emp._id === updatedEmployee._id || emp.id === updatedEmployee.id) ? updatedEmployee : emp
    ));
    // Also update the selected employee if it's the same one
    setSelectedEmployee(prev => {
      if (prev && (prev._id === updatedEmployee._id || prev.id === updatedEmployee.id)) {
        return updatedEmployee;
      }
      return prev;
    });
    // Add a notification
    setNotifications(prev => [
      { id: Date.now(), text: "Profile updated successfully", time: "Just now", type: "success", read: false },
      ...prev
    ]);
  };

  if (error) return <div className="page-content"><p style={{color: 'red'}}>{error}</p></div>;

  return (
    <div className={`dashboard-root ${collapsed ? "sidebar-collapsed-root" : ""}`}>
      <Sidebar activePage={activePage} setActivePage={setActivePage} collapsed={collapsed} setCollapsed={setCollapsed}/>
      <div className="dashboard-main">
        <TopBar
          currentUser={currentUser}
          notifications={notifications}
          onBellClick={() => setShowNotifications(v => !v)}
          showNotifications={showNotifications}
          onMarkAllRead={markAllRead}
          notifRef={notifRef}
        />
        <div className="dashboard-body">
          {activePage === "dashboard" && 
            <DashboardPage 
              employees={employees} 
              setActivePage={setActivePage} 
              onSelectEmployee={handleDashboardSelectEmployee}
              loading={loading}
            />}
          {activePage === "employees" && 
            <EmployeesPage 
              employees={employees} 
              preSelected={preSelectedEmployee} 
              onSelectEmployee={handleSelectEmployee}
              loading={loading}
            />}
        </div>
      </div>
      {selectedEmployee && 
        <ProfileModal 
          emp={selectedEmployee} 
          onClose={() => setSelectedEmployee(null)} 
          currentUser={currentUser}
          onEmployeeUpdated={handleEmployeeUpdated}
        />
      }
    </div>
  );
}