import express from "express";
import User from "../models/User.js";
import adminAuth from "../middleware/adminauth.js"; // import your middleware

const router = express.Router();

router.post("/login", (req, res) => {
  try {
    const { username, password } = req.body;

    if (
      username !== process.env.ADMIN_USERNAME ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { role: "admin", username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      token,
      admin: { username }
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});


/* =========================
   GET ALL PENDING USERS
========================= */
router.get("/pending-users", adminAuth, async (req, res) => {
  try {
    const users = await User.find({ membershipStatus: "pending_approval" })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/* =========================
   APPROVE USER
========================= */
router.put("/approve/:id", adminAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 🔒 IMPORTANT CHECK (NO IMAGE = NO APPROVAL)
    if (!user.photo || !user.paymentScreenshot) {
      return res.status(400).json({
        success: false,
        message: "Profile photo and payment proof are required before approval",
      });
    }

    if (!user.membershipId) {
      user.membershipId = `CLUB-${Date.now()}`;
    }

    const approvedAt = new Date();
    const expiryDate = new Date(approvedAt);
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    user.membershipStatus = "approved";
    user.approvedAt = approvedAt;
    user.expiryDate = expiryDate;

    await user.save();

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Approve route error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});




/* =========================
   REJECT USER
========================= */
router.put("/reject/:id", adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.membershipStatus = "rejected";
    await user.save();

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/* =========================
   GET ALL USERS
========================= */
router.get("/all-users", adminAuth, async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
