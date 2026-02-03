import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [previewImage, setPreviewImage] = useState(null);

  const [editingUser, setEditingUser] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");

  const authHeader = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "https://club-membership.vercel.app/api/admin/pending-users",
        authHeader
      );
      setUsers(res.data.users || []);
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching users");
      if (err.response?.status === 401) navigate("/admin-login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) navigate("/admin-login");
    else fetchUsers();
  }, [token]);

  const approveUser = async (id) => {
    try {
      setActionLoading(id);
      await axios.put(
        `https://club-membership.vercel.app/api/admin/approve/${id}`,
        {},
        authHeader
      );
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Approve failed");
    } finally {
      setActionLoading(null);
    }
  };

  const rejectUser = async (id) => {
    try {
      setActionLoading(id);
      await axios.put(
        `https://club-membership.vercel.app/api/admin/reject/${id}`,
        {},
        authHeader
      );
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Reject failed");
    } finally {
      setActionLoading(null);
    }
  };

  const updateUser = async () => {
    try {
      setEditLoading(true);
      await axios.put(
        `https://club-membership.vercel.app/api/admin/user/${editingUser._id}`,
        {
          name: editingUser.name,
          phone: editingUser.phone,
          email: editingUser.email,
          address: editingUser.address,
          dob: editingUser.dob,
          bloodGroup: editingUser.bloodGroup,
          gender: editingUser.gender,
        },
        authHeader
      );

      alert("User updated successfully");
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    } finally {
      setEditLoading(false);
    }
  };

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-GB")
      : "—";

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-6">Pending Users</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : users.length === 0 ? (
        <p>No pending users</p>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <div
              key={user._id}
              className="bg-white rounded-xl shadow p-4 flex flex-col md:flex-row gap-4"
            >
              <img
                src={user.photo || "/no-user.png"}
                alt=""
                onClick={() => setPreviewImage(user.photo)}
                className="w-20 h-20 rounded-full object-cover cursor-pointer"
              />

              <div className="flex-1 text-sm space-y-1">
                <p><b>Name:</b> {user.name}</p>
                <p><b>Phone:</b> {user.phone}</p>
                <p><b>Email:</b> {user.email || "—"}</p>
                <p><b>Blood:</b> {user.bloodGroup}</p>
                <p><b>DOB:</b> {formatDate(user.dob)}</p>
                <p><b>Address:</b> {user.address}</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => approveUser(user._id)}
                  className="bg-green-600 text-white px-4 py-2 rounded"
                >
                  Approve
                </button>

                <button
                  onClick={() => rejectUser(user._id)}
                  className="bg-red-600 text-white px-4 py-2 rounded"
                >
                  Reject
                </button>

                <button
                  onClick={() => setEditingUser(user)}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EDIT MODAL */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Edit User</h2>

            <div className="grid grid-cols-2 gap-3">
              <input
                value={editingUser.name}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, name: e.target.value })
                }
                placeholder="Name"
                className="border p-2 rounded"
              />
              <input
                value={editingUser.phone}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, phone: e.target.value })
                }
                placeholder="Phone"
                className="border p-2 rounded"
              />
              <input
                value={editingUser.email || ""}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, email: e.target.value })
                }
                placeholder="Email"
                className="border p-2 rounded"
              />
              <input
                value={editingUser.bloodGroup || ""}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, bloodGroup: e.target.value })
                }
                placeholder="Blood Group"
                className="border p-2 rounded"
              />
              <input
                type="date"
                value={editingUser.dob?.slice(0, 10) || ""}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, dob: e.target.value })
                }
                className="border p-2 rounded"
              />
              <input
                value={editingUser.address || ""}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, address: e.target.value })
                }
                placeholder="Address"
                className="border p-2 rounded col-span-2"
              />
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={updateUser}
                disabled={editLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                {editLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
