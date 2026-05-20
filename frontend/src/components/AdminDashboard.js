// src/components/AdminDashboard.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("appointments");
  const [loading, setLoading] = useState(false);

  // Appointment Edit States
  const [editingId, setEditingId] = useState(null);
  const [editPhone, setEditPhone] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editMessage, setEditMessage] = useState("");

  // Toast status notification state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/appointments?email=admin@careconnect.com");
      if (!res.ok) throw new Error("Failed to load appointments");
      const data = await res.json();
      setAppointments(data);
    } catch (err) {
      console.error("Error loading appointments:", err);
      showToast("Failed to load appointments from server.", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/users");
      if (!res.ok) throw new Error("Failed to load patient records");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Error loading patients:", err);
      showToast("Failed to load patient registry from server.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const adminEmail = localStorage.getItem("userEmail");
    const adminPass = localStorage.getItem("userPassword");

    if (adminEmail !== "admin@careconnect.com" || adminPass !== "admin123") {
      alert("Only admin allowed!");
      navigate("/login");
      return;
    }

    if (activeTab === "appointments") {
      fetchAppointments();
    } else {
      fetchUsers();
    }
  }, [activeTab, navigate]);

  // Handle start editing an appointment
  const handleStartEdit = (a) => {
    setEditingId(a._id);
    setEditPhone(a.phone);
    setEditDate(a.date);
    setEditTime(a.time);
    setEditMessage(a.message || "");
  };

  // Handle cancel editing an appointment
  const handleCancelEdit = () => {
    setEditingId(null);
  };

  // Save changes to appointment (PUT)
  const handleSaveAppointment = async (id) => {
    if (!editPhone || !editDate || !editTime) {
      showToast("Please fill in all required fields (Phone, Date, Time).", "error");
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/appointments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: editPhone,
          date: editDate,
          time: editTime,
          message: editMessage
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update appointment");

      setAppointments(prev => prev.map(a => a._id === id ? data.appointment : a));
      showToast("Appointment modified successfully!");
      setEditingId(null);
    } catch (err) {
      console.error("Error updating appointment:", err);
      showToast(err.message || "An error occurred while updating.", "error");
    }
  };

  // Delete an appointment (DELETE)
  const handleDeleteAppointment = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/appointments/${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to cancel appointment");

      setAppointments(prev => prev.filter(a => a._id !== id));
      showToast("Appointment cancelled successfully!");
    } catch (err) {
      console.error("Error deleting appointment:", err);
      showToast(err.message || "An error occurred while cancelling.", "error");
    }
  };

  // Delete user account (DELETE) -> triggers cascading delete of appointments and reminders
  const handleDeleteUser = async (user) => {
    const msg = `⚠️ WARNING: Cascading Deletion ⚠️\n\nDeleting ${user.name}'s account (${user.email}) will permanently purge:\n- Their user profile.\n- All of their doctor appointments.\n- All of their saved medicine reminders.\n\nThis action cannot be undone.\n\nAre you sure you want to proceed?`;
    if (!window.confirm(msg)) return;

    try {
      const res = await fetch(`http://localhost:5000/api/auth/users/${user._id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete patient account");

      showToast("Patient and all associated records deleted successfully.");
      
      // Update users state
      setUsers(prev => prev.filter(u => u._id !== user._id));
      // Sync appointments in case any belong to the deleted user
      setAppointments(prev => prev.filter(a => a.userEmail !== user.email));
    } catch (err) {
      console.error("Error deleting user:", err);
      showToast(err.message || "An error occurred while deleting account.", "error");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userPassword");
    localStorage.removeItem("userAge");
    localStorage.removeItem("userEmergencyContact");
    showToast("Logging out...");
    setTimeout(() => {
      navigate("/");
      window.location.reload();
    }, 1000);
  };

  // Simple avatar generator based on patient name initials
  const getInitials = (name) => {
    if (!name) return "P";
    return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  };

  return (
    <div className="admin-container">
      {/* Inline styles for custom premium elements, transitions and animations */}
      <style>{`
        .admin-container {
          background: radial-gradient(circle at top right, #1e1b4b, #0f172a);
          min-height: 100vh;
          color: #f8fafc;
          font-family: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          padding: 2.5rem 5% 5rem 5%;
          box-sizing: border-box;
        }

        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2.5rem;
          background: rgba(15, 23, 42, 0.45);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          margin-bottom: 2.5rem;
          box-shadow: 0 10px 40px 0 rgba(0, 0, 0, 0.35);
        }

        .admin-title {
          font-size: 1.8rem;
          font-weight: 800;
          background: linear-gradient(135deg, #60a5fa, #a78bfa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .status-dot {
          width: 10px;
          height: 10px;
          background-color: #10b981;
          border-radius: 50%;
          box-shadow: 0 0 12px #10b981;
          display: inline-block;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }

        .tab-switcher {
          display: flex;
          gap: 0.75rem;
          background: rgba(30, 41, 59, 0.5);
          padding: 0.5rem;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .tab-btn {
          background: transparent;
          border: none;
          color: #94a3b8;
          padding: 0.75rem 1.5rem;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 700;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .tab-btn.active {
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          color: #fff;
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
        }

        .tab-btn:hover:not(.active) {
          color: #f1f5f9;
          background: rgba(255, 255, 255, 0.05);
        }

        .logout-btn {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #fca5a5;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .logout-btn:hover {
          background: #ef4444;
          color: #fff;
          box-shadow: 0 0 15px rgba(239, 68, 68, 0.5);
          transform: translateY(-2px);
        }

        .grid-layout {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 2rem;
          margin-top: 1.5rem;
        }

        .glass-card {
          background: rgba(30, 41, 59, 0.45);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          padding: 1.75rem;
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .glass-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .glass-card:hover {
          transform: translateY(-6px);
          border-color: rgba(255, 255, 255, 0.12);
          box-shadow: 0 12px 40px 0 rgba(0, 0, 0, 0.4);
        }

        .glass-card:hover::before {
          opacity: 1;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.25rem;
        }

        .avatar-circle {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1.25rem;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .card-title {
          font-size: 1.2rem;
          font-weight: 700;
          color: #f1f5f9;
          margin: 0;
        }

        .card-subtitle {
          font-size: 0.85rem;
          color: #94a3b8;
          margin: 4px 0 0 0;
          word-break: break-all;
        }

        .badge-container {
          display: flex;
          gap: 0.5rem;
          margin: 0.75rem 0;
          flex-wrap: wrap;
        }

        .badge {
          font-size: 0.72rem;
          padding: 0.25rem 0.65rem;
          border-radius: 20px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .badge-dept {
          background: rgba(99, 102, 241, 0.15);
          border: 1px solid rgba(99, 102, 241, 0.3);
          color: #a5b4fc;
        }

        .badge-doctor {
          background: rgba(236, 72, 153, 0.15);
          border: 1px solid rgba(236, 72, 153, 0.3);
          color: #f9a8d4;
        }

        .meta-info {
          margin-top: 1rem;
          font-size: 0.9rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding-top: 0.75rem;
        }

        .meta-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }

        .meta-label {
          color: #64748b;
          font-weight: 500;
        }

        .meta-value {
          color: #cbd5e1;
          font-weight: 600;
        }

        .btn-group {
          display: flex;
          gap: 0.75rem;
          margin-top: 1.5rem;
        }

        .action-btn {
          flex: 1;
          padding: 0.65rem;
          border-radius: 10px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
        }

        .btn-edit {
          background: rgba(59, 130, 246, 0.12);
          border: 1px solid rgba(59, 130, 246, 0.3);
          color: #93c5fd;
        }

        .btn-edit:hover {
          background: #3b82f6;
          color: #fff;
          box-shadow: 0 0 12px rgba(59, 130, 246, 0.4);
        }

        .btn-delete {
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #fca5a5;
        }

        .btn-delete:hover {
          background: #ef4444;
          color: #fff;
          box-shadow: 0 0 12px rgba(239, 68, 68, 0.4);
        }

        .btn-save {
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #6ee7b7;
        }

        .btn-save:hover {
          background: #10b981;
          color: #fff;
          box-shadow: 0 0 12px rgba(16, 185, 129, 0.4);
        }

        .btn-cancel {
          background: rgba(100, 116, 139, 0.15);
          border: 1px solid rgba(100, 116, 139, 0.3);
          color: #cbd5e1;
        }

        .btn-cancel:hover {
          background: #64748b;
          color: #fff;
        }

        .edit-form {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          width: 100%;
        }

        .edit-field {
          display: flex;
          flex-direction: column;
        }

        .edit-label {
          font-size: 0.72rem;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.25rem;
          font-weight: 700;
        }

        .edit-input {
          width: 100%;
          padding: 0.6rem 0.8rem;
          border-radius: 8px;
          background: rgba(15, 23, 42, 0.65);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #f8fafc;
          outline: none;
          font-family: inherit;
          box-sizing: border-box;
          font-size: 0.9rem;
          transition: border-color 0.2s ease;
        }

        .edit-input:focus {
          border-color: #3b82f6;
        }

        .dashboard-empty {
          text-align: center;
          padding: 5rem 2rem;
          background: rgba(30, 41, 59, 0.2);
          border-radius: 20px;
          border: 1px dashed rgba(255, 255, 255, 0.1);
          color: #64748b;
          font-size: 1.1rem;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 6rem 2rem;
        }

        .loading-spinner {
          display: inline-block;
          width: 48px;
          height: 48px;
          border: 4px solid rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          border-top-color: #3b82f6;
          animation: spin 1s ease-in-out infinite;
          margin-bottom: 1.5rem;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .toast {
          position: fixed;
          bottom: 2.5rem;
          right: 2.5rem;
          padding: 1rem 1.75rem;
          border-radius: 14px;
          backdrop-filter: blur(16px);
          z-index: 1000;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          box-shadow: 0 20px 40px rgba(0,0,0,0.6);
          animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          font-weight: 600;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        @keyframes slideIn {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .toast-success {
          background: rgba(16, 185, 129, 0.95);
          color: #fff;
        }

        .toast-error {
          background: rgba(239, 68, 68, 0.95);
          color: #fff;
        }
      `}</style>

      {/* Admin Dashboard Header */}
      <header className="admin-header">
        <div className="admin-title">
          <span className="status-dot"></span>
          CareConnect Hub
          <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 500, borderLeft: "1px solid rgba(255,255,255,0.15)", paddingLeft: "0.75rem" }}>
            ADMINISTRATOR
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          {/* Tab Navigation Switcher */}
          <nav className="tab-switcher">
            <button
              onClick={() => setActiveTab("appointments")}
              className={`tab-btn ${activeTab === "appointments" ? "active" : ""}`}
            >
              📅 Appointments
            </button>
            <button
              onClick={() => setActiveTab("patients")}
              className={`tab-btn ${activeTab === "patients" ? "active" : ""}`}
            >
              👥 Patient Accounts
            </button>
          </nav>

          <button onClick={handleLogout} className="logout-btn">
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main>
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p style={{ color: "#94a3b8", fontWeight: 500 }}>Syncing with secure server database...</p>
          </div>
        ) : activeTab === "appointments" ? (
          // Tab 1: Doctor Appointments Panel
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>Doctor Appointment Bookings</h2>
              <span style={{ fontSize: "0.9rem", color: "#64748b", background: "rgba(255,255,255,0.05)", padding: "0.4rem 0.8rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                Total: {appointments.length} active
              </span>
            </div>

            {appointments.length === 0 ? (
              <div className="dashboard-empty">
                <p>No active doctor appointments are booked in the system.</p>
              </div>
            ) : (
              <div className="grid-layout">
                {appointments.map((a) => (
                  <div key={a._id} className="glass-card" style={{ borderLeft: editingId === a._id ? "4px solid #3b82f6" : "" }}>
                    {editingId === a._id ? (
                      // Inline Editing Form
                      <div className="edit-form">
                        <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.1rem", color: "#93c5fd" }}>Edit Appointment</h3>
                        
                        <div className="edit-field">
                          <label className="edit-label">Phone Contact</label>
                          <input
                            type="text"
                            value={editPhone}
                            onChange={(e) => setEditPhone(e.target.value)}
                            className="edit-input"
                          />
                        </div>

                        <div className="edit-field">
                          <label className="edit-label">Appointment Date</label>
                          <input
                            type="date"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                            className="edit-input"
                          />
                        </div>

                        <div className="edit-field">
                          <label className="edit-label">Preferred Time Slot</label>
                          <select
                            value={editTime}
                            onChange={(e) => setEditTime(e.target.value)}
                            className="edit-input"
                          >
                            <option value="09:00 AM">09:00 AM</option>
                            <option value="10:00 AM">10:00 AM</option>
                            <option value="11:00 AM">11:00 AM</option>
                            <option value="12:00 PM">12:00 PM</option>
                            <option value="02:00 PM">02:00 PM</option>
                            <option value="03:00 PM">03:00 PM</option>
                            <option value="04:00 PM">04:00 PM</option>
                            <option value="05:00 PM">05:00 PM</option>
                          </select>
                        </div>

                        <div className="edit-field">
                          <label className="edit-label">Specialist Note</label>
                          <textarea
                            value={editMessage}
                            onChange={(e) => setEditMessage(e.target.value)}
                            className="edit-input"
                            rows="2"
                            style={{ resize: "none" }}
                          />
                        </div>

                        <div className="btn-group">
                          <button onClick={() => handleSaveAppointment(a._id)} className="action-btn btn-save">
                            Save Changes
                          </button>
                          <button onClick={handleCancelEdit} className="action-btn btn-cancel">
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Read Only View Card
                      <>
                        <div>
                          <div className="card-header">
                            <div>
                              <h3 className="card-title">{a.userName}</h3>
                              <p className="card-subtitle">{a.userEmail}</p>
                            </div>
                            <span className="avatar-circle">{getInitials(a.userName)}</span>
                          </div>

                          <div className="badge-container">
                            <span className="badge badge-dept">🩺 {a.department}</span>
                            <span className="badge badge-doctor">Dr. {a.doctor}</span>
                          </div>

                          <div className="meta-info">
                            <div className="meta-row">
                              <span className="meta-label">Phone:</span>
                              <span className="meta-value">{a.phone}</span>
                            </div>
                            <div className="meta-row">
                              <span className="meta-label">Schedule Date:</span>
                              <span className="meta-value">{a.date}</span>
                            </div>
                            <div className="meta-row">
                              <span className="meta-label">Time Slot:</span>
                              <span className="meta-value">{a.time}</span>
                            </div>
                            {a.message && (
                              <div style={{ marginTop: "0.75rem", background: "rgba(255,255,255,0.03)", padding: "0.5rem 0.75rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.04)" }}>
                                <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.03em" }}>Patient Note</p>
                                <p style={{ margin: "2px 0 0 0", fontSize: "0.85rem", color: "#cbd5e1" }}>{a.message}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="btn-group">
                          <button onClick={() => handleStartEdit(a)} className="action-btn btn-edit">
                            ✏️ Change
                          </button>
                          <button onClick={() => handleDeleteAppointment(a._id)} className="action-btn btn-delete">
                            🗑️ Cancel
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          // Tab 2: Registered Patients Panel
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>Registered Patients Database</h2>
              <span style={{ fontSize: "0.9rem", color: "#64748b", background: "rgba(255,255,255,0.05)", padding: "0.4rem 0.8rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                Total: {users.length} patients
              </span>
            </div>

            {users.length === 0 ? (
              <div className="dashboard-empty">
                <p>No registered patient accounts found in the database.</p>
              </div>
            ) : (
              <div className="grid-layout">
                {users.map((u) => (
                  <div key={u._id} className="glass-card" style={{ borderTop: "4px solid #ef4444" }}>
                    <div>
                      <div className="card-header" style={{ marginBottom: "0.5rem" }}>
                        <div>
                          <h3 className="card-title">{u.name}</h3>
                          <p className="card-subtitle">{u.email}</p>
                        </div>
                        <span className="avatar-circle" style={{ background: "linear-gradient(135deg, #ec4899, #ef4444)" }}>
                          {getInitials(u.name)}
                        </span>
                      </div>

                      <div className="meta-info">
                        <div className="meta-row">
                          <span className="meta-label">Age Group:</span>
                          <span className="meta-value">{u.age ? `${u.age} years` : "Unspecified"}</span>
                        </div>
                        <div className="meta-row">
                          <span className="meta-label">Emergency Contact:</span>
                          <span className="meta-value" style={{ color: u.emergencyContact ? "#fca5a5" : "#cbd5e1" }}>
                            {u.emergencyContact || "Not Configured"}
                          </span>
                        </div>
                        <div className="meta-row">
                          <span className="meta-label">Account Created:</span>
                          <span className="meta-value" style={{ fontSize: "0.8rem" }}>
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" }) : "Pre-seeded"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="btn-group">
                      <button onClick={() => handleDeleteUser(u)} className="action-btn btn-delete" style={{ flex: 1 }}>
                        🛑 Delete Patient Account
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Expiring Toast Notifications */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          <span>{toast.type === "success" ? "✅" : "⚠️"}</span>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
