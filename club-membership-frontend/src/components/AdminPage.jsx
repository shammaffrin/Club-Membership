import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AdminPage() {
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

      {/* Main */}
      <main className="flex-1 p-4 md:p-6 overflow-x-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center md:text-left">
          Pending Approvals
        </h1>

        {error && (
          <p className="text-red-500 mb-4 text-center md:text-left">{error}</p>
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
                className="bg-white shadow rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center"
              >
                {/* Photo */}
                <img
                  src={user.photo || "/no-user.png"}
                  alt={user.name}
                  onClick={() => setPreviewImage(user.photo)}
                  onError={(e) => (e.target.src = "/no-user.png")}
                  className="w-20 h-20 rounded-full object-cover border cursor-pointer hover:scale-105 transition"
                />

                {/* Details */}
                <div className="flex-1 space-y-1 text-sm sm:text-base overflow-x-auto">
                  <p><b>Name:</b> {user.name}</p>
                  <p><b>Father Name:</b> {user.fatherName || "—"}</p>
                  <p><b>Nickname:</b> {user.nickname}</p>
                  <p><b>Email:</b> {user.email || "—"}</p>
                  <p><b>Phone:</b> {user.phone}</p>
                  <p><b>WhatsApp:</b> {user.Whatsapp}</p>
                  <p><b>Blood Group:</b> {user.bloodGroup}</p>
                  <p><b>Address:</b> {user.address}</p>
                  <p><b>DOB:</b> {formatDate(user.dob)}</p>
                  <p><b>Valid Upto:</b> {user.expiryDate}</p>

                  {user.paymentProof && (
                    <a
                      href={user.paymentProof}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 text-sm"
                    >
                      View Payment Proof
                    </a>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-wrap mt-2 sm:mt-0">
                  <button
                    onClick={() => approveUser(user._id)}
                    disabled={actionLoading === user._id}
                    className={`px-4 py-2 rounded-lg text-white ${
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
                    className={`px-4 py-2 rounded-lg text-white ${
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

        {/* IMAGE PREVIEW MODAL */}
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
                className="absolute -top-4 -right-4 bg-white rounded-full px-3 py-1 text-lg font-bold shadow"
              >
                ✕
              </button>

              <img
                src={previewImage}
                alt="User Full"
                className="max-w-full max-h-[80vh] rounded-lg shadow-lg"
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
