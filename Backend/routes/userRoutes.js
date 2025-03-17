import { Router } from "express";
import { sign } from "jsonwebtoken";
import User, { findOne } from "../models/User.js";
import { verifyUser } from "../middlewares/authMiddleware.js";

const router = Router();

// @route POST /api/users/register
// @desc register a new user
// @access Public
router.post("/register", async (req, res) => {
  const { name, email, password, phone } = req.body;
  try {
    // Registration Logic
    let user = await findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });
    user = new User({ name, email, password, phone });
    await user.save();

    // Create JWT Payload
    const payload = { user: { id: user._id, role: user.role } };
    // Sign and return the token along with user data
    sign(payload, process.env.JWT_SECRET, { expiresIn: "6h" }, (err, token) => {
      if (err) throw err;

      // send the user and token in response
      res.status(201).json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
        token,
      });
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
});

// @route POST /api/users/register
// @desc Authenticate user
// @access Public
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    // Find the user by email
    let user = await findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid Credentials" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid Credentials" });

    // Create JWT Payload
    const payload = { user: { id: user._id, role: user.role } };
    // Sign and return the token along with user data
    sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "12h" },
      (err, token) => {
        if (err) throw err;

        // send the user and token in response
        res.json({
          success: true,
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
          },
          token,
        });
      }
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route GET /api/users/profile
// @desc Get the logged-in users profile
// @access Private
router.get("/profile", verifyUser, async (req, res) => {
  res.json(req.user);
});

// @route GET /api/users/role
// @desc Get the logged-in users role
// @access Private
router.get("/role", verifyUser, (req, res) => {
  res.json({
    message: "User authenticated",
    user: req.user,
  });
});

export default router;
