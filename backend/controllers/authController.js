import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import { sendEmail } from "../config/mailer.js";
import generateToken from "../utils/generateToken.js";

/* ----------------- REGISTER ----------------- */
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) throw new Error("All fields required");

  const userExists = await User.findOne({ email });
  if (userExists) throw new Error("User already exists");

  const user = await User.create({ name, email, password, isVerified: false });
  const otp = await user.generateOtp("verify");
  await user.save();

  try {
    await sendEmail(email, otp, "verify");
  } catch (err) {
    console.error("OTP email failed:", err);
  }

  res.status(201).json({ success: true, message: "Registration successful. OTP sent to your email" });
});

/* ----------------- VERIFY OTP ----------------- */
export const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) throw new Error("Email and OTP required");

  const user = await User.findOne({ email }).select("+otp +otpExpiry");
  if (!user) throw new Error("User not found");
  if (user.isVerified) throw new Error("Email already verified");
  if (!user.otp || Date.now() > user.otpExpiry) throw new Error("OTP expired");

  const isMatch = await bcrypt.compare(otp, user.otp);
  if (!isMatch) throw new Error("Invalid OTP");

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();

  res.json({ success: true, token: generateToken(user._id), message: "Email verified successfully" });
});

/* ----------------- LOGIN ----------------- */
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new Error("Email and password required");

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.matchPassword(password))) throw new Error("Invalid email or password");
  if (!user.isVerified) throw new Error("Please verify your email first");

  res.json({ success: true, token: generateToken(user._id) });
});

/* ----------------- FORGOT PASSWORD ----------------- */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new Error("Email required");

  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  const otp = await user.generateOtp("reset");
  await user.save();

  await sendEmail(email, otp, "reset");

  res.json({ success: true, message: "Password reset OTP sent to email" });
});

/* ----------------- RESET PASSWORD ----------------- */
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) throw new Error("All fields required");

  const user = await User.findOne({ email }).select("+resetOtp +resetOtpExpiry");
  if (!user || !user.resetOtp) throw new Error("Invalid request");
  if (Date.now() > user.resetOtpExpiry) throw new Error("OTP expired");

  const isValid = await bcrypt.compare(otp, user.resetOtp);
  if (!isValid) throw new Error("Invalid OTP");

  user.password = newPassword;
  user.resetOtp = undefined;
  user.resetOtpExpiry = undefined;
  await user.save();

  res.json({ success: true, message: "Password reset successful" });
});

/* ----------------- GET CURRENT USER ----------------- */
export const getMe = asyncHandler(async (req, res) => {
  res.json(req.user);
});
