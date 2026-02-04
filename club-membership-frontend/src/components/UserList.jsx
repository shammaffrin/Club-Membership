import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AdminUserList() {
  const STATIC_VALID_UPTO = "31/03/2027";
  const [approvedUsers, setApprovedUsers] = useState([]);
  const [rejectedUsers, setRejectedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
const [editForm, setEditForm] = useState({});
const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
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

  const openEditModal = (user) => {
  setEditingUser(user);
  setEditForm({
    name: user.name || "",
    phone: user.phone || "",
    email: user.email || "",
    address: user.address || "",
    dob: user.dob ? user.dob.split("T")[0] : "",
    bloodGroup: user.bloodGroup || "",
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
      <main className="flex-1 p-4 md:p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-6">
          User List
        </h1>

        {/* Filter Buttons */}
        <div className="flex gap-3 justify-center mb-8 flex-wrap">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg ${
              filter === "all" ? "bg-gray-800 text-white" : "bg-white border"
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
              filter === "rejected" ? "bg-red-600 text-white" : "bg-white border"
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
                {approvedUsers.map((user) => (
                  <div
  key={user._id}
  className="bg-white shadow-md rounded-xl p-4 space-y-4"
>
  {/* TOP SECTION */}
  <div className="flex items-center gap-4">
    <img
      src={user.photo || "/default-user.png"}
      alt={user.name}
      className="w-20 h-20 rounded-full object-cover border"
      onError={(e) => (e.target.src = "/default-user.png")}
    />

    <div className="flex-1">
      <p className="text-lg font-semibold">{user.name}</p>
      <p className="text-sm text-gray-600">
        ID: <b>{user.membershipId}</b>
      </p>
      <p className="text-sm text-gray-600">
        Valid Upto: <b>{STATIC_VALID_UPTO}</b>
      </p>
    </div>

    <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm">
      Approved
    </span>
  </div>

  {/* DETAILS GRID */}
  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 text-sm">
    <p><b>Phone:</b> {user.phone}</p>
    <p><b>Email:</b> {user.email || "—"}</p>
    <p><b>Father:</b> {user.fatherName || "—"}</p>
    <p><b>Nickname:</b> {user.nickname || "—"}</p>
    <p><b>Whatsapp:</b> {user.whatsapp || "—"}</p>
    <p><b>DOB:</b> {formatDate(user.dob)}</p>
    <p><b>Blood:</b> {user.bloodGroup || "—"}</p>
    <p className="col-span-2 md:col-span-3">
      <b>Address:</b> {user.address || "—"}
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
  <div className="flex gap-3 pt-2">
    <a
      href={getWhatsAppLink(user)}
      target="_blank"
      rel="noreferrer"
      className="flex-1 text-center px-4 py-2 bg-gray-800 text-white rounded-lg text-sm hover:bg-gray-900"
    >
      Share
    </a>

    <button
      onClick={() => openEditModal(user)}
      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
    >
      Edit
    </button>
  </div>
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
                {rejectedUsers.map((user) => (
                  <div
  key={user._id}
  className="bg-white shadow-md rounded-xl p-4 space-y-4"
>
  {/* TOP SECTION */}
  <div className="flex items-center gap-4">
    <img
      src={user.photo || "/default-user.png"}
      alt={user.name}
      className="w-20 h-20 rounded-full object-cover border"
      onError={(e) => (e.target.src = "/default-user.png")}
    />

    <div className="flex-1">
      <p className="text-lg font-semibold">{user.name}</p>
      <p className="text-sm text-gray-600">
        ID: <b>{user.membershipId}</b>
      </p>
      <p className="text-sm text-gray-600">
        Valid Upto: <b>{STATIC_VALID_UPTO}</b>
      </p>
    </div>

    <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm">
      Approved
    </span>
  </div>

  {/* DETAILS GRID */}
  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 text-sm">
    <p><b>Phone:</b> {user.phone}</p>
    <p><b>Email:</b> {user.email || "—"}</p>
    <p><b>Father:</b> {user.fatherName || "—"}</p>
    <p><b>Nickname:</b> {user.nickname || "—"}</p>
    <p><b>Whatsapp:</b> {user.whatsapp || "—"}</p>
    <p><b>DOB:</b> {formatDate(user.dob)}</p>
    <p><b>Blood:</b> {user.bloodGroup || "—"}</p>
    <p className="col-span-2 md:col-span-3">
      <b>Address:</b> {user.address || "—"}
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
  <div className="flex gap-3 pt-2">
    <a
      href={getWhatsAppLink(user)}
      target="_blank"
      rel="noreferrer"
      className="flex-1 text-center px-4 py-2 bg-gray-800 text-white rounded-lg text-sm hover:bg-gray-900"
    >
      Share
    </a>

    <button
      onClick={() => openEditModal(user)}
      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
    >
      Edit
    </button>
  </div>
</div>

                ))}
              </div>
            )}
          </section>
        )}
      </main>
      {editingUser && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-3">
      <h2 className="text-xl font-bold text-center">Edit User</h2>

      <input
        className="w-full border p-2 rounded"
        placeholder="Name"
        value={editForm.name}
        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
      />

      <input
        className="w-full border p-2 rounded"
        placeholder="Phone"
        value={editForm.phone}
        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
      />

      <input
        className="w-full border p-2 rounded"
        placeholder="Email"
        value={editForm.email}
        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
      />

      <input
        type="date"
        className="w-full border p-2 rounded"
        value={editForm.dob}
        onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })}
      />

      <input
        className="w-full border p-2 rounded"
        placeholder="Blood Group"
        value={editForm.bloodGroup}
        onChange={(e) =>
          setEditForm({ ...editForm, bloodGroup: e.target.value })
        }
      />

      <textarea
        className="w-full border p-2 rounded"
        placeholder="Address"
        value={editForm.address}
        onChange={(e) =>
          setEditForm({ ...editForm, address: e.target.value })
        }
      />

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

    </div>
  );
}
