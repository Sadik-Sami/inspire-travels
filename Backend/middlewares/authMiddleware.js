import jwt from "jsonwebtoken";
import User from "../models/User.js";

const { verify } = jwt;

// Middleware to protect routes
const verifyUser = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.user.id).select("-password"); //excludeing password
      next();
    } catch (error) {
      console.log("Token Verification Failed", error);
      res.status(401).json({ message: "Not Authorized, token failed" });
    }
  } else {
    res.status(401).json({ message: "Not Authorized, No token provided" });
  }
};
// Role-based access control
const verifyRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access Forbidden" });
    }
    next();
  };
};

export default { verifyUser, verifyRole };
