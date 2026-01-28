// controllers/authController.js
import User from "../models/User.js";
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import { sendEmail } from "../config/mailer.js";
import generateToken from "../utils/generateToken.js";

// ----------------- REGISTER -----------------
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  // Hash password handled in model pre-save
  const user = await User.create({ name, email, password, isVerified: false });

  // Generate OTP and hash it
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = await bcrypt.hash(otp, 10);
  user.otp = hashedOtp;
  user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min
  await user.save();

  // Send OTP via email
  await sendEmail(
    email,
    "Your OTP for Auth App",
    `Hello ${name}, your OTP is ${otp}. It expires in 10 minutes.`
  );

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    message: "OTP sent to email, please verify",
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
  if (!user) throw new Error("User not found");

  if (user.isVerified) throw new Error("User already verified");
  if (!user.otp || !user.otpExpiry) throw new Error("OTP not found. Please request again");
  if (Date.now() > user.otpExpiry) throw new Error("OTP expired");

  // Compare hashed OTP
  const isValid = await bcrypt.compare(otp, user.otp);
  if (!isValid) throw new Error("Incorrect OTP");

  // Mark verified and remove OTP
  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();

  res.json({
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
  if (!email || !password) throw new Error("Email and password required");

  const user = await User.findOne({ email }).select("+password");
  if (!user) throw new Error("Invalid email or password");

  const isMatch = await user.matchPassword(password);
  if (!isMatch) throw new Error("Invalid email or password");

  if (!user.isVerified) throw new Error("Email not verified");

  res.json({
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
