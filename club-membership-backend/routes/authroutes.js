import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import upload from "../middleware/cloudinaryUpload.js";
import mongoose from "mongoose";


const router = express.Router();

/* ======================
   MEMBERSHIP ID GENERATOR
====================== */
const getNextMembershipId = async () => {
  const lastUser = await User.findOne().sort({ createdAt: -1 });

  let nextNumber = 1;

  if (lastUser?.membershipId) {
    const lastNumber = parseInt(lastUser.membershipId.replace("KSASC", ""), 10);
    nextNumber = lastNumber + 1;
  }

  return `KSASC${String(nextNumber).padStart(4, "0")}`;
};

/* ======================
   REGISTER USER
====================== */
router.post("/register", async (req, res) => {
  try {
    const { name, nickname, email, age, phone, bloodGroup, address, dob } = req.body;

    if (!name || !nickname || !age || !phone || !bloodGroup || !address) {
      return res.status(400).json({
        success: false,
        message: "Name, nickname, age, phone, blood group, and address are required",
      });
    }

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this phone number already exists",
      });
    }

    const membershipId = await getNextMembershipId();

    const user = await User.create({
      name,
      nickname,
      email: email || null,
      age,
      phone,
      bloodGroup,
      address,
      dob: dob || null,
      membershipStatus: "pending_approval",
      membershipId,
    });

    return res.status(201).json({
      success: true,
      message: "Registered successfully. Upload images next.",
      membershipId: user.membershipId,
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});



/* ======================
   UPLOAD IMAGES (PHOTO + PAYMENT)
====================== */
router.post(
  "/upload-images",
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "paymentScreenshot", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { membershipId } = req.body;
      if (!membershipId)
        return res
          .status(400)
          .json({ success: false, message: "Membership ID required" });

      const user = await User.findOne({ membershipId });
      if (!user)
        return res
          .status(404)
          .json({ success: false, message: "User not found" });

      // ✅ Save profile photo
      if (req.files.photo) {
        const photoFile = req.files.photo[0];
        user.photo = photoFile.path;       // Cloudinary URL
        user.photoId = photoFile.filename; // Cloudinary public ID
      }

      // ✅ Save payment proof just like photo
      if (req.files.paymentScreenshot) {
        const paymentFile = req.files.paymentScreenshot[0];
        user.paymentProof = paymentFile.path;       // Cloudinary URL
        user.paymentProofId = paymentFile.filename; // Cloudinary public ID
        user.membershipStatus = "payment_received"; // automatically update status
      } else {
        return res.status(400).json({
          success: false,
          message: "Payment proof is required",
        });
      }

      await user.save();

      res.json({
        success: true,
        message: "Photo and payment proof uploaded successfully",
        user,
      });
    } catch (err) {
      console.error("Upload images error:", err);
      res
        .status(500)
        .json({ success: false, message: "Server error" });
    }
  }
);





/* ======================
   ADMIN LOGIN
====================== */
router.post("/admin/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Username and password are required",
    });
  }

  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const token = jwt.sign(
      { role: "admin", username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    return res.json({
      success: true,
      token,
      admin: {
        username,
        role: "admin",
      },
    });
  }

  return res.status(401).json({
    success: false,
    message: "Invalid credentials",
  });
});

export default router;