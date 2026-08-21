require('dotenv').config();
const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET || 'key';

function authMiddleware(req, res, next) {
  let token = req.headers.token
  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }
  token = token.replace(/^"|"$/g, '').trim();
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    if (decoded.userId) {
      req.userId = decoded.userId
      return next()
    } else {
      return res.status(403).json({ message: "Token is invalid or not found" })
    }
  } catch (e) {
    return res.status(403).json({ message: "Token is invalid or not found", error: e.message })
  }
}

module.exports = {
  authMiddleware
}
