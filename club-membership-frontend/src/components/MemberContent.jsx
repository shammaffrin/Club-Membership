import React from "react";

// Assets (user said they will provide all images)
import BgMain from "../assets/hashtag.webp";
import Hashtag from "../assets/hashtag2.webp";
import Logo from "../assets/logoFile.webp";
import name from "../assets/name.webp"
import Lines from "../assets/lines.webp";
import LinesFlip from "../assets/lines-flip.webp";
import Lines2 from "../assets/lines2.webp";
import NameImg from "../assets/name.webp";
import Stamp from "../assets/stamp.webp";
import Signature from "../assets/Signatur.webp";

export default function MembershipCard({ user }) {
  if (!user) return null; // no user data yet

    const STATIC_VALID_UPTO = "31/03/2027";
  
  return (
    <div className="w-[490px] h-[330px] bg-[#f4f1f1] relative overflow-hidden rounded-3xl shadow-xl font-sans">
      {/* Top Blue Header */}
      <div className="w-[450px] h-[100px] bg-gradient-to-r relative overflow-hidden from-[#203a8f] rounded-2xl to-[#1f6bd6] m-4">
          <img
            src={Lines2}
            alt="Card Background"
            className="absolute w-[800px] h-[117px] -bottom-5 left-0"
          />
        </div>

      {/* Header Waves */}
      <img src={LinesFlip} alt="lines" className="absolute -top-5 left-0 w-full h-87 opacity-40" />

      {/* Club Logo */}
      <img src={Logo} alt="logo" className="absolute top-6 left-6 w-15" />

      {/* Header Text */}
      <div className="absolute -right-27 -top-15 w-[500px] ">
        <img src={name} alt="logo" className=" " />
      </div>

      {/* Hashtag */}
      <img src={Hashtag} alt="hashtag" className="absolute top-[90px] left-[220px] w-46" />

      {/* Profile Image */}
      <div className="absolute top-[56px] left-20 w-30 h-30 rounded-full border-[6px] border-blue-600 overflow-hidden bg-white">
        <img src={user.photo} alt="profile" className="w-full h-full object-cover" />
      </div>

      {/* Name & ID */}
      <div className="absolute top-[120px] left-[220px]">
        <p className=" font-bold text-yellow-600">{user.nickname}</p>
        <p className=" text-yellow-600 ">{user.membershipId}</p>
      </div>

      {/* Member Details */}
      <div className="absolute bottom-5 left-12 text-[12px]">
        <div className="grid grid-cols-[130px_10px_auto] ">
          <p>FULL NAME</p><p>:</p><p className="font-semibold">{user.name}</p>
          <p>MEMBERSHIP ID</p><p>:</p><p className="font-semibold">{user.membershipId}</p>
          <p>MOBILE NO</p><p>:</p><p className="font-semibold">{user.phone}</p>
          <p>BLOOD GROUP</p><p>:</p><p className="font-semibold">{user.bloodGroup}</p>
          <p>VALID UPTO</p><p>:</p><p className="font-semibold">{user.validUpto || STATIC_VALID_UPTO}</p>

        </div>
      </div>

      {/* Stamp */}
      <img src={Stamp} alt="stamp" className="absolute bottom-5 right-23 w-23 opacity-90" />

      {/* Signature */}
     <div className="absolute bottom-[14px] right-[17px] flex flex-col items-center text-center">
  <img
    src={Signature}
    alt="Signature"
    className="w-[50px] pb-1"
  />

  <p className="border-b border-b-zinc-500 w-[70px]"></p>

  <p className="font-medium text-[5px] text-gray-600 pt-1">
    Authorised Signatory
  </p>
  <p className="font-medium text-[5px] text-gray-600">
    (Gen. Secretary)
  </p>
</div>


         

      {/* Bottom Waves */}
      {/* <img src={LinesFlip} alt="wave" className="absolute bottom-0 left-0 w-full opacity-60" /> */}
      {/* <img src={Lines2} alt="wave2" className="absolute bottom-0 left-0 w-full opacity-40" /> */}
    </div>
  );
}
