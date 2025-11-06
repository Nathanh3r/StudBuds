import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const protect = async (req, res, next) => {
    try {
      const auth = req.headers.authorization;
      if (!auth || !auth.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Not authorized, token missing" });
      }
      const token = auth.split(" ")[1];
      if (!token) return res.status(401).json({ message: "Not authorized" });
  
      if (!process.env.JWT_SECRET) {
        throw new Error("Missing JWT_SECRET in env");
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      if (!user) return res.status(401).json({ message: "User not found" });
  
      req.user = user;
      next();
    } catch (err) {
      console.error("auth middleware error:", err);
      return res.status(401).json({ message: "Not authorized or token invalid" });  //throw error if proper token not inputted
    }
  };