import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import imageCompression from "browser-image-compression";

import Lines from "../assets/lines.webp";
import CenterLogo from "../assets/logo-Malayalam.webp";
import ClubName from "../assets/logo.webp";
import Hashtag from "../assets/hashtag.webp";
import Qr from "../assets/qr.jpeg"

export default function MemberRegister() {
  const [formData, setFormData] = useState({
  name: "",
  fatherName: "",
  nickname: "",
  age: "",
  phone: "",
  Whatsapp: "",
  email: "",
  bloodGroup: "",
  address: "",
  dob: "",
});


  const [photo, setPhoto] = useState(null);
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const navigate = useNavigate();

  /* ======================
     HELPERS
  ====================== */
  const inputClass = (field) =>
    `p-2 border rounded-lg w-full ${
      errors[field] ? "border-red-500 focus:ring-red-400" : "border-gray-300"
    }`;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const compressImage = async (file) =>
    await imageCompression(file, { maxSizeMB: 0.4, maxWidthOrHeight: 900 });

  const handlePhotoChange = async (e) => {
    if (!e.target.files[0]) return;
    setPhoto(await compressImage(e.target.files[0]));
    if (errors.photo) setErrors({ ...errors, photo: "" });
  };

  const handlePaymentChange = async (e) => {
    if (!e.target.files[0]) return;
    setPaymentScreenshot(await compressImage(e.target.files[0]));
    if (errors.payment) setErrors({ ...errors, payment: "" });
  };

  /* ======================
     VALIDATION
  ====================== */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name || formData.name.trim().length < 3)
      newErrors.name = "Full name must be at least 3 characters";

    if (!formData.fatherName || formData.fatherName.trim().length < 3)
      newErrors.fatherName = "Father name is required";

    if (!/^\d{10}$/.test(formData.phone))
      newErrors.phone = "Enter a valid 10-digit mobile number";

    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email))
      newErrors.email = "Enter a valid email address";

    if (!formData.age && !formData.dob) {
      newErrors.age = "Age or DOB is required";
      newErrors.dob = "Age or DOB is required";
    }

    if (formData.age && formData.age < 1)
      newErrors.age = "Age must be greater than 0";

    if (!formData.bloodGroup)
      newErrors.bloodGroup = "Please select blood group";

    if (!formData.address.trim())
      newErrors.address = "Address is required";

    if (!photo)
      newErrors.photo = "Profile photo is required";

    if (!paymentScreenshot)
      newErrors.payment = "Payment screenshot is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ======================
     SUBMIT
  ====================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);

      const data = new FormData();
      Object.entries(formData).forEach(([k, v]) => v && data.append(k, v));
      data.append("photo", photo);
      data.append("paymentProof", paymentScreenshot);

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
        <img src={Hashtag} className="absolute right-4 bottom-0 h-6" alt="" />

       <div className="flex flex-col items-center gap-2 mb-3 md:flex-row md:justify-center">
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
          {/* Name + Nickname */}
          {/* Name + Nickname + Father Name */}
