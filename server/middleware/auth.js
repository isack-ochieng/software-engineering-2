// middleware/auth.js
const jwt = require("jsonwebtoken");
const JWT_SECRET = "taifa-secret-2026"; // Move to .env later

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid or expired token" });
    req.user = user; // { userId, email, role, name }
    next();
  });
};

module.exports = authenticateToken;