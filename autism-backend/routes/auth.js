const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();
const nodemailer = require("nodemailer");
const crypto = require("crypto");

// Set up your real SMTP below!
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Signup
router.post("/signup", async (req, res) => {
  console.log("Signup route hit");
  console.log("Body received:", req.body);

  try {
    const {
      email,
      password,
      role,
      username,
      termsAgreed,
      captchaAnswer,
      captchaChallenge,
      faceDescriptor,
    } = req.body;

    if (
      !captchaChallenge ||
      typeof captchaChallenge.num1 === "undefined" ||
      typeof captchaChallenge.num2 === "undefined"
    ) {
      return res.status(400).json({ error: "Captcha challenge missing." });
    }

    const expectedCaptcha =
      Number(captchaChallenge.num1) + Number(captchaChallenge.num2);
    if (Number(captchaAnswer) !== expectedCaptcha) {
      return res.status(400).json({ error: "Captcha answer is incorrect." });
    }


    const existingEmail = await User.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
    });
    if (existingEmail)
      return res.status(400).json({ error: "Email already in use." });

    const trimmedUsername = username.trim();
    const existingUsername = await User.findOne({
      username: { $regex: new RegExp(`^${trimmedUsername}$`, "i") },
    });
    if (existingUsername)
      return res.status(400).json({ error: "Username already in use." });

    const hash = await bcrypt.hash(password, 10);
    const user = await new User({
      email: email.toLowerCase(),
      username: trimmedUsername,
      passwordHash: hash,
      role: role || "user",
      faceDescriptor,
    }).save();

    console.log(`✓ New user registered: ${email} as ${role}`);
    res.status(201).json({ message: "Signup success", userId: user._id });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const lowerEmail = email.toLowerCase();

    const user = await User.findOne({
      email: { $regex: new RegExp(`^${lowerEmail}$`, "i") },
    });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" },
    );

    res.json({
      token,
      email: user.email,
      role: user.role,
      username: user.username,
      userId: user._id,
      faceDescriptor: user.faceDescriptor || null,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});

// Request password reset
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || email.trim() === "") {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await User.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
    });
    if (!user) {
      // Return generic message for security
      return res
        .status(200)
        .json({ message: "If email exists, reset link will be sent" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    // Send email only if configured
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: user.email,
        subject: "Password Reset Link - Autism Support Platform",
        html: `
          <h2>Password Reset Request</h2>
          <p>Click the link below to reset your password:</p>
          <a href="${resetLink}" style="background-color: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
          <p>This link will expire in 30 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `,
      });
      console.log(`✓ Password reset link sent to: ${user.email}`);
    }

    res
      .status(200)
      .json({ message: "If email exists, reset link will be sent" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});

// Reset password with token validation
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters." });
    }

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    user.passwordHash = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    console.log(`✓ Password reset successful for: ${user.email}`);
    res.status(200).json({
      message:
        "Password reset successful. Please login with your new password.",
    });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});

module.exports = router;
