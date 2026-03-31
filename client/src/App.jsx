import React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import Signup from './signup.jsx'
import Login from './login.jsx'
import Dashboard from './Dashboard.jsx'
import './App.css'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/"          element={<Navigate to="/signup" />} />
        <Route path="/signup"    element={<Signup />} />
        <Route path="/login"     element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  )
}

export default App
