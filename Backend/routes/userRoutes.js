const express = require("express")
const User = require("../models/User")
const jwt = require("jsonwebtoken")
const { verifyRole, verifyUser } = require("../middlewares/authMiddleware")
const router = express.Router()

// @route POST /api/users/register
// @desc register a new user
// @access Public
router.post("/register", async (req, res) => {
  const { name, email, password, phone } = req.body
  try {
    // Registration Logic
    let user = await User.findOne({ email })
    if (user) return res.status(400).json({ message: "User already exists" })
    user = new User({ name, email, password, phone })
    await user.save()

    // Create JWT Payload
    const payload = { user: { id: user._id, role: user.role } }
    // Sign and return the token along with user data
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "12h" }, (err, token) => {
      if (err) throw err

      // send the user and token in response
      res.status(201).json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
        token,
      })
    })
  } catch (error) {
    console.log(error)
    res.status(500).send("Server Error")
  }
})

// @route POST /api/users/login
// @desc Authenticate user
// @access Public
router.post("/login", async (req, res) => {
  const { email, password } = req.body
  try {
    // Find the user by email
    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ message: "Invalid Credentials" })

    const isMatch = await user.comparePassword(password)
    if (!isMatch) return res.status(400).json({ message: "Invalid Credentials" })

    // Create JWT Payload
    const payload = { user: { id: user._id, role: user.role } }
    // Sign and return the token along with user data
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "12h" }, (err, token) => {
      if (err) throw err

      // send the user and token in response
      res.json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
        token,
      })
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Server Error" })
  }
})

// @route GET /api/users/profile
// @desc Get the logged-in users profile
// @access Private
router.get("/profile", verifyUser, async (req, res) => {
  res.json(req.user)
})

// @route GET /api/users/role
// @desc Get the logged-in users role
// @access Private
router.get("/role", verifyUser, (req, res) => {
  res.json({
    message: "User authenticated",
    user: req.user,
  })
})

// @route GET /api/users
// @desc Get all users with filtering, sorting, search and pagination
// @access Private (Admin only)
router.get("/", verifyUser, verifyRole("admin"), async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = "createdAt", direction = "desc", role, search } = req.query

    // Build query
    const query = {}

    // Role filter
    if (role && role !== "all") {
      query.role = role
    }

    // Search functionality
    if (search) {
      const searchRegex = new RegExp(search, "i")
      query.$or = [
        { name: { $regex: searchRegex } },
        { email: { $regex: searchRegex } },
        { phone: { $regex: searchRegex } },
      ]
    }

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit)

    // Sort options
    const sortOptions = {}
    sortOptions[sort] = direction === "asc" ? 1 : -1

    // Execute query with pagination
    const users = await User.find(query).select("-password").sort(sortOptions).skip(skip).limit(Number(limit))

    // Get total count for pagination
    const total = await User.countDocuments(query)

    res.json({
      users,
      pagination: {
        totalPages: Math.ceil(total / Number(limit)),
        currentPage: Number(page),
        total,
      },
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    res.status(500).json({ message: "Server Error" })
  }
})

// @route PATCH /api/users/:id/role
// @desc Update user role
// @access Private (Admin only)
router.patch("/:id/role", verifyUser, verifyRole("admin"), async (req, res) => {
  try {
    const { role } = req.body

    // Validate role
    if (!["customer", "admin", "moderator", "employee"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" })
    }

    // Find user and update role
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-password")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json(user)
  } catch (error) {
    console.error("Error updating user role:", error)
    res.status(500).json({ message: "Server Error" })
  }
})

// @route DELETE /api/users/:id
// @desc Delete a user
// @access Private (Admin only)
router.delete("/:id", verifyUser, verifyRole("admin"), async (req, res) => {
  try {
    // Prevent admin from deleting themselves
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: "You cannot delete your own account" })
    }

    const user = await User.findByIdAndDelete(req.params.id)

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    res.status(500).json({ message: "Server Error" })
  }
})

module.exports = router

