import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import imageCompression from "browser-image-compression";

import Lines from "../assets/lines.webp";
import CenterLogo from "../assets/logo-Malayalam.webp";
import ClubName from "../assets/logo.webp";
import Hashtag from "../assets/hashtag.webp";

export default function MemberRegister() {
  const [formData, setFormData] = useState({
    name: "",
    fatherName: "",
    nickname: "",
    age: "",
    phone: "",
    email: "",
    bloodGroup: "",
    address: "",
    dob: "",
  });

  const [photo, setPhoto] = useState(null);
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const compressImage = async (file) =>
    await imageCompression(file, { maxSizeMB: 0.4, maxWidthOrHeight: 900 });

  const handlePhotoChange = async (e) => {
    if (!e.target.files[0]) return;
    setPhoto(await compressImage(e.target.files[0]));
  };

  const handlePaymentChange = async (e) => {
    if (!e.target.files[0]) return;
    setPaymentScreenshot(await compressImage(e.target.files[0]));
  };

  /* ======================
     VALIDATION
  ====================== */
  const validateForm = () => {
    const newErrors = {};

    if (formData.name.trim().length < 3)
      newErrors.name = "Name must be at least 3 characters";

    if (formData.fatherName.trim().length < 3)
      newErrors.fatherName = "Father name is required";

    if (!/^\d{10}$/.test(formData.phone))
      newErrors.phone = "Enter a valid 10-digit number";

    // Either Age OR DOB must be given
    if (!formData.age && !formData.dob) {
      newErrors.age = "Age or DOB is required";
      newErrors.dob = "Age or DOB is required";
    }

    if (!formData.bloodGroup) newErrors.bloodGroup = "Select blood group";

    if (!formData.address.trim()) newErrors.address = "Address required";

    if (!photo) newErrors.photo = "Profile photo required";

    if (!paymentScreenshot)
      newErrors.payment = "Payment screenshot required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);

      const data = new FormData();
      Object.entries(formData).forEach(([k, v]) => v && data.append(k, v));
      data.append("photo", photo);
      data.append("paymentScreenshot", paymentScreenshot);

      await axios.post(
        "https://club-membership.vercel.app/api/auth/register",
        data,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setShowSuccessModal(true);
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative px-4 sm:px-6">
      <img
        src={Lines}
        className="absolute bottom-0 left-0 w-full h-[400px] opacity-40 -z-10 object-cover"
        alt=""
      />

      <div className="relative w-full max-w-3xl rounded-2xl px-4 sm:px-8 py-6 bg-white/90">
        <img
          src={Hashtag}
          className="absolute right-4 bottom-0 h-6"
          alt=""
        />

        <div className="flex justify-center gap-2 mb-3">
          <img src={CenterLogo} className="h-16" />
          <img src={ClubName} className="h-16" />
        </div>

        <h1 className="text-center text-xl sm:text-2xl font-extrabold mb-4">
          MEMBER REGISTRATION
        </h1>

        <form
          onSubmit={handleSubmit}
          className={`space-y-4 ${loading ? "pointer-events-none opacity-70" : ""}`}
        >
          {/* Name + Father Name */}
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              name="name"
              placeholder="Full Name"
              onChange={handleChange}
              className="p-2 border rounded-lg w-full"
            />
             <input
              name="nickname"
              placeholder="Nickname"
              onChange={handleChange}
              className="p-2 border rounded-lg w-full"
            />
          </div>

          {/* Email + Mobile + Nickname */}
          <div className="grid sm:grid-cols-3 gap-3">
            <input
              name="email"
              placeholder="Email (optional)"
              onChange={handleChange}
              className="p-2 border rounded-lg w-full"
            />
            <input
              name="phone"
              placeholder="Mobile Number"
              onChange={handleChange}
              className="p-2 border rounded-lg w-full"
            />
             <input
              name="fatherName"
              placeholder="Father Name"
              onChange={handleChange}
              className="p-2 border rounded-lg w-full"
            />
          </div>

          {/* Age + DOB + Blood Group */}
          <div className="grid sm:grid-cols-3 gap-3">
            <input
              type="number"
              name="age"
              placeholder="Age"
              onChange={handleChange}
              className="p-2 border rounded-lg w-full"
            />
            <input
              type="date"
              name="dob"
              onChange={handleChange}
              className="p-2 border rounded-lg w-full text-gray-500"
            />
            <select
              name="bloodGroup"
              onChange={handleChange}
              className="p-2 border rounded-lg w-full"
            >
              <option value="">Blood Group</option>
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                (bg) => (
                  <option key={bg}>{bg}</option>
                )
              )}
            </select>
          </div>

          <textarea
            name="address"
            placeholder="Address"
            onChange={handleChange}
            className="h-24 p-2 w-full border rounded-lg"
          />

          {/* Profile Photo Upload */}
          <div className="flex flex-col">
            <label className="mb-1 font-medium">Profile Photo</label>
            <div className="relative border-2 border-dashed border-gray-400 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-gray-600">
              {photo ? (
                <img
                  src={URL.createObjectURL(photo)}
                  alt="Profile Preview"
                  className="w-24 h-24 rounded-full object-cover mb-2"
                />
              ) : (
                <p className="text-gray-500 text-sm text-center">
                  Upload your photo
                </p>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="absolute w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            {errors.photo && (
              <p className="text-red-500 text-sm mt-1">{errors.photo}</p>
            )}
          </div>

          {/* Payment Screenshot Upload */}
          <div className="flex flex-col mt-3">
            <label className="mb-1 font-medium">Payment Screenshot</label>
            <div className="relative border-2 border-dashed border-gray-400 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-gray-600">
              {paymentScreenshot ? (
                <img
                  src={URL.createObjectURL(paymentScreenshot)}
                  alt="Payment Preview"
                  className="w-32 h-32 object-contain mb-2"
                />
              ) : (
                <p className="text-gray-500 text-sm text-center">
                  Upload payment screenshot
                </p>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handlePaymentChange}
                className="absolute w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            {errors.payment && (
              <p className="text-red-500 text-sm mt-1">{errors.payment}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-800 text-white py-3 rounded-xl mt-4"
            disabled={loading}
          >
            {loading ? "Registering..." : "REGISTER"}
          </button>
        </form>
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl text-center">
            <h2 className="text-2xl font-bold text-green-600">
              Registration Successful 🎉
            </h2>
            <button
              onClick={() => navigate("/")}
              className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg"
            >
              Go to Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
