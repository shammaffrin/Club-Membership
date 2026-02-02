// routes/user.js
import express from "express";
import upload from "../middleware/cloudinaryUpload.js";
import User from "../models/User.js";

const router = express.Router();

/* ======================
   GET USER BY ID
====================== */
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

/* ======================
   UPLOAD PAYMENT SCREENSHOT
====================== */
router.post(
  "/upload-payment/:id",
  upload.single("paymentScreenshot"),
  async (req, res) => {
    try {
      // 1️⃣ File check
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No payment screenshot uploaded",
        });
      }

      // 2️⃣ Update user with Cloudinary data
      const user = await User.findByIdAndUpdate(
        req.params.id,
        {
          paymentScreenshot: req.file.path,      // ✅ secure_url
          paymentScreenshotId: req.file.filename, // ✅ public_id
          membershipStatus: "pending_approval",
        },
        { new: true }
      );

      // 3️⃣ User check
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // 4️⃣ Success
      res.status(200).json({
        success: true,
        message: "Payment screenshot uploaded successfully",
        user,
      });
    } catch (error) {
      console.error("UPLOAD PAYMENT ERROR:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

export default router;
