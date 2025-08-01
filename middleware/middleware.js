const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    // Optional logging
    //console.warn("JWT Error:", err.message);

    // Return neutral response
    return res.status(403).json({ error: "Exception as Access denied" });
  }
}


module.exports = authMiddleware;
