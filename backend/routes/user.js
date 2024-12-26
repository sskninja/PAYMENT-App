// backend/routes/user.js
const express = require("express");

const router = express.Router();
const zod = require("zod");
const { User, Account } = require("../db");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");

const signupBody = zod.object({
  username: zod.string().email(),
  firstName: zod.string(),
  lastName: zod.string(),
  password: zod.string().min(6, "Password must be at least 6 characters long"),
});

router.post("/signup", async (req, res) => {
  try {
    // Validate the request body with Zod
    const parseResult = signupBody.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        message: "Invalid inputs",
        errors: parseResult.error.issues,
      });
    }

    // Use the parsed data instead of req.body directly
    const { username, password, firstName, lastName } = parseResult.data;

    // Check if the user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({
        message: "Email already taken",
      });
    }

    // Create the new user
    const user = await User.create({
      username,
      password, // Note: You should hash this password before storing
      firstName,
      lastName,
    });

    await Account.create({
      userId: user._id,
      balance: 1 + Math.random() * 10000,
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

const signinBody = zod.object({
  username: zod.string().email(),
  password: zod.string(),
});

router.post("/signin", async (req, res) => {
  const { success } = signinBody.safeParse(req.body);
  if (!success) {
    return res.status(411).json({
      message: "Email already taken / Incorrect inputs",
    });
  }

  const user = await User.findOne({
    username: req.body.username,
    password: req.body.password,
  });

  if (user) {
    const token = jwt.sign(
      {
        userId: user._id,
      },
      JWT_SECRET
    );

    res.json({
      message: "Signin Successfully",
      token: token,
    });
    return;
  }

  res.status(411).json({
    message: "Error while logging in",
  });
});

router.get("/bulk", async (req, res) => {
  const filter = req.query.filter || "";

  const users = await User.find({
    $or: [
      {
        firstName: {
          $regex: filter,
        },
      },
      {
        lastName: {
          $regex: filter,
        },
      },
    ],
  });

  res.json({
    user: users.map((user) => ({
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      _id: user._id,
    })),
  });
});

module.exports = router;
