import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AdminUserList() {
  const [approvedUsers, setApprovedUsers] = useState([]);
  const [rejectedUsers, setRejectedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // all | approved | rejected

  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");

  const fetchUsers = async () => {
    setLoading(true);
    setError("");

    try {
      if (!token) {
        setError("Admin token not found. Please login first.");
        return;
      }

      const res = await axios.get(
        "https://club-membership.vercel.app/api/admin/all-users",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const users = res.data.users || [];

      setApprovedUsers(users.filter(u => u.membershipStatus === "approved"));
      setRejectedUsers(users.filter(u => u.membershipStatus === "rejected"));
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100 flex-col md:flex-row">
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
        </nav>

        <button
          onClick={handleLogout}
          className="m-4 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-6">
          User List
        </h1>

        {/* Filter Buttons */}
        <div className="flex gap-3 justify-center mb-8 flex-wrap">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg ${
              filter === "all"
                ? "bg-gray-800 text-white"
                : "bg-white border"
            }`}
          >
            All
          </button>

          <button
            onClick={() => setFilter("approved")}
            className={`px-4 py-2 rounded-lg ${
              filter === "approved"
                ? "bg-green-600 text-white"
                : "bg-white border"
            }`}
          >
            Approved
          </button>

          <button
            onClick={() => setFilter("rejected")}
            className={`px-4 py-2 rounded-lg ${
              filter === "rejected"
                ? "bg-red-600 text-white"
                : "bg-white border"
            }`}
          >
            Rejected
          </button>
        </div>

        {/* Approved Users */}
        {(filter === "all" || filter === "approved") && (
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-green-600 mb-4">
              Approved Users
            </h2>

            {approvedUsers.length === 0 ? (
              <p className="text-gray-500">No approved users.</p>
            ) : (
              <div className="space-y-4">
                {approvedUsers.map(user => (
                  <div
                    key={user._id}
                    className="bg-white shadow-md rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center"
                  >
                    <img
                      src={user.photo || "/default-user.png"}
                      alt={user.name}
                      className="w-24 h-24 rounded-full object-cover border"
                      onError={(e) =>
                        (e.target.src = "/default-user.png")
                      }
                    />

                    <div className="flex-1 space-y-1 text-sm md:text-base">
                      <p><b>Name:</b> {user.name}</p>
                      <p><b>Nickname:</b> {user.nickname}</p>
                      <p><b>Email:</b> {user.email}</p>
                      <p><b>Phone:</b> {user.phone}</p>
                      <p><b>Membership ID:</b> {user.membershipId}</p>
                    </div>

                    <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm">
                      Approved
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Rejected Users */}
        {(filter === "all" || filter === "rejected") && (
          <section>
            <h2 className="text-xl font-semibold text-red-600 mb-4">
              Rejected Users
            </h2>

            {rejectedUsers.length === 0 ? (
              <p className="text-gray-500">No rejected users.</p>
            ) : (
              <div className="space-y-4">
                {rejectedUsers.map(user => (
                  <div
                    key={user._id}
                    className="bg-white shadow-md rounded-xl p-4 flex justify-between items-center"
                  >
                    <div className="space-y-1">
                      <p><b>Name:</b> {user.name}</p>
                      <p><b>Email:</b> {user.email}</p>
                      <p><b>Phone:</b> {user.phone}</p>
                    </div>

                    <span className="px-3 py-1 bg-red-500 text-white rounded-full text-sm">
                      Rejected
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
