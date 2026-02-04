import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import MembershipCard from "../pages/MemberCard";

export default function MemberDashboard() {
  const STATIC_VALID_UPTO = "31/03/2027";
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
      navigate("/");
      return;
    }

    axios
      .get(`https://club-membership.vercel.app/api/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setMember(res.data.user);
        setLoading(false);
      })
      .catch(() => navigate("/"));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading dashboard...
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Membership under review
      </div>
    );
  }

  return (
    <div className="flex">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r hidden md:flex flex-col justify-between">
        <div className="p-6 text-2xl font-bold text-indigo-600">Member Portal</div>
        <div className="border-t p-4">
          <button
            onClick={handleLogout}
            className="w-full text-red-600 font-medium hover:bg-red-50 py-2 rounded-lg"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-6 space-y-8">
        {/* PROFILE HEADER */}
        <div className="bg-white rounded-2xl shadow p-6 flex flex-col md:flex-row gap-6 items-center">
          <img
            src={member.photo || "/default-avatar.png"}
            alt={member.name}
            className="w-32 h-32 rounded-full border-4 border-indigo-500 object-cover"
          />
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold uppercase">{member.nickname}</h1>
            <p className="text-gray-600">{member.phone}</p>

            <span className="inline-block mt-2 px-4 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700">
              {member.membershipId?.toUpperCase()}
            </span>
          </div>
        </div>

        {/* USER DETAILS */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-bold mb-4">Member Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <Detail label="Full Name" value={member.name} />
            <Detail label="Membership ID" value={member.membershipId} />
            <Detail label="Phone" value={member.phone} />
            <Detail label="Blood Group" value={member.bloodGroup || "N/A"} />
            <Detail label="Valid Upto" value={STATIC_VALID_UPTO || "N/A"} />
            <Detail label="Joined On" value={new Date(member.createdAt).toLocaleDateString()} />
          </div>
        </div>

        {/* MEMBERSHIP CARD INLINE */}
        {member.membershipStatus === "approved" && (
          <div className=" rounded-2xl px-13  shadow  flex flex-col items-center gap-6">
            {/* Pass the member directly as a prop */}
            <MembershipCard user={member} />
          </div>
        )}
      </main>
    </div>
  );
}

/* SMALL HELPER COMPONENT */
function Detail({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <p className="text-gray-500 text-xs">{label}</p>
      <p className="font-semibold text-gray-800">{value}</p>
    </div>
  );
}
