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
    email: "",
    age: "",
    dob: "",
    bloodGroup: "",
    address: "",
    phoneCode: "+91",
    phone: "",
    whatsappCode: "+91",
    whatsapp: "",
  });



  const countryCodes = [
    { code: "+91", label: "IN" },
    { code: "+971", label: "UAE" },
    { code: "+1", label: "US" },
    { code: "+44", label: "UK" },
  ];

  const [photo, setPhoto] = useState(null);
  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const phoneRegex = /^\d{10}$/;


  const navigate = useNavigate();

  /* ======================
     HELPERS
  ====================== */
  const inputClass = (field) =>
    `p-2 border rounded-lg w-full ${errors[field] ? "border-red-500 focus:ring-red-400" : "border-gray-300"
    }`;

  const handleChange = (e) => {
    const { name, value } = e.target;

    let updatedForm = { ...formData, [name]: value };

    // If checkbox is checked, copy phone → WhatsApp
    if (sameAsPhone && name === "phone") {
      updatedForm.whatsapp = value;
    }

    if (sameAsPhone && name === "phoneCode") {
      updatedForm.whatsappCode = value;
    }


    setFormData(updatedForm);

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

    if (
      formData.whatsapp &&
      !phoneRegex.test(formData.whatsapp)
    )
      newErrors.whatsapp = "Invalid WhatsApp number";

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

      data.append(
        "phone",
        `${formData.phoneCode}${formData.phone}`
      );

      data.append(
        "whatsapp",
        sameAsPhone
          ? `${formData.phoneCode}${formData.phone}`
          : `${formData.whatsappCode}${formData.whatsapp}`
      );




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
  className={`max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-8 ${
    loading ? "pointer-events-none opacity-70" : ""
  }`}
>
  {/* ================= PERSONAL DETAILS ================= */}
  <div className="space-y-5">
    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
      Personal Details
    </h3>

    <input
      name="name"
      placeholder="Full Name / മുഴുവൻ പേര്"
      onChange={handleChange}
      className={`${inputClass("name")} placeholder:text-[11px]`}
    />
    {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}

    <div className="grid sm:grid-cols-2 gap-4">
      <input
        name="nickname"
        placeholder="Nickname / അറിയപ്പെടുന്ന പേര്"
        onChange={handleChange}
        className={`${inputClass("nickname")} placeholder:text-[11px]`}
      />

      <div>
        <input
          name="fatherName"
          placeholder="Father Name / പിതാവിന്റെ പേര്"
          onChange={handleChange}
          className={`${inputClass("fatherName")} placeholder:text-[11px]`}
        />
        {errors.fatherName && (
          <p className="text-red-500 text-xs">{errors.fatherName}</p>
        )}
      </div>
    </div>
  </div>

  {/* ================= CONTACT DETAILS ================= */}
  <div className="space-y-5">
    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
      Contact Details
    </h3>

    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div>
        <input
          name="email"
          placeholder="Email (optional)"
          onChange={handleChange}
          className={`${inputClass("email")} placeholder:text-[11px]`}
        />
        {errors.email && (
          <p className="text-red-500 text-xs">{errors.email}</p>
        )}
      </div>

      {/* Phone */}
      <div className="flex gap-2">
        <select
          name="phoneCode"
          value={formData.phoneCode}
          onChange={handleChange}
          className="border rounded-xl px-3 py-3 text-sm bg-gray-50"
        >
          {countryCodes.map((c) => (
            <option key={c.code} value={c.code}>
              {c.label} {c.code}
            </option>
          ))}
        </select>

        <input
          name="phone"
          value={formData.phone}
          placeholder="Mobile Number"
          onChange={handleChange}
          className={`${inputClass("phone")} placeholder:text-[11px]`}
        />
      </div>

      {/* WhatsApp */}
      <div className="flex gap-2">
        <select
          name="whatsappCode"
          disabled={sameAsPhone}
          onChange={handleChange}
          className="border rounded-xl px-3 py-3 text-sm bg-gray-50 disabled:opacity-50"
        >
          {countryCodes.map((c) => (
            <option key={c.code} value={c.code}>
              {c.label} {c.code}
            </option>
          ))}
        </select>

        <input
          name="whatsapp"
          disabled={sameAsPhone}
          placeholder="WhatsApp Number"
          onChange={handleChange}
          value={formData.whatsapp}
          className={`${inputClass("whatsapp")} placeholder:text-[11px]`}
        />
      </div>
    </div>

    <label className="flex items-center gap-2 text-xs text-gray-600">
      <input
        type="checkbox"
        checked={sameAsPhone}
        onChange={(e) => {
          const checked = e.target.checked;
          setSameAsPhone(checked);

          if (checked) {
            setFormData((prev) => ({
              ...prev,
              whatsapp: prev.phone,
              whatsappCode: prev.phoneCode,
            }));
          } else {
            setFormData((prev) => ({ ...prev, whatsapp: "" }));
          }
        }}
      />
      WhatsApp number same as phone
    </label>
  </div>

  {/* ================= BASIC INFO ================= */}
  <div className="space-y-5">
    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
      Basic Information
    </h3>

    <div className="grid sm:grid-cols-3 gap-4">
      <div>
        <input
          type="number"
          name="age"
          placeholder="Age / വയസ്"
          onChange={handleChange}
          className={`${inputClass("age")} placeholder:text-[11px]`}
        />
        {errors.age && <p className="text-red-500 text-xs">{errors.age}</p>}
      </div>

      <div className="relative">
        <label className="absolute -top-2 left-4 bg-white px-1 text-[11px] text-gray-500">
          Date of Birth
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
          onChange={handleChange}
          className={`${inputClass("bloodGroup")}`}
        >
          <option value="">Blood Group</option>
          {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "NIL"].map(
            (bg) => (
              <option key={bg}>{bg}</option>
            )
          )}
        </select>
        {errors.bloodGroup && (
          <p className="text-red-500 text-xs">{errors.bloodGroup}</p>
        )}
      </div>
    </div>
  </div>

  {/* ================= ADDRESS ================= */}
  <div className="space-y-3">
    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
      Address
    </h3>

    <textarea
      name="address"
      placeholder="Address / അഡ്രസ്"
      onChange={handleChange}
      className={`${inputClass("address")} placeholder:text-[11px] h-24`}
    />
    {errors.address && (
      <p className="text-red-500 text-xs">{errors.address}</p>
    )}
  </div>

  {/* ================= UPLOADS & PAYMENT ================= */}
  <div className="space-y-6">
    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
      Upload & Payment
    </h3>

    <div className="flex flex-col lg:flex-row gap-6">
      {/* Uploads */}
      <div className="flex-1 space-y-5">
        {/* Profile Photo */}
        <div>
          <label className="text-sm font-medium">Profile Photo</label>
          <div className="relative border-2 border-dashed rounded-2xl p-4 text-center hover:border-blue-400 transition">
            {photo ? (
              <img
                src={URL.createObjectURL(photo)}
                className="w-20 h-20 rounded-full mx-auto object-cover shadow"
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
          <label className="text-sm font-medium">Payment Screenshot</label>
          <div className="relative border-2 border-dashed rounded-2xl p-4 text-center hover:border-blue-400 transition">
            {paymentScreenshot ? (
              <img
                src={URL.createObjectURL(paymentScreenshot)}
                className="w-32 mx-auto rounded-lg shadow"
              />
            ) : (
              <p className="text-[11px] text-gray-500">
                Upload payment screenshot / രസീത് അപ്ലോഡ് ചെയ്യുക
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

      {/* QR */}
      <div className="flex items-center justify-center">
        <div className="bg-gray-50 rounded-2xl p-5 shadow-sm text-center space-y-3">
          <div className="relative">
            <img
              src={Qr}
              alt="QR Code"
              className={`w-36 mx-auto transition-all duration-300 ${
                showQR ? "blur-0 scale-50" : "blur-md scale-50"
              }`}
            />
            {!showQR && (
              <button
                type="button"
                onClick={() => setShowQR(true)}
                className="absolute inset-0 bg-black/40 text-white rounded-xl flex items-center justify-center text-sm"
              >
                View QR
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500">
            Scan to complete payment
          </p>
        </div>
      </div>
    </div>
  </div>

  {/* ================= SUBMIT ================= */}
  <button
    type="submit"
    disabled={loading}
    className="w-full bg-gradient-to-r from-blue-700 to-blue-900 text-white py-3 rounded-2xl font-semibold hover:scale-[1.01] transition disabled:opacity-60"
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
