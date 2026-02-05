import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

export default function AdminUserList() {
  const STATIC_VALID_UPTO = "31/03/2027";
  const [approvedUsers, setApprovedUsers] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [rejectedUsers, setRejectedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const location = useLocation();
  const [filter, setFilter] = useState("all"); // all | approved | rejected

  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");

  // Format date to DD/MM/YYYY
  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const approveUser = async (id) => {
    if (!window.confirm("Approve this user again?")) return;

    await axios.put(
      `https://club-membership.vercel.app/api/admin/approve/${id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    fetchUsers();
  };

  const rejectUser = async (id) => {
    if (!window.confirm("Reject this approved user?")) return;

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



  // WhatsApp share link generator
  // WhatsApp share link generator
  const getWhatsAppLink = (user) => {
    const rawNumber = user.whatsapp || user.phone;

    const phone = rawNumber.startsWith("+")
      ? rawNumber.replace("+", "")
      : rawNumber;

    let message = "";

    if (user.membershipStatus === "approved") {
      message =
        `Hello ${user.name}, Welcome to Kingstar Arts & Sports Club.
🎉 Your membership has been approved!

Membership ID: *${user.membershipId}*
Login Mob No.: ${user.phone}

Member Details:
• Full Name: ${user.name}
• Display / Nick Name: ${user.nickname || "—"}
• Father’s Name: ${user.fatherName || "—"}
• Place: ${user.address || "—"}
• Blood Group: ${user.bloodGroup || "—"}
• Valid Upto: ${STATIC_VALID_UPTO}


_Thank you for becoming a member of Kingstar Arts & Sports Club._

------------------------------
- Sabit Aboobacker (Gen. Sec)
📞 91 9747656653

_Kingstareriyapady.club_
https://www.instagram.com/kingstar.club/`;
    }

    if (user.membershipStatus === "rejected") {
      message =
        `Hello *${user.name}*,
Your membership request with Kingstar Eriyapady has been *rejected* due to {{Reason}}.

For further clarification, please contact the Secretary at:
📞 91 9747656653 (Sabit)

_Thank you for your interest in Kingstar Arts & Sports Club._

---------------------------------
_Kingstareriyapady.club_
https://www.instagram.com/kingstar.club/`;
    }

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };


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
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const users = res.data.users || [];
      setApprovedUsers(users.filter((u) => u.membershipStatus === "approved"));
      setRejectedUsers(users.filter((u) => u.membershipStatus === "rejected"));
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
    
    {/* Dashboard */}
    <button
      onClick={() => navigate("/admin")}
      className={`relative group w-full text-left px-4 py-2 rounded-lg
        hover:bg-gray-200 transition
        ${location.pathname === "/admin" ? "bg-gray-200 font-semibold" : ""}
      `}
    >
      <span
        className={`absolute left-0 top-0 h-full w-1 rounded-r transition
          ${location.pathname === "/admin"
            ? "bg-blue-600"
            : "bg-transparent group-hover:bg-blue-400"}
        `}
      />
      Dashboard
    </button>

    {/* Users */}
    <button
      onClick={() => navigate("/users")}
      className={`relative group w-full text-left px-4 py-2 rounded-lg
        hover:bg-gray-200 transition
        ${location.pathname === "/users" ? "bg-gray-200 font-semibold" : ""}
      `}
    >
      <span
        className={`absolute left-0 top-0 h-full w-1 rounded-r transition
          ${location.pathname === "/users"
            ? "bg-blue-600"
            : "bg-transparent group-hover:bg-blue-400"}
        `}
      />
      Users
    </button>

    {/* Logout */}
    <button
      onClick={handleLogout}
      className="relative group w-full text-left px-4 py-2 rounded-lg hover:bg-red-50 transition"
    >
      <span className="absolute left-0 top-0 h-full w-1 rounded-r bg-transparent group-hover:bg-red-500 transition" />
      Logout
    </button>

  </nav>
</aside>


      {/* Main Content */}
      <main className="flex-1 p-3 sm:p-4 md:p-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-5 sm:mb-6">
          User List
        </h1>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm sm:text-base ${filter === "all" ? "bg-gray-800 text-white" : "bg-white border"
              }`}
          >
            All
          </button>

          <button
            onClick={() => setFilter("approved")}
            className={`px-4 py-2 rounded-lg text-sm sm:text-base ${filter === "approved"
              ? "bg-green-600 text-white"
              : "bg-white border"
              }`}
          >
            Approved
          </button>

          <button
            onClick={() => setFilter("rejected")}
            className={`px-4 py-2 rounded-lg text-sm sm:text-base ${filter === "rejected" ? "bg-red-600 text-white" : "bg-white border"
              }`}
          >
            Rejected
          </button>
        </div>

        {/* APPROVED USERS */}
        {(filter === "all" || filter === "approved") && (
          <section className="mb-10">
            <h2 className="text-lg sm:text-xl font-semibold text-green-600 mb-4">
              Approved Users
            </h2>

            {approvedUsers.length === 0 ? (
              <p className="text-gray-500 text-sm">No approved users.</p>
            ) : (
              <div className="space-y-4">
                {approvedUsers.map((user) => (
                  <div
                    key={user._id}
                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-3 sm:p-4 space-y-4"
                  >
                    {/* TOP SECTION */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                      <img
                        src={user.photo || "/default-user.png"}
                        alt={user.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border mx-auto sm:mx-0"
                        onError={(e) => (e.target.src = "/default-user.png")}
                      />

                      <div className="flex-1 text-center sm:text-left">
                        <p className="text-base sm:text-lg font-semibold">
                          {user.name}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600">
                          ID: <b>{user.membershipId}</b>
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600">
                          Valid Upto: <b>{STATIC_VALID_UPTO}</b>
                        </p>
                      </div>

                      <span className="self-center sm:self-start px-3 py-1 bg-green-500 text-white rounded-full text-xs sm:text-sm">
                        Approved
                      </span>
                    </div>

                    {/* DETAILS GRID */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2 text-sm">
                      <p><b>Phone:</b> {user.phone}</p>
                      <p><b>Email:</b> {user.email || "—"}</p>
                      <p><b>Father:</b> {user.fatherName || "—"}</p>
                      <p><b>Nickname:</b> {user.nickname || "—"}</p>
                      <p><b>Whatsapp:</b> {user.whatsapp || "—"}</p>
                      <p><b>DOB:</b> {formatDate(user.dob)}</p>
                      <p><b>Blood:</b> {user.bloodGroup || "—"}</p>

                      <p className="sm:col-span-2 lg:col-span-3">
                        <b>Address:</b> {user.address || "—"}
                      </p>
                      <p className="sm:col-span-2 lg:col-span-3">
                        <b>Place:</b> {user.place || "—"}
                      </p>
                    </div>

                    {/* PAYMENT */}
                    {user.paymentProof && (
                      <a
                        href={user.paymentProof}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 text-sm inline-block"
                      >
                        View Payment Proof
                      </a>
                    )}

                    {/* ACTIONS */}
                    <div className="flex  gap-1 pt-2">
                      <a
                        href={getWhatsAppLink(user)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 px-2 py-1 text-xs text-center bg-gray-800 text-white rounded"
                      >
                        Share
                      </a>

                      <button
                        onClick={() => openEditModal(user)}
                        className="flex-1 px-2 py-1 text-xs bg-blue-600 text-white rounded"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => rejectUser(user._id)}
                        className="flex-1 px-2 py-1 text-xs bg-orange-600 text-white rounded"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => deleteUser(user._id)}
                        className="flex-1 px-2 py-1 text-xs bg-red-800 text-white rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
        {/* REJECTED USERS */}
        {(filter === "all" || filter === "rejected") && (
          <section className="mb-10">
            <h2 className="text-lg sm:text-xl font-semibold text-red-600 mb-4">
              Rejected Users
            </h2>

            {rejectedUsers.length === 0 ? (
              <p className="text-gray-500 text-sm">No rejected users.</p>
            ) : (
              <div className="space-y-4">
                {rejectedUsers.map((user) => (
                  <div
  key={user._id}
  className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-3 sm:p-4 space-y-4"
>
  {/* TOP SECTION */}
  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
    <img
      src={user.photo || "/default-user.png"}
      alt={user.name}
      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border mx-auto sm:mx-0"
      onError={(e) => (e.target.src = "/default-user.png")}
    />

    <div className="flex-1 text-center sm:text-left">
      <p className="text-base sm:text-lg font-semibold">{user.name}</p>
      <p className="text-xs sm:text-sm text-gray-600">
        ID: <b>{user.membershipId}</b>
      </p>
      <p className="text-xs sm:text-sm text-gray-600">
        Valid Upto: <b>{STATIC_VALID_UPTO}</b>
      </p>
    </div>

    <span className="self-center sm:self-start px-3 py-1 bg-red-500 text-white rounded-full text-xs sm:text-sm">
      Rejected
    </span>
  </div>

  {/* DETAILS GRID (same as approved) */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2 text-sm">
    <p><b>Phone:</b> {user.phone}</p>
    <p><b>Email:</b> {user.email || "—"}</p>
    <p><b>Father:</b> {user.fatherName || "—"}</p>
    <p><b>Nickname:</b> {user.nickname || "—"}</p>
    <p><b>Whatsapp:</b> {user.whatsapp || "—"}</p>
    <p><b>DOB:</b> {formatDate(user.dob)}</p>
    <p><b>Blood:</b> {user.bloodGroup || "—"}</p>

    <p className="sm:col-span-2 lg:col-span-3">
      <b>Address:</b> {user.address || "—"}
    </p>
    <p className="sm:col-span-2 lg:col-span-3">
      <b>Place:</b> {user.place || "—"}
    </p>
  </div>

  {/* ACTIONS – same layout as approved */}
  <div className="flex gap-1 pt-2">
    <button
      onClick={() => approveUser(user._id)}
      className="flex-1 px-2 py-1 text-xs bg-green-600 text-white rounded"
    >
      Approve
    </button>

    <button
      onClick={() => openEditModal(user)}
      className="flex-1 px-2 py-1 text-xs bg-blue-600 text-white rounded"
    >
      Edit
    </button>

    <button
      onClick={() => deleteUser(user._id)}
      className="flex-1 px-2 py-1 text-xs bg-red-800 text-white rounded"
    >
      Delete
    </button>
  </div>
</div>

                ))}
              </div>
            )}
          </section>
        )}


        {/* EDIT MODAL */}
        {editingUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-3">
            <div className="bg-white rounded-xl p-5 w-full max-w-md max-h-[90vh] overflow-y-auto space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-center">
                Edit User
              </h2>

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
                <button
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>

                <button
                  disabled={actionLoading}
                  onClick={handleSaveChanges}
                  className="px-4 py-2 bg-green-600 text-white rounded"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
