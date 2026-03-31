import React, { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard, Users, Shield, Settings, LogOut,
  Bell, Search, Filter, ChevronDown, X, Edit2,
  Mail, Phone, Calendar, Building2, User, Check,
  Briefcase, MapPin, Clock, Star, Menu, ChevronRight,
  UserCheck, UserX, Activity, TrendingUp
} from "lucide-react";
import "./Dashboard.css";

// ─── Mock Data ───────────────────────────────────────────────────────────────
const EMPLOYEES = [
  { id: 1, name: "Amara Osei", role: "Software Engineer", department: "Engineering", email: "amara.osei@taifasystems.com", phone: "+254 712 345 678", status: "Active", photo: "AO", joined: "2022-03-15", location: "Nairobi, Kenya", manager: "Daniel Kimani" },
  { id: 2, name: "Priya Sharma", role: "Product Manager", department: "Product", email: "priya.sharma@taifasystems.com", phone: "+254 723 456 789", status: "Active", photo: "PS", joined: "2021-07-22", location: "Nairobi, Kenya", manager: "CEO" },
  { id: 3, name: "Carlos Mendez", role: "UX Designer", department: "Design", email: "carlos.mendez@taifasystems.com", phone: "+254 734 567 890", status: "Away", photo: "CM", joined: "2023-01-10", location: "Mombasa, Kenya", manager: "Priya Sharma" },
  { id: 4, name: "Fatima Al-Hassan", role: "Data Analyst", department: "Analytics", email: "fatima.alhassan@taifasystems.com", phone: "+254 745 678 901", status: "Active", photo: "FA", joined: "2022-11-05", location: "Nairobi, Kenya", manager: "Daniel Kimani" },
  { id: 5, name: "Daniel Kimani", role: "Engineering Lead", department: "Engineering", email: "daniel.kimani@taifasystems.com", phone: "+254 756 789 012", status: "Active", photo: "DK", joined: "2020-05-18", location: "Nairobi, Kenya", manager: "CEO" },
  { id: 6, name: "Yuki Tanaka", role: "DevOps Engineer", department: "Engineering", email: "yuki.tanaka@taifasystems.com", phone: "+254 767 890 123", status: "Inactive", photo: "YT", joined: "2021-09-30", location: "Kisumu, Kenya", manager: "Daniel Kimani" },
  { id: 7, name: "Chidi Okonkwo", role: "Backend Developer", department: "Engineering", email: "chidi.okonkwo@taifasystems.com", phone: "+254 778 901 234", status: "Active", photo: "CO", joined: "2023-04-12", location: "Nairobi, Kenya", manager: "Daniel Kimani" },
  { id: 8, name: "Sofia Andersen", role: "HR Manager", department: "Human Resources", email: "sofia.andersen@taifasystems.com", phone: "+254 789 012 345", status: "Active", photo: "SA", joined: "2020-11-01", location: "Nairobi, Kenya", manager: "CEO" },
  { id: 9, name: "Kwame Boateng", role: "Finance Analyst", department: "Finance", email: "kwame.boateng@taifasystems.com", phone: "+254 790 123 456", status: "Away", photo: "KB", joined: "2022-06-20", location: "Nairobi, Kenya", manager: "CFO" },
  { id: 10, name: "Lena Müller", role: "Marketing Lead", department: "Marketing", email: "lena.muller@taifasystems.com", phone: "+254 701 234 567", status: "Active", photo: "LM", joined: "2021-03-08", location: "Nairobi, Kenya", manager: "CMO" },
  { id: 11, name: "Ayo Williams", role: "Frontend Developer", department: "Engineering", email: "ayo.williams@taifasystems.com", phone: "+254 712 345 000", status: "Active", photo: "AW", joined: "2023-08-14", location: "Nairobi, Kenya", manager: "Daniel Kimani" },
  { id: 12, name: "Mei Chen", role: "QA Engineer", department: "Engineering", email: "mei.chen@taifasystems.com", phone: "+254 723 456 111", status: "Inactive", photo: "MC", joined: "2022-02-28", location: "Nairobi, Kenya", manager: "Daniel Kimani" },
];

const ROLES = [
  { id: 1, title: "Software Engineer", department: "Engineering", count: 4, level: "IC3", permissions: ["read", "write", "deploy"] },
  { id: 2, title: "Engineering Lead", department: "Engineering", count: 1, level: "M2", permissions: ["read", "write", "deploy", "manage"] },
  { id: 3, title: "Product Manager", department: "Product", count: 1, level: "M1", permissions: ["read", "write", "manage"] },
  { id: 4, title: "UX Designer", department: "Design", count: 1, level: "IC2", permissions: ["read", "write"] },
  { id: 5, title: "HR Manager", department: "Human Resources", count: 1, level: "M1", permissions: ["read", "write", "manage", "admin"] },
  { id: 6, title: "Data Analyst", department: "Analytics", count: 1, level: "IC2", permissions: ["read", "analyze"] },
];

