
import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

// Helper: Remove password before sending user data
const getSafeUser = (user) => {
    const userData = user.toObject();
    delete userData.password;
    return userData;
};

// ===============================
// SIGNUP - Register New User
// ===============================

export const signup = async (req, res) => {
    try {
        const { fullName, email, password, bio } = req.body;

        // Validate required fields
        if (!fullName?.trim() || !email?.trim() || !password || !bio?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Missing required details"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Check existing user
        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Account already exists"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = await User.create({
            fullName: fullName.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            bio: bio.trim()
        });

        // Generate JWT
        const token = generateToken(newUser._id);

        return res.status(201).json({
            success: true,
            userData: getSafeUser(newUser),
            token,
            message: "Account created successfully"
        });

    } catch (error) {
        console.error("Signup Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// ===============================
// LOGIN - Authenticate User
// ===============================

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email?.trim() || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // Find user
        const userData = await User.findOne({
            email: email.trim().toLowerCase()
        });

        // Check user exists
        if (!userData) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        // Compare password
        const isPasswordCorrect = await bcrypt.compare(
            password,
            userData.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        // Generate token
        const token = generateToken(userData._id);

        return res.status(200).json({
            success: true,
            userData: getSafeUser(userData),
            token,
            message: "Login successful"
        });

    } catch (error) {
        console.error("Login Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// ===============================
// CHECK AUTH - Verify Logged In User
// ===============================

export const checkAuth = (req, res) => {
    return res.status(200).json({
        success: true,
        user: req.user
    });
};


// ===============================
// UPDATE PROFILE
// ===============================

export const updateProfile = async (req, res) => {
    try {
        const { fullName, profilePic, bio } = req.body;

        const userId = req.user._id;

        // Prepare update object
        const updateData = {};

        if (fullName !== undefined) {
            if (!fullName.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Full name cannot be empty"
                });
            }

            updateData.fullName = fullName.trim();
        }

        if (bio !== undefined) {
            updateData.bio = bio.trim();
        }

        // Upload profile image if provided
        if (profilePic) {
            const uploadResponse = await cloudinary.uploader.upload(
                profilePic,
                {
                    folder: "profile_pictures",
                    resource_type: "image"
                }
            );

            updateData.profilePic = uploadResponse.secure_url;
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No profile details provided"
            });
        }

        // Update MongoDB document
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            {
                returnDocument: "after",
                runValidators: true
            }
        );

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            user: getSafeUser(updatedUser),
            message: "Profile updated successfully"
        });

    } catch (error) {
        console.error("Update Profile Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
