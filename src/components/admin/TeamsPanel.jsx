import React, { useEffect, useState } from "react";
import "./styles/AdminDashboard.css";

export default function TeamsPanel() {
  const [members, setMembers] = useState([]);
  const [formData, setFormData] = useState({ name: "", role: "" });
  const [photo, setPhoto] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [status, setStatus] = useState("");

  const API_BASE = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("adminToken");

  const fetchMembers = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/team`);
      const data = await res.json();
      setMembers(data);
    } catch (err) {
      console.error(err);
      setStatus("❌ Failed to load members");
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append("name", formData.name);
    form.append("role", formData.role);
    if (photo) form.append("photo", photo);

    try {
      const url = editingId
        ? `${API_BASE}/api/team/${editingId}`
        : `${API_BASE}/api/team`;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });

      const data = await res.json();

      if (data?.member) {
        setStatus(editingId ? "✅ Member updated" : "✅ Member added");
        setFormData({ name: "", role: "" });
        setPhoto(null);
        setEditingId(null);
        fetchMembers();
      } else {
        setStatus(data?.error || "❌ Failed to save member");
      }
    } catch (err) {
      console.error(err);
      setStatus("❌ Server error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this member?")) return;

    try {
      await fetch(`${API_BASE}/api/team/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setStatus("🗑️ Member deleted");
      fetchMembers();
    } catch (err) {
      console.error(err);
      setStatus("❌ Delete failed");
    }
  };

  const handleEdit = (member) => {
    setEditingId(member._id);
    setFormData({
      name: member.name,
      role: member.role,
    });
    setPhoto(null); // require reupload
    setStatus("✏️ Editing member...");
  };

  return (
    <div className="admin-dashboard">
      <h2>Team Members Panel</h2>
      {status && <p className="status-message">{status}</p>}

      <form
        className="team-form"
        onSubmit={handleSubmit}
        encType="multipart/form-data"
      >
        <input
          type="text"
          placeholder="Full Name"
          value={formData.name}
          onChange={(e) =>
            setFormData({ ...formData, name: e.target.value })
          }
          required
        />
        <input
          type="text"
          placeholder="Role"
          value={formData.role}
          onChange={(e) =>
            setFormData({ ...formData, role: e.target.value })
          }
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPhoto(e.target.files[0])}
          required={!editingId}
        />
        <button type="submit">
          {editingId ? "Update Member" : "Add Member"}
        </button>
      </form>

      <div className="member-list">
        {members.map((member) => (
          <div className="member-card" key={member._id}>
            {member.photoUrl && (
              <img
                src={`${API_BASE}${member.photoUrl}`}
                alt={member.name}
              />
            )}
            <h4>{member.name}</h4>
            <p>{member.role}</p>
            <div className="actions">
              <button onClick={() => handleEdit(member)}>Edit</button>
              <button onClick={() => handleDelete(member._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