const NOTIFICATIONS = [
  { id: 1, text: "Yuki Tanaka's contract renewal is due in 7 days", time: "2 min ago", type: "warning", read: false },
  { id: 2, text: "New employee onboarding: Ayo Williams completed setup", time: "1 hr ago", type: "success", read: false },
  { id: 3, text: "Q2 payroll processing completed successfully", time: "3 hrs ago", type: "success", read: false },
  { id: 4, text: "Carlos Mendez submitted a leave request", time: "5 hrs ago", type: "info", read: false },
  { id: 5, text: "Annual performance review cycle starts next week", time: "1 day ago", type: "info", read: true },
  { id: 6, text: "Mei Chen's probation period ends on April 15", time: "2 days ago", type: "warning", read: true },
];

const DEPARTMENTS = ["All", ...new Set(EMPLOYEES.map(e => e.department))];
const ALL_ROLES_FILTER = ["All", ...new Set(EMPLOYEES.map(e => e.role))];

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

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const Sidebar = ({ activePage, setActivePage, collapsed, setCollapsed }) => {
  const navItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "employees", icon: Users, label: "Employees" },
    { id: "roles", icon: Shield, label: "Roles" },
    { id: "profile", icon: User, label: "My Profile" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];
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
        <button className="sidebar-item sidebar-logout" onClick={() => window.location.href = "/login"}>
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
const DashboardPage = ({ employees, setActivePage, onSelectEmployee }) => {
  const total = employees.length;
  const active = employees.filter(e => e.status === "Active").length;
  const away = employees.filter(e => e.status === "Away").length;
  const inactive = employees.filter(e => e.status === "Inactive").length;
  const recent = employees.slice(0, 5);

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
        <StatCard label="Active" value={active} icon={UserCheck} color="green" sub={`${Math.round(active/total*100)}% of total`} />
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
          <div key={emp.id} className="rtable-row" onClick={() => { setActivePage("employees"); onSelectEmployee(emp); }}>
            <div className="rtable-name">
              <Avatar initials={emp.photo} size="sm"/>
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
      <Avatar initials={emp.photo} size="lg"/>
      <StatusPill status={emp.status}/>
    </div>
    <div className="emp-card-body">
      <h3 className="emp-name">{emp.name}</h3>
      <p className="emp-role">{emp.role}</p>
      <div className="emp-info-row"><Mail size={13}/><span>{emp.email}</span></div>
      <div className="emp-info-row"><Building2 size={13}/><span>{emp.department}</span></div>
    </div>
  </div>
);

