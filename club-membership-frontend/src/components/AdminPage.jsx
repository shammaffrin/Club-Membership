import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AdminPage() {
  const STATIC_VALID_UPTO = "31/03/2027";
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [previewImage, setPreviewImage] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");

  const authHeader = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const fetchUsers = async () => {
    if (!token) {
      navigate("/admin-login");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await axios.get(
        "https://club-membership.vercel.app/api/admin/pending-users",
        authHeader
      );
      setUsers(res.data.users || []);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("adminToken");
        navigate("/admin-login");
      } else {
        setError(err.response?.data?.message || "Error fetching users");
      }
    } finally {
      setLoading(false);
    }
  };

  const approveUser = async (id) => {
    try {
      setActionLoading(id);
      setError("");
      const res = await axios.put(
        `https://club-membership.vercel.app/api/admin/approve/${id}`,
        {},
        authHeader
      );
      alert(`User approved! Membership ID: ${res.data.user.membershipId}`);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Error approving user");
    } finally {
      setActionLoading(null);
    }
  };

  const rejectUser = async (id) => {
    try {
      setActionLoading(id);
      setError("");
      await axios.put(
        `https://club-membership.vercel.app/api/admin/reject/${id}`,
        {},
        authHeader
      );
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Error rejecting user");
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin-login");
  };

  useEffect(() => {
    if (!token) navigate("/admin-login");
    else fetchUsers();
  }, [token]);

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white shadow-md flex md:flex-col flex-row md:min-h-screen">
        <div className="px-4 py-3 md:px-6 md:py-4 text-xl md:text-2xl font-bold border-b">
          Admin Panel
        </div>

        <nav className="flex-1 px-2 py-3 md:px-4 md:py-6 flex md:block gap-2 md:space-y-2">
          <button
            onClick={() => navigate("/admin")}
            className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-200"
          >
            Dashboard
          </button>
          <button
            onClick={() => navigate("/users")}
            className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-200"
          >
            Users
          </button>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-200"
          >
            Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 overflow-x-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center md:text-left text-indigo-700">
          Pending Approvals
        </h1>

        {error && (
          <p className="text-red-500 mb-4 text-center md:text-left font-medium">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-center text-gray-500 text-lg">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="text-center text-gray-500 text-lg">No pending users</p>
        ) : (
          <div className="space-y-6">
            {users.map((user) => (
              <div
                key={user._id}
                className="bg-white shadow-lg rounded-3xl p-5 flex flex-col sm:flex-row gap-5 sm:items-center transition-transform hover:scale-[1.01]"
              >
                {/* Photo */}
                <a
                  href={user.photo || "/no-user.png"}
                  download={`${user.name || "user"}-photo.jpg`}
                  onClick={() => setPreviewImage(user.photo)}
                  className="flex-shrink-0"
                >
                  <img
                    src={user.photo || "/no-user.png"}
                    alt={user.name}
                    onError={(e) => (e.target.src = "/no-user.png")}
                    className="w-24 h-24 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-indigo-300 shadow-md cursor-pointer hover:scale-105 transition-transform"
                  />
                </a>

                {/* Details */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm sm:text-base overflow-x-auto">
                  <Detail label="Name" value={user.name} />
                  <Detail label="Father Name" value={user.fatherName || "—"} />
                  <Detail label="Nickname" value={user.nickname} />
                  <Detail label="Email" value={user.email || "—"} />
                  <Detail label="Phone" value={user.phone} />
                  <Detail label="WhatsApp" value={user.whatsapp} />
                  <Detail label="Blood Group" value={user.bloodGroup} />
                  <Detail label="Address" value={user.address} />
                  <Detail label="DOB" value={formatDate(user.dob)} />
                  <Detail label="Valid Upto" value={STATIC_VALID_UPTO} />
                  {user.paymentProof && (
                    <a
                      href={user.paymentProof}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 text-sm col-span-full hover:underline"
                    >
                      View Payment Proof
                    </a>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-wrap mt-3 sm:mt-0 sm:flex-col">
                  <button
                    onClick={() => approveUser(user._id)}
                    disabled={actionLoading === user._id}
                    className={`px-5 py-2 rounded-full text-white font-semibold transition-all duration-200 ${
                      actionLoading === user._id
                        ? "bg-green-400"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    {actionLoading === user._id ? "Processing..." : "Approve"}
                  </button>

                  <button
                    onClick={() => rejectUser(user._id)}
                    disabled={actionLoading === user._id}
                    className={`px-5 py-2 rounded-full text-white font-semibold transition-all duration-200 ${
                      actionLoading === user._id
                        ? "bg-red-400"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    {actionLoading === user._id ? "Processing..." : "Reject"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Image Preview Modal */}
        {previewImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-2"
            onClick={() => setPreviewImage(null)}
          >
            <div
              className="relative max-w-[90%] max-h-[90%]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute -top-4 -right-4 bg-white rounded-full px-3 py-1 text-lg font-bold shadow hover:bg-gray-100 transition"
              >
                ✕
              </button>

              <img
                src={previewImage}
                alt="User Full"
                className="max-w-full max-h-[80vh] rounded-2xl shadow-xl"
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/* Helper component for user details */
function Detail({ label, value }) {
  return (
    <div className="bg-indigo-50 p-3 rounded-xl hover:bg-indigo-100 transition-all shadow-sm">
      <p className="text-indigo-700 text-xs font-medium">{label}</p>
      <p className="font-semibold text-gray-800 text-sm">{value}</p>
    </div>
  );
}
