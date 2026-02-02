import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import connectCloudinary from "./config/cloudinary.js";

import authRoutes from "./routes/authroutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import membershipCardRoute from "./routes/membershipCard.js";
import memberAuthRoutes from "./routes/memberAuth.js";

dotenv.config();

const app = express();

/* ======================
   CONNECT SERVICES
====================== */
await connectDB();          // 🔥 MUST BE AWAITED
connectCloudinary();

/* ======================
   MIDDLEWARE
====================== */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://kingstareriyapady.club",
      "https://membership-front.vercel.app",
    ],
    credentials: true,
  })
);

/* ======================
   ROUTES
====================== */
app.use("/api/auth", authRoutes);
app.use("/api/member", memberAuthRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", membershipCardRoute);

app.get("/", (req, res) => {
  res.send("✅ Club Membership API running");
});

export default app;