// ─── Employees Page ───────────────────────────────────────────────────────────
const EmployeesPage = ({ employees, preSelected, onSelectEmployee }) => {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [deptFilter, setDeptFilter] = useState("All");

  useEffect(() => { if (preSelected) onSelectEmployee(preSelected); }, [preSelected]);

  const filtered = employees.filter(emp => {
    const q = search.toLowerCase();
    const matchSearch = emp.name.toLowerCase().includes(q) || emp.email.toLowerCase().includes(q) || emp.role.toLowerCase().includes(q);
    const matchRole = roleFilter === "All" || emp.role === roleFilter;
    const matchDept = deptFilter === "All" || emp.department === deptFilter;
    return matchSearch && matchRole && matchDept;
  });

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
              {ALL_ROLES_FILTER.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div className="select-wrap">
            <Building2 size={14}/>
            <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="filter-select">
              {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
        </div>
      </div>
      <div className="emp-grid">
        {filtered.length === 0
          ? <div className="empty-state"><Users size={40}/><p>No employees found</p></div>
          : filtered.map(emp => <EmployeeCard key={emp.id} emp={emp} onClick={onSelectEmployee}/>)
        }
      </div>
    </div>
  );
};

// ─── Profile Modal ────────────────────────────────────────────────────────────
const ProfileModal = ({ emp, onClose }) => {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...emp });
  if (!emp) return null;

  const handleSave = () => { setEditing(false); /* In real app: API call */ };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><X size={18}/></button>
        <div className="modal-hero">
          <Avatar initials={emp.photo} size="xl"/>
          <div className="modal-hero-info">
            {editing ? (
              <input className="modal-edit-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})}/>
            ) : <h2 className="modal-name">{form.name}</h2>}
            <p className="modal-role">{form.role}</p>
            <StatusPill status={emp.status}/>
          </div>
        </div>
        <div className="modal-details">
          <div className="modal-detail-row">
            <Mail size={16}/><div>
              <span className="detail-label">Email</span>
              {editing ? <input className="modal-edit-input sm" value={form.email} onChange={e => setForm({...form, email: e.target.value})}/> : <span className="detail-value">{form.email}</span>}
            </div>
          </div>
          <div className="modal-detail-row">
            <Phone size={16}/><div>
              <span className="detail-label">Phone</span>
              {editing ? <input className="modal-edit-input sm" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}/> : <span className="detail-value">{form.phone}</span>}
            </div>
          </div>
          <div className="modal-detail-row">
            <Building2 size={16}/><div>
              <span className="detail-label">Department</span>
              <span className="detail-value">{emp.department}</span>
            </div>
          </div>
          <div className="modal-detail-row">
            <MapPin size={16}/><div>
              <span className="detail-label">Location</span>
              <span className="detail-value">{emp.location}</span>
            </div>
          </div>
          <div className="modal-detail-row">
            <Calendar size={16}/><div>
              <span className="detail-label">Date Joined</span>
              <span className="detail-value">{new Date(emp.joined).toLocaleDateString("en-GB", {day:"numeric",month:"long",year:"numeric"})}</span>
            </div>
          </div>
          <div className="modal-detail-row">
            <Star size={16}/><div>
              <span className="detail-label">Manager</span>
              <span className="detail-value">{emp.manager}</span>
            </div>
          </div>
        </div>
        <div className="modal-actions">
          {editing ? (
            <>
              <button className="btn-primary" onClick={handleSave}><Check size={16}/> Save Changes</button>
              <button className="btn-ghost" onClick={() => { setEditing(false); setForm({...emp}); }}>Cancel</button>
            </>
          ) : (
            <button className="btn-primary" onClick={() => setEditing(true)}><Edit2 size={16}/> Edit Employee</button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Roles Page ───────────────────────────────────────────────────────────────
const RolesPage = () => (
  <div className="page-content">
    <div className="page-header">
      <div>
        <h1 className="page-title">Roles & Permissions</h1>
        <p className="page-subtitle">Manage team roles and access levels</p>
      </div>
      <button className="btn-primary"><Shield size={16}/> Add Role</button>
    </div>
    <div className="roles-grid">
      {ROLES.map(role => (
        <div key={role.id} className="role-card">
          <div className="role-card-header">
            <div className="role-icon"><Shield size={20}/></div>
            <div>
              <h3 className="role-title">{role.title}</h3>
              <p className="role-dept">{role.department}</p>
            </div>
            <span className="role-level">{role.level}</span>
          </div>
          <div className="role-meta">
            <span className="role-count"><Users size={13}/> {role.count} member{role.count !== 1 ? "s" : ""}</span>
          </div>
          <div className="role-perms">
            {role.permissions.map(p => <span key={p} className="perm-tag">{p}</span>)}
          </div>
          <button className="role-edit-btn"><Edit2 size={14}/> Edit Role</button>
        </div>
      ))}
    </div>
  </div>
);

// ─── My Profile Page ──────────────────────────────────────────────────────────
const MyProfilePage = ({ currentUser }) => {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: currentUser.name, role: currentUser.role, email: "admin@taifasystems.com", phone: "+254 700 000 001", department: "Administration", location: "Nairobi, Kenya", bio: "System administrator and lead engineer at Taifa Systems." });
  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Your personal information and account settings</p>
        </div>
        <button className="btn-primary" onClick={() => setEditing(!editing)}>
          {editing ? <><Check size={16}/> Save</> : <><Edit2 size={16}/> Edit Profile</>}
        </button>
      </div>
      <div className="profile-layout">
        <div className="profile-sidebar-card">
          <Avatar initials={currentUser.initials} size="xl"/>
          <h2 className="profile-name">{form.name}</h2>
          <p className="profile-role-label">{form.role}</p>
          <StatusPill status="Active"/>
          <div className="profile-stats">
            <div><span className="pstat-val">4.2 yrs</span><span className="pstat-label">Tenure</span></div>
            <div><span className="pstat-val">12</span><span className="pstat-label">Projects</span></div>
            <div><span className="pstat-val">98%</span><span className="pstat-label">Rating</span></div>
          </div>
        </div>
        <div className="profile-main-card">
          <h3 className="profile-section-title">Personal Information</h3>
          <div className="profile-fields">
            {[
              { label: "Full Name", key: "name", icon: User },
              { label: "Email", key: "email", icon: Mail },
              { label: "Phone", key: "phone", icon: Phone },
              { label: "Department", key: "department", icon: Building2 },
              { label: "Location", key: "location", icon: MapPin },
            ].map(({ label, key, icon: Icon }) => (
              <div key={key} className="profile-field">
                <label className="profile-field-label"><Icon size={14}/> {label}</label>
                {editing
                  ? <input className="profile-input" value={form[key]} onChange={e => setForm({...form, [key]: e.target.value})}/>
                  : <span className="profile-field-value">{form[key]}</span>
                }
              </div>
            ))}
            <div className="profile-field profile-field-full">
              <label className="profile-field-label"><Briefcase size={14}/> Bio</label>
              {editing
                ? <textarea className="profile-input" rows={3} value={form.bio} onChange={e => setForm({...form, bio: e.target.value})}/>
                : <span className="profile-field-value">{form.bio}</span>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Settings Page ────────────────────────────────────────────────────────────
const SettingsPage = () => {
  const [settings, setSettings] = useState({ emailNotifs: true, pushNotifs: false, twoFactor: true, darkMode: false, language: "English", timezone: "Africa/Nairobi" });
  const toggle = key => setSettings(s => ({...s, [key]: !s[key]}));
  const Toggle = ({ checked, onChange }) => (
    <button className={`toggle ${checked ? "toggle-on" : ""}`} onClick={onChange}>
      <span className="toggle-knob"/>
    </button>
  );
  return (
    <div className="page-content">
      <div className="page-header"><div>
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Configure your account preferences</p>
      </div></div>
      <div className="settings-grid">
        <div className="settings-card">
          <h3 className="settings-section-title"><Bell size={18}/> Notifications</h3>
          {[["emailNotifs","Email Notifications","Receive updates via email"],["pushNotifs","Push Notifications","Browser push alerts"]].map(([key, label, desc]) => (
            <div key={key} className="settings-row">
              <div><p className="settings-label">{label}</p><p className="settings-desc">{desc}</p></div>
              <Toggle checked={settings[key]} onChange={() => toggle(key)}/>
            </div>
          ))}
        </div>
        <div className="settings-card">
          <h3 className="settings-section-title"><Shield size={18}/> Security</h3>
          <div className="settings-row">
            <div><p className="settings-label">Two-Factor Authentication</p><p className="settings-desc">Add an extra layer of security</p></div>
            <Toggle checked={settings.twoFactor} onChange={() => toggle("twoFactor")}/>
          </div>
          <div className="settings-row">
            <div><p className="settings-label">Change Password</p><p className="settings-desc">Update your login credentials</p></div>
            <button className="btn-ghost-sm">Update</button>
          </div>
        </div>
        <div className="settings-card">
          <h3 className="settings-section-title"><Settings size={18}/> Preferences</h3>
          <div className="settings-row">
            <div><p className="settings-label">Language</p><p className="settings-desc">Display language</p></div>
            <select className="filter-select" value={settings.language} onChange={e => setSettings({...settings, language: e.target.value})}>
              <option>English</option><option>Swahili</option><option>French</option>
            </select>
          </div>
          <div className="settings-row">
            <div><p className="settings-label">Timezone</p><p className="settings-desc">Local timezone for dates</p></div>
            <select className="filter-select" value={settings.timezone} onChange={e => setSettings({...settings, timezone: e.target.value})}>
              <option>Africa/Nairobi</option><option>UTC</option><option>Europe/London</option>
            </select>
          </div>
        </div>
        <div className="settings-card settings-danger">
          <h3 className="settings-section-title danger-title">⚠ Danger Zone</h3>
          <div className="settings-row">
            <div><p className="settings-label">Deactivate Account</p><p className="settings-desc">Temporarily disable your account</p></div>
            <button className="btn-danger-sm">Deactivate</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Root Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const stored = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "{}");
  const currentUser = { name: stored.name || "Admin User", role: stored.role || "Administrator", initials: (stored.name || "Admin User").split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase() };

  const [activePage, setActivePage] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [preSelectedEmployee, setPreSelectedEmployee] = useState(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const handler = e => { if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false); };
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
          {activePage === "dashboard" && <DashboardPage employees={EMPLOYEES} setActivePage={setActivePage} onSelectEmployee={handleDashboardSelectEmployee}/>}
          {activePage === "employees" && <EmployeesPage employees={EMPLOYEES} preSelected={preSelectedEmployee} onSelectEmployee={handleSelectEmployee}/>}
          {activePage === "roles" && <RolesPage/>}
          {activePage === "profile" && <MyProfilePage currentUser={currentUser}/>}
          {activePage === "settings" && <SettingsPage/>}
        </div>
      </div>
      {selectedEmployee && <ProfileModal emp={selectedEmployee} onClose={() => setSelectedEmployee(null)}/>}
    </div>
  );
}
