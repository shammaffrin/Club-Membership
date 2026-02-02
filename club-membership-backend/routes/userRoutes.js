// routes/user.js
import express from "express";
import upload from "../middleware/cloudinaryUpload.js";
import User from "../models/User.js";

const router = express.Router();

/* ======================
   GET user by ID
====================== */
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ======================
   UPLOAD PAYMENT PROOF
====================== */
router.post(
  "/upload-payment/:id",
  upload.single("paymentProof"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      const user = await User.findById(req.params.id);
      if (!user)
        return res.status(404).json({ success: false, message: "User not found" });

      // Save payment proof like photo
      user.paymentProof = req.file.path;        // Cloudinary URL
      user.paymentProofId = req.file.filename;  // Cloudinary public ID
      user.membershipStatus = "payment_received"; // Optional: update status

      await user.save();

      res.json({
        success: true,
        message: "Payment proof uploaded successfully",
        user,
      });
    } catch (error) {
      console.error("UPLOAD ERROR:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

export default router;
