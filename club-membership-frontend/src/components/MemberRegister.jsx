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

  const [membershipId, setMembershipId] = useState("");
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  /* ======================
     IMAGE COMPRESSION
  ====================== */
  const compressImage = async (file) => {
    return await imageCompression(file, {
      maxSizeMB: 0.4, // lower for phones
      maxWidthOrHeight: 900,
      useWebWorker: true,
    });
  };

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
    if (formData.name.trim().length < 3) newErrors.name = "Min 3 characters";
    if (formData.nickname.trim().length < 2) newErrors.nickname = "Required";
    if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = "10 digit number";
    if (!formData.bloodGroup) newErrors.bloodGroup = "Select blood group";
    if (!formData.address.trim()) newErrors.address = "Required";
    if (!photo) newErrors.photo = "Photo required";
    if (!paymentScreenshot)
      newErrors.payment = "Payment screenshot required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ======================
     SUBMIT (NO LAG)
  ====================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);

      // STEP 1: FAST REGISTER (TEXT ONLY)
      const res = await axios.post(
        "https://club-membership.vercel.app/api/auth/register",
        formData
      );

      const memberId = res.data.membershipId;
      setMembershipId(memberId);
      setShowSuccessModal(true);
      setAlreadyRegistered(false);

      // STEP 2: UPLOAD IMAGES IN BACKGROUND
      const imgData = new FormData();
      imgData.append("membershipId", memberId);
      imgData.append("photo", photo);
      imgData.append("paymentScreenshot", paymentScreenshot);

      axios.post(
        "https://club-membership.vercel.app/api/auth/upload-images",
        imgData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong";
      msg.includes("already exists")
        ? setAlreadyRegistered(true)
        : alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center relative px-4">
      <img
        src={Lines}
        className="absolute bottom-0 left-0 w-full h-[400px] opacity-40 -z-10 object-cover"
        alt=""
      />

      <div className="relative w-full max-w-3xl rounded-2xl px-4 sm:px-10 py-6 bg-white/90">
        <img
          src={Hashtag}
          className="absolute right-4 bottom-0 h-6"
          alt=""
        />

        <div className="flex justify-center gap-2 mb-3">
          <img src={CenterLogo} className="h-16" />
          <img src={ClubName} className="h-16" />
        </div>

        <h1 className="text-center text-xl font-extrabold mb-4">
          MEMBER REGISTRATION
        </h1>

        {alreadyRegistered && (
          <p className="text-red-600 text-center mb-3">
            Phone number already registered
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          className={`space-y-4 ${
            loading ? "pointer-events-none opacity-70" : ""
          }`}
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <input name="name" placeholder="Full Name" onChange={handleChange} className="p-2 border rounded-lg" />
            <input name="nickname" placeholder="Nickname" onChange={handleChange} className="p-2 border rounded-lg" />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <input type="number" name="age" placeholder="Age" onChange={handleChange} className="p-2 border rounded-lg" />
            <input name="phone" placeholder="Mobile Number" onChange={handleChange} className="p-2 border rounded-lg" />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <input name="email" placeholder="Email (optional)" onChange={handleChange} className="p-2 border rounded-lg" />
            <input type="date" name="dob" onChange={handleChange} className="p-2 border rounded-lg" />
            <select name="bloodGroup" onChange={handleChange} className="p-2 border rounded-lg">
              <option value="">Blood Group</option>
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                <option key={bg}>{bg}</option>
              ))}
            </select>
          </div>

          <textarea name="address" placeholder="Address" onChange={handleChange} className="h-24 p-2 w-full border rounded-lg" />

          <div>
            <label className="text-sm font-semibold">Profile Photo</label>
            <input type="file" accept="image/*" onChange={handlePhotoChange} />
            {errors.photo && <p className="text-red-500 text-sm">{errors.photo}</p>}
          </div>

          <div>
            <label className="text-sm font-semibold">Payment Screenshot</label>
            <input type="file" accept="image/*" onChange={handlePaymentChange} />
            {errors.payment && (
              <p className="text-red-500 text-sm">{errors.payment}</p>
            )}
          </div>

          <button
  type="submit"
  disabled={loading}
  className={`w-full bg-blue-800 text-white py-3 rounded-xl ${
    loading ? "opacity-60 cursor-not-allowed" : "hover:opacity-90"
  }`}
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
