import crypto from "crypto";
import User from "../../database/models/user/user.model.js";
import RefreshToken from "../../database/models/refreshToken.model.js"; // Import RefreshToken model
import { config } from "../../config/index.js";
import sendEmail from "../../utils/email.js";
import { forgotPasswordEmail } from "../../utils/forgotPasswordMailPage.js";
import { generateTokens } from "../../utils/jwt.util.js"; // Updated to use generateTokens
import logger from "../../utils/logger.js"; // Import Logger

// --- PASSWORD VALIDATION HELPER ---
const validatePasswordStrength = (password) => {
  // Regex: At least 8 chars, 1 Uppercase, 1 Special Character
  const regex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
  return regex.test(password);
};

const PASSWORD_ERROR_MSG =
  "Password must be at least 8 characters long, contain at least one uppercase letter, and one special character.";

// Register
export const registerController = async (req, res) => {
  try {
    // 1. Extract new fields from request body
    const {
      name,
      email,
      password,
      role,
      gender,
      phoneNumber,
      dob,
      state,
      address,
    } = req.body;

    // Log the attempt (but hide sensitive data)
    logger.info(`Register attempt for email: ${email}`);

    // --- UPDATED VALIDATION: Check ALL fields ---
    if (
      !name ||
      !email ||
      !password ||
      !gender ||
      !phoneNumber ||
      !dob ||
      !state ||
      !address
    ) {
      logger.warn(`Register failed: Missing mandatory fields for ${email}`);
      return res
        .status(400)
        .json({ success: false, message: "All fields are mandatory." });
    }

    // --- PASSWORD STRENGTH CHECK ---
    if (!validatePasswordStrength(password)) {
      logger.warn(`Register failed: Weak password for ${email}`);
      return res
        .status(400)
        .json({ success: false, message: PASSWORD_ERROR_MSG });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      logger.warn(`Register failed: User already exists (${email})`);
      return res
        .status(409)
        .json({ success: false, message: "User already exists" });
    }

    // Accept role from client but only allow known values; default to 'user'
    const safeRole = ["user", "admin"].includes(role) ? role : "user";

    // 2. Pass new fields to User.create
    const user = await User.create({
      name,
      email,
      password,
      role: safeRole,
      gender,
      phoneNumber,
      dob,
      state,
      address,
    });

    // Prepare response object without any password/hash fields
    const userObj = user.toObject ? user.toObject() : { ...user };
    delete userObj.password;
    delete userObj.passwordHash;
    delete userObj.__v;

    logger.info(`User registered successfully: ${user._id}`);
    return res.status(201).json({ success: true, data: userObj });
  } catch (err) {
    logger.error(`registerController error: ${err.message}`);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Login
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Missing credentials" });
    }

    const user = await User.findOne({ email }).select("+password");

    // Generic error message for security (don't reveal if email exists)
    const invalidMsg = "Invalid credentials";

    if (!user) {
      logger.warn(`Login failed: User not found for ${email}`);
      return res.status(401).json({ success: false, message: invalidMsg });
    }

    const isValid = await user.validatePassword(password);
    if (!isValid) {
      logger.warn(`Login failed: Invalid password for ${email}`);
      return res.status(401).json({ success: false, message: invalidMsg });
    }

    // --- GENERATE TOKENS (Access + Refresh) ---
    const payload = { sub: user._id, role: user.role };
    const { accessToken, refreshToken } = generateTokens(payload);

    // --- SAVE REFRESH TOKEN TO DB ---
    // Save the refresh token so we can revoke it later if needed
    await RefreshToken.create({
      token: refreshToken,
      user: user._id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      createdByIp: req.ip,
    });

    logger.info(`User logged in: ${user._id}`);

    return res.status(200).json({
      success: true,
      data: user.toJSON(),
      token: accessToken, // Standard Access Token
      // refreshToken: refreshToken, // New Refresh Token
    });
  } catch (err) {
    logger.error(`loginController error: ${err.message}`);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Change password (authenticated route)
export const changePasswordController = async (req, res) => {
  try {
    const userId = req.user.sub; // from auth middleware
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Missing fields" });
    }

    // --- PASSWORD STRENGTH CHECK ---
    if (!validatePasswordStrength(newPassword)) {
      return res
        .status(400)
        .json({ success: false, message: PASSWORD_ERROR_MSG });
    }

    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const ok = await user.validatePassword(currentPassword);
    if (!ok) {
      logger.warn(
        `Change password failed: Wrong current password for ${userId}`
      );
      return res
        .status(401)
        .json({ success: false, message: "Current password incorrect" });
    }

    user.password = newPassword; // pre-save hook will hash
    await user.save();

    logger.info(`Password changed for user: ${userId}`);
    return res.status(200).json({ success: true, message: "Password changed" });
  } catch (err) {
    logger.error(`changePasswordController error: ${err.message}`);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Forgot password (request reset)
export const forgotPasswordController = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email required" });
    }

    // find user
    const user = await User.findOne({ email });
    if (!user) {
      logger.info(`Forgot password requested for non-existing email: ${email}`);
      return res.status(200).json({
        success: true,
        message: "If account exists, password reset email will be sent",
      });
    }

    // generate token and save hashed token + expiry to DB
    const token = user.generatePasswordReset();
    await user.save({ validateBeforeSave: false });

    logger.info(`Password reset token generated for ${email}`);

    // send email in background
    setImmediate(async () => {
      try {
        const resetUrl = `${config.app.frontendUrl}/reset-password?token=${token}`;

        await sendEmail({
          to: user.email,
          subject: "Password reset",
          text: `Reset your password: ${resetUrl}`,
          html: forgotPasswordEmail(resetUrl, user.name),
        });
        logger.info(`Reset email queued/sent to ${user.email}`);
      } catch (emailErr) {
        logger.error(
          `Failed to send reset email to ${user.email}: ${emailErr.message}`
        );
      }
    });

    return res.status(200).json({
      success: true,
      message: "If account exists, password reset email will be sent",
    });
  } catch (err) {
    logger.error(`forgotPasswordController error: ${err.message}`);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Reset password: user clicks link -> POST new password + token
export const resetPasswordController = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword)
      return res
        .status(400)
        .json({ success: false, message: "Missing token or password" });

    // --- PASSWORD STRENGTH CHECK ---
    if (!validatePasswordStrength(newPassword)) {
      return res
        .status(400)
        .json({ success: false, message: PASSWORD_ERROR_MSG });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    }).select("+password");

    if (!user) {
      logger.warn(`Reset password failed: Invalid or expired token`);
      return res
        .status(400)
        .json({ success: false, message: "Token invalid or expired" });
    }

    user.password = newPassword; // pre-save will hash
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    logger.info(`Password reset successfully for user: ${user._id}`);
    return res
      .status(200)
      .json({ success: true, message: "Password reset success" });
  } catch (err) {
    logger.error(`resetPasswordController error: ${err.message}`);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