<div className="grid sm:grid-cols-3 gap-3">
  <div>
    <input
      name="name"
      placeholder="Full Name/മുഴുവൻ പേര്"
      onChange={handleChange}
      className={`${inputClass("name")} placeholder:text-[11px]`}
    />
    {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
  </div>

  <input
    name="nickname"
    placeholder="Nickname / അറിയപ്പെടുന്ന പേര്"
    onChange={handleChange}
    className="p-2 border rounded-lg w-full placeholder:text-[11px] border-gray-300"
  />

  <div>
    <input
      name="fatherName"
      placeholder="Father Name/പിതാവിന്റെ പേര്"
      onChange={handleChange}
      className={`${inputClass("fatherName")} placeholder:text-[11px]`}
    />
    {errors.fatherName && (
      <p className="text-red-500 text-xs">{errors.fatherName}</p>
    )}
  </div>
</div>


          {/* Email + Phone + Father Name */}
         {/* Email + Mobile + WhatsApp */}
<div className="grid sm:grid-cols-3 gap-3">
  <div>
    <input
      name="email"
      placeholder="Email(optional)/ ഇ മെയില്‍ ഐഡി"
      onChange={handleChange}
      className={`${inputClass("email")} placeholder:text-[11px]`}
    />
    {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
  </div>

  <div>
    <input
      name="phone"
      placeholder="Mobile Number/മൊബൈല്‍ നമ്പര്‍"
      onChange={handleChange}
      className={`${inputClass("phone")} placeholder:text-[11px]`}
    />
    {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
  </div>

  <div>
    <input
      name="Whatsapp"
      placeholder="WhatsApp Number"
      onChange={handleChange}
      className={`${inputClass("Whatsapp")} placeholder:text-[11px]`}
    />
    {errors.Whatsapp && (
      <p className="text-red-500 text-xs">{errors.Whatsapp}</p>
    )}
  </div>
</div>


          {/* Age + DOB + Blood Group */}
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <input
                type="number"
                name="age"
                placeholder="Age/വയസ്"
                onChange={handleChange}
                className={`${inputClass("age")} placeholder:text-[11px]`}
              />
              {errors.age && <p className="text-red-500 text-xs">{errors.age}</p>}
            </div>

            <div className="relative">
  <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] text-gray-500">
    Date of Birth (DD/MM/YYYY)
  </label>

  <input
    type="date"
    name="dob"
    onChange={handleChange}
    className={inputClass("dob")}
  />
</div>


            <div>
              <select
                name="bloodGroup"
                placeholder="bloodGroup/ബ്ലഡ് ഗ്രൂപ്പ് " 
                onChange={handleChange}
                className={`${inputClass("bloodGroup")} placeholder:text-[11px]`}
              >
                <option value="">Blood Group</option>
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-" ,"NIL"].map((bg) => (
                  <option key={bg}>{bg}</option>
                ))}
              </select>
              {errors.bloodGroup && (
                <p className="text-red-500 text-xs">{errors.bloodGroup}</p>
              )}
            </div>
          </div>

          {/* Address */}
          <div>
            <textarea
              name="address"
              placeholder="Address/അഡ്രസ്"
              onChange={handleChange}
              className={`${inputClass("address")} placeholder:text-[11px] h-24`}
            />
            {errors.address && (
              <p className="text-red-500 text-xs">{errors.address}</p>
            )}
          </div>

          {/* Profile Photo */}
          <div className="flex gap-5 items-start">
  {/* LEFT SIDE – Uploads */}
  <div className="space-y-4 w-full max-w-lg">
    {/* Profile Photo */}
    <div>
      <label className="font-medium text-sm">Profile Photo</label>
      <div className="relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer">
        {photo ? (
          <img
            src={URL.createObjectURL(photo)}
            className="w-16 h-16 rounded-full mx-auto object-cover"
          />
        ) : (
          <p className="text-[11px] text-gray-500">
            Upload photo / ഫോട്ടോ അപ്ലോഡ് ചെയ്യുക
          </p>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
      </div>
      {errors.photo && (
        <p className="text-red-500 text-xs">{errors.photo}</p>
      )}
    </div>

    {/* Payment Screenshot */}
    <div>
      <label className="font-medium text-sm">Payment Screenshot</label>
      <div className="relative border-2 border-dashed rounded-lg p-3 text-center cursor-pointer">
        {paymentScreenshot ? (
          <img
            src={URL.createObjectURL(paymentScreenshot)}
            className="w-24 mx-auto"
          />
        ) : (
          <p className="text-[11px] text-gray-500">
            Upload payment screenshot / ഫീ അടച്ച് രസീത് അപ്ലോഡ് ചെയ്യുക
          </p>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handlePaymentChange}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
      </div>
      {errors.payment && (
        <p className="text-red-500 text-xs">{errors.payment}</p>
      )}
    </div>
  </div>

  {/* RIGHT SIDE – QR CODE */}
  <div className="flex flex-col items-center gap-3">
    <div className="relative">
      <img
        src={Qr}  // replace with your QR image
        alt="QR Code"
        className={`w-32 transition-all h-42 duration-300 ${
          showQR ? "blur-0" : "blur-md"
        }`}
      />

      {!showQR && (
        <button
          type="button"
          onClick={() => setShowQR(true)}
          className="absolute inset-0 bg-black/40 text-white text-sm rounded flex items-center justify-center"
        >
          View QR
        </button>
      )}
    </div>

    <p className="text-xs text-gray-500 text-center">
      Click to view payment QR
    </p>
  </div>
</div>


          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-800 text-white py-3 rounded-xl"
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
