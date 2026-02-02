import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import connectCloudinary from "./config/cloudinary.js";

import authRoutes from "./routes/authroutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import membershipCardRoute from "./routes/membershipCard.js";
import memberAuthRoutes from "./routes/memberAuth.js";

dotenv.config();

const app = express();

/* ======================
   GLOBAL DB CONNECTION (CRITICAL)
====================== */
if (!mongoose.connection.readyState) {
  mongoose.set("bufferCommands", false);
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ MongoDB connected");
}

/* ======================
   CLOUDINARY
====================== */
connectCloudinary();

/* ======================
   CORS
====================== */
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

/* ===================
   BODY PARSERS
====================== */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

/* ======================
   EXPORT FOR VERCEL
====================== */
export default app;
