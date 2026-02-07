import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

export default function AdminUserList() {
  const STATIC_VALID_UPTO = "31/03/2027";
  const [approvedUsers, setApprovedUsers] = useState([]);
  const [rejectedUsers, setRejectedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("adminToken");

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      if (!token) throw new Error("Admin token not found");
      const res = await axios.get(
        "https://club-membership.vercel.app/api/admin/all-users",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const users = res.data.users || [];
      setApprovedUsers(users.filter(u => u.membershipStatus === "approved"));
      setRejectedUsers(users.filter(u => u.membershipStatus === "rejected"));
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) navigate("/admin-login");
    else fetchUsers();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin-login");
  };

  const approveUser = async (id) => {
    if (!window.confirm("Approve this user?")) return;
    await axios.put(
      `https://club-membership.vercel.app/api/admin/approve/${id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchUsers();
  };

  const rejectUser = async (id) => {
    if (!window.confirm("Reject this user?")) return;
    await axios.put(
      `https://club-membership.vercel.app/api/admin/reject/${id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchUsers();
  };


  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user permanently?")) return;
    await axios.delete(
      `https://club-membership.vercel.app/api/admin/user/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchUsers();
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setEditForm({
      name: user.name || "",
      phone: user.phone || "",
      email: user.email || "",
      address: user.address || "",
      dob: user.dob ? user.dob.split("T")[0] : "",
      bloodGroup: user.bloodGroup || "",
      place: user.place || "",
      gender: user.gender || "",
    });
  };

  const handleSaveChanges = async () => {
    try {
      setActionLoading(true);
      await axios.put(
        `https://club-membership.vercel.app/api/admin/user/${editingUser._id}`,
        editForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    } finally {
      setActionLoading(false);
    }
  };

  const getWhatsAppLink = (user) => {
    const phone = (user.whatsapp || user.phone).replace("+", "");
    let message = user.membershipStatus === "approved"
      ? `Hello ${user.name}, your membership has been approved. ID: ${user.membershipId}`
      : `Hello ${user.name}, your membership has been rejected.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

  const filteredUsers = filter === "all"
    ? [...approvedUsers, ...rejectedUsers]
    : filter === "approved"
      ? approvedUsers
      : rejectedUsers;

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-gray-100">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white shadow-md md:flex md:flex-col flex-col md:min-h-screen p-3 md:p-0">
        <div className="text-xl md:text-2xl font-bold text-indigo-600 text-center md:text-center m-3 md:mb-0">
          Admin Panel
        </div>

        {/* Mobile Tabs */}
        <div className="flex md:hidden justify-around mb-3">
          {["Requests", "Members", "Logout"].map((tab) => {
            const isActive = (tab === "Requests" && location.pathname === "/admin") ||
              (tab === "Members" && location.pathname === "/users");
            return (
              <button
                key={tab}
                onClick={() => {
                  if (tab === "Requests") navigate("/admin");
                  else if (tab === "Members") navigate("/users");
                  else handleLogout();
                }}
                className={`px-3 py-2 rounded-md text-sm font-semibold transition
                  ${isActive ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Desktop Sidebar */}
        <nav className="hidden md:flex flex-col flex-1 px-2 py-3 gap-2">
          <SidebarButton label="Requests" active={location.pathname === "/admin"} onClick={() => navigate("/admin")} color="blue" />
          <SidebarButton label="Members" active={location.pathname === "/users"} onClick={() => navigate("/users")} color="blue" />
          <SidebarButton label="Logout" active={false} onClick={handleLogout} color="red" />
        </nav>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-3 sm:p-4 md:p-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-5 sm:mb-6">
          User List
        </h1>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6">
          {["all", "approved", "rejected"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm sm:text-base ${filter === f ? "bg-gray-800 text-white" : "bg-white border"}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 gap-4">
          {filteredUsers.map(user => (
            <UserCard key={user._id} user={user} STATIC_VALID_UPTO={STATIC_VALID_UPTO}
              approveUser={approveUser} rejectUser={rejectUser} deleteUser={deleteUser}
              openEditModal={openEditModal} getWhatsAppLink={getWhatsAppLink} />
          ))}
        </div>
      </main>

      {/* EDIT MODAL */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-3">
          <div className="bg-white rounded-xl p-5 w-full max-w-md max-h-[90vh] overflow-y-auto space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-center">Edit User</h2>
            <input className="w-full border p-2 rounded" placeholder="Name" value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            <input className="w-full border p-2 rounded" placeholder="Phone" value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
            <input className="w-full border p-2 rounded" placeholder="Email" value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
            <input type="date" className="w-full border p-2 rounded" value={editForm.dob}
              onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })} />
            <input className="w-full border p-2 rounded" placeholder="Blood Group" value={editForm.bloodGroup}
              onChange={(e) => setEditForm({ ...editForm, bloodGroup: e.target.value })} />
            <textarea className="w-full border p-2 rounded" placeholder="Address" value={editForm.address}
              onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} />
            <input className="w-full border p-2 rounded" placeholder="Place" value={editForm.place}
              onChange={(e) => setEditForm({ ...editForm, place: e.target.value })} />

            <div className="flex justify-between pt-4">
              <button onClick={() => setEditingUser(null)} className="px-4 py-2 border rounded">Cancel</button>
              <button disabled={actionLoading} onClick={handleSaveChanges} className="px-4 py-2 bg-green-600 text-white rounded">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* COMPONENTS */
function SidebarButton({ label, icon, active, onClick, color }) {
  const baseClasses = "w-full flex items-center px-4 py-2 rounded-lg transition font-medium";

  let buttonClasses = "";
  if (color === "red") {
    buttonClasses = "bg-red-600 text-white hover:bg-red-700";
  } else if (active) {
    buttonClasses = "bg-blue-600 text-white";
  } else {
    buttonClasses = "hover:bg-gray-100 text-gray-700";
  }

  return (
    <button onClick={onClick} className={`${baseClasses} ${buttonClasses}`}>
      {icon && <span className="mr-2">{icon}</span>}
      <span>{label}</span>
    </button>
  );
}


function UserCard({ user, STATIC_VALID_UPTO, approveUser, rejectUser, deleteUser, openEditModal, getWhatsAppLink }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-4 w-full flex flex-col">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <img src={user.photo || "/default-user.png"} alt={user.name} className="w-20 h-20 rounded-full object-cover border" />
          <div>
            <p className="font-semibold text-lg">{user.name}</p>
            <p className="text-xs text-gray-600">ID: {user.membershipId}</p>
          </div>
        </div>
        <button onClick={() => setExpanded(!expanded)} className="px-3 py-1 text-xs bg-indigo-500 text-white rounded">
          {expanded ? "Collapse" : "Expand"}
        </button>
      </div>

      {expanded && (
        <div className="mt-3 text-sm space-y-2">
          <p><b>Phone:</b> {user.phone}</p>
          <p><b>Email:</b> {user.email || "—"}</p>
          <p><b>Father:</b> {user.fatherName || "—"}</p>
          <p><b>Nickname:</b> {user.nickname || "—"}</p>
          <p><b>Whatsapp:</b> {user.whatsapp || "—"}</p>
          <p><b>DOB:</b> {user.dob ? new Date(user.dob).toLocaleDateString() : "—"}</p>
          <p><b>Blood Group:</b> {user.bloodGroup || "—"}</p>
          <p><b>Address:</b> {user.address || "—"}</p>
          <p><b>Place:</b> {user.place || "—"}</p>

          <div className="flex gap-2 flex-wrap pt-2">
            {user.membershipStatus === "approved" && (
              <button
                onClick={() => rejectUser(user._id)}
                className="px-2 py-1 text-xs bg-orange-600 text-white rounded"
              >
                Reject
              </button>
            )}

            {user.membershipStatus === "rejected" && (
              <button
                onClick={() => approveUser(user._id)}
                className="px-2 py-1 text-xs bg-green-600 text-white rounded"
              >
                Re-Approve
              </button>
            )}
            <button onClick={() => openEditModal(user)} className="px-2 py-1 text-xs bg-blue-600 text-white rounded">Edit</button>
            <button onClick={() => deleteUser(user._id)} className="px-2 py-1 text-xs bg-red-800 text-white rounded">Delete</button>
            <a href={getWhatsAppLink(user)} target="_blank" className="px-2 py-1 text-xs bg-gray-800 text-white rounded">Share</a>
          </div>
        </div>
      )}
    </div>
  );
}
