import React, { useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MemberContent from "../components/MemberContent";
import html2canvas from "html2canvas";

const MembershipCard = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const user = state?.user;

  const componentRef = useRef(null);

  /* ==============================
     DOWNLOAD AS IMAGE
  ============================== */
  const handleDownloadImage = async () => {
    if (!componentRef.current) return;

    try {
      const canvas = await html2canvas(componentRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        onclone: (clonedDoc) => {
          const root = clonedDoc.documentElement;
          root.style.color = "#000000";

          clonedDoc.querySelectorAll("*").forEach((el) => {
            const computed = clonedDoc.defaultView.getComputedStyle(el);

            ["color", "background-color", "border-color", "outline-color"].forEach(
              (prop) => {
                const value = computed.getPropertyValue(prop);
                if (value && value.includes("oklch")) {
                  el.style.setProperty(prop, "#000000", "important");
                }
              }
            );
          });
        },
      });

      const imageData = canvas.toDataURL("image/png");

      const link = document.createElement("a");

      const fileId = user?.membershipId
        ? user.membershipId.slice(-4).toUpperCase()
        : "CARD";

      link.download = `Membership_${fileId}.png`;
      link.href = imageData;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Image download failed:", error);
      alert("Image download failed. Please try again.");
    }
  };

  /* ==============================
     RENDER
  ============================== */
  if (!user) {
    return (
      <div className="flex flex-col items-center text-center">
        <p className="text-red-600 mb-4">
          Invalid access. Please open from dashboard.
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-gray-800 text-white px-4 py-2 rounded"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center pt-8">
      {/* Membership card capture area */}
      <div ref={componentRef}>
        <MemberContent user={user} />
      </div>

      {/* Download button */}
      <button
        onClick={handleDownloadImage}
        className="mt-6 bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition"
      >
        Download Image
      </button>
    </div>
  );
};

export default MembershipCard;
