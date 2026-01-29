import User from "../models/User.js";
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import { sendEmail } from "../config/mailer.js";
import generateToken from "../utils/generateToken.js";

// ----------------- REGISTER -----------------
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("All fields are required");
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  // Create user (password hashed in model)
  const user = await User.create({
    name,
    email,
    password,
    isVerified: false,
  });

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.otp = await bcrypt.hash(otp, 10);
  user.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
  await user.save();

  // Send OTP (do NOT break registration if email fails)
  try {
    await sendEmail(
      email,
      "Verify your email",
      otp
    );
  } catch (error) {
    console.error("OTP email failed:", error.message);
  }

  res.status(201).json({
    success: true,
    message: "Registration successful. Please verify OTP sent to email",
  });
});

// ----------------- VERIFY OTP -----------------
export const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    res.status(400);
    throw new Error("Email and OTP are required");
  }

  const user = await User.findOne({ email }).select("+otp +otpExpiry");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.isVerified) {
    throw new Error("Email already verified");
  }

  if (!user.otp || Date.now() > user.otpExpiry) {
    throw new Error("OTP expired. Please request a new one");
  }

  const isValidOtp = await bcrypt.compare(otp, user.otp);
  if (!isValidOtp) {
    throw new Error("Invalid OTP");
  }

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();

  res.json({
    success: true,
    _id: user._id,
    name: user.name,
    email: user.email,
    token: generateToken(user._id),
    message: "Email verified successfully",
  });
});

// ----------------- LOGIN -----------------
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    throw new Error("Invalid email or password");
  }

  if (!user.isVerified) {
    throw new Error("Please verify your email before login");
  }

  res.json({
    success: true,
    _id: user._id,
    name: user.name,
    email: user.email,
    token: generateToken(user._id),
  });
});

// ----------------- GET CURRENT USER -----------------
export const getMe = asyncHandler(async (req, res) => {
  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
  });
});
