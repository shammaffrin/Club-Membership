import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import upload from "../middleware/cloudinaryUpload.js";

const router = express.Router();

/* ======================
   MEMBERSHIP ID GENERATOR
====================== */
const getNextMembershipId = async () => {
  const lastUser = await User.findOne({
    membershipId: { $regex: "^K-STAR2026/" }
  }).sort({ createdAt: -1 });

  let nextNumber = 1;

  if (lastUser?.membershipId) {
    const lastNumber = parseInt(
      lastUser.membershipId.split("/")[1],
      10
    );
    nextNumber = lastNumber + 1;
  }

  return `K-STAR2026/${String(nextNumber).padStart(4, "0")}`;
};


/* ======================
   REGISTER (WITH PHOTO + PAYMENT)
====================== */
router.post(
  "/register",
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "paymentProof", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        name,
        fatherName,
        nickname,
        email,
        age,
        phone,
        Whatsapp,
        bloodGroup,
        address,
        dob,
      } = req.body;

      /* ======================
         BASIC VALIDATION
      ====================== */
      if (
        !name ||
        !fatherName ||
        !nickname ||
        !age ||
        !phone ||
        !Whatsapp ||
        !bloodGroup ||
        !address
      ) {
        return res.status(400).json({
          success: false,
          message: "All required fields must be filled",
        });
      }

      if (!req.files?.photo || !req.files?.paymentProof) {
        return res.status(400).json({
          message: "Photo and payment proof are required",
        });
      }

      /* ======================
         PHONE / WHATSAPP VALIDATION
      ====================== */
      const phoneRegex = /^(?:\+91)?[6-9]\d{9}$/;

      if (!phoneRegex.test(phone) || !phoneRegex.test(Whatsapp)) {
        return res.status(400).json({
          success: false,
          message: "Enter valid phone and WhatsApp numbers",
        });
      }

      /* ======================
         BLOOD GROUP NORMALIZE
      ====================== */
      const normalizedBloodGroup =
        bloodGroup.toUpperCase() === "NIL" ? "Nil" : bloodGroup;

      /* ======================
         DUPLICATE CHECKS
      ====================== */
      const existingUser = await User.findOne({
        $or: [{ phone }, { Whatsapp }],
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Phone or WhatsApp already exists",
        });
      }

      const membershipId = await getNextMembershipId();

      /* ======================
         CREATE USER
      ====================== */
      const user = await User.create({
        name,
        fatherName,
        nickname,
        email: email || null,
        age,
        phone,
        Whatsapp,
        bloodGroup: normalizedBloodGroup,
        address,
        dob: dob || null,

        membershipId,
        membershipStatus: "pending_approval",

        photo: req.files.photo[0].path,
        photoId: req.files.photo[0].filename,

        paymentProof: req.files.paymentProof[0].path,
        paymentProofId: req.files.paymentProof[0].filename,
      });

      res.status(201).json({
        success: true,
        message: "Registration successful",
        membershipId: user.membershipId,
      });
    } catch (err) {
      console.error("REGISTER ERROR:", err);
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
);

export default router;
