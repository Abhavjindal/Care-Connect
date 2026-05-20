// src/components/CheckAppointments.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/main.css";

const CheckAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  
  // Appointment Edit States
  const [editId, setEditId] = useState(null);
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

  const navigate = useNavigate();

  const fetchAppointments = (userEmail) => {
    fetch(`http://localhost:5000/api/appointments?email=${userEmail}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load appointments");
        return res.json();
      })
      .then((data) => {
        setAppointments(data);
      })
      .catch((err) => {
        console.error("Error loading appointments:", err);
        showToast("Failed to load appointments from server.", "error");
      });
  };

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) {
      alert("User not logged in!");
      navigate("/login");
      return;
    }
    fetchAppointments(userEmail);
  }, [navigate]);

  // Handle Appointment Deletion
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/appointments/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.message || "Failed to cancel appointment", "error");
        return;
      }
      showToast("Appointment cancelled successfully!", "success");
      setAppointments(appointments.filter((a) => a._id !== id));
    } catch (err) {
      console.error("Error deleting appointment:", err);
      showToast("An error occurred while cancelling your appointment.", "error");
    }
  };

  const handleStartEdit = (a) => {
    setEditId(a._id);
    setEditPhone(a.phone);
    setEditDate(a.date);
    setEditTime(a.time);
    setEditMessage(a.message || "");
  };

  const handleCancel = () => {
    setEditId(null);
  };

  // Handle Appointment Update
  const handleSave = async (id) => {
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
          message: editMessage,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.message || "Failed to update appointment", "error");
        return;
      }
      showToast("Appointment details updated successfully!", "success");
      setAppointments(
        appointments.map((a) => (a._id === id ? data.appointment : a))
      );
      setEditId(null);
    } catch (err) {
      console.error("Error updating appointment:", err);
      showToast("An error occurred while updating your appointment.", "error");
    }
  };

  const getInitials = (name) => {
    if (!name) return "P";
    return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  };

  return (
    <div className="patient-container">
      {/* Inline styles for matching premium admin panel dashboard aesthetics */}
      <style>{`
        .patient-container {
          background: radial-gradient(circle at top right, #1e1b4b, #0f172a);
          min-height: 100vh;
          color: #f8fafc;
          font-family: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          padding: 2.5rem 5% 5rem 5%;
          box-sizing: border-box;
        }

        /* Override template section styles to maintain full-screen dark gradient look */
        .patient-container section {
          background: transparent !important;
          padding: 0 !important;
          color: #f8fafc !important;
        }

        .patient-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem 2.5rem;
          background: rgba(15, 23, 42, 0.45);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          margin-bottom: 2.5rem;
          box-shadow: 0 10px 40px 0 rgba(0, 0, 0, 0.35);
        }

        .patient-title {
          font-size: 1.6rem;
          font-weight: 800;
          background: linear-gradient(135deg, #60a5fa, #a78bfa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin: 0;
        }

        .dashboard-section {
          margin-bottom: 3.5rem;
          animation: slideUp 0.4s ease-out;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .section-title {
          font-size: 1.4rem;
          font-weight: 700;
          color: #f1f5f9;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding-bottom: 0.75rem;
        }

        .section-title i {
          color: #3b82f6;
          font-size: 1.5rem;
        }

        .grid-layout {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 2rem;
          margin-top: 1rem;
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
          box-sizing: border-box;
        }

        .glass-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: linear-gradient(90deg, #3b82f6, #10b981);
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
          background: linear-gradient(135deg, #3b82f6, #10b981);
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

        .status-pending {
          background: rgba(245, 158, 11, 0.15);
          border: 1px solid rgba(245, 158, 11, 0.3);
          color: #fbbf24;
        }

        .status-accepted {
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #34d399;
        }

        .status-rejected {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #f87171;
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
          width: 100%;
          box-sizing: border-box;
        }

        .btn-primary-action {
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          border: none;
          color: #fff;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.3);
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
        }

        .btn-primary-action:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(59, 130, 246, 0.5);
        }

        /* Toast styles */
        .toast {
          position: fixed;
          top: 2.5rem;
          right: 2.5rem;
          padding: 1rem 1.75rem;
          border-radius: 14px;
          backdrop-filter: blur(16px);
          z-index: 1000;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          box-shadow: 0 20px 40px rgba(0,0,0,0.6);
          animation: slideInDown 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          font-weight: 600;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        @keyframes slideInDown {
          from { transform: translateY(-100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .toast-success {
          background: rgba(16, 185, 129, 0.95);
          color: #fff;
          border-color: rgba(16, 185, 129, 0.4);
        }

        .toast-error {
          background: rgba(239, 68, 68, 0.95);
          color: #fff;
          border-color: rgba(239, 68, 68, 0.4);
        }
      `}</style>

      {/* Styled Glassmorphic Page Header */}
      <header className="patient-header">
        <h1 className="patient-title">
          <i className="bi bi-calendar-check-fill" style={{ color: "#3b82f6" }}></i>
          Booked Appointments Dashboard
        </h1>
        <img 
          src={process.env.PUBLIC_URL + "/assets/img/logo.png"} 
          alt="CareConnect Logo" 
          style={{ height: "45px", width: "auto" }} 
        />
      </header>

      {/* Dynamic Toast Alerts */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          <i className={`bi ${toast.type === "success" ? "bi-check-circle-fill" : "bi-exclamation-circle-fill"}`}></i>
          <span>{toast.message}</span>
        </div>
      )}

      {/* SECTION 1: Doctor Bookings */}
      <section className="dashboard-section">
        <div className="section-title">
          <i className="bi bi-calendar2-week"></i>
          <h2>Your Scheduled Appointments</h2>
        </div>

        {appointments.length === 0 ? (
          <div className="dashboard-empty">
            <p style={{ margin: 0 }}>No doctor appointments are currently scheduled in your directory.</p>
          </div>
        ) : (
          <div className="grid-layout">
            {appointments.map((a) => {
              const isEditing = editId === a._id;
              let cardStyle = { borderLeft: isEditing ? "4px solid #3b82f6" : "" };
              
              if (!isEditing) {
                if (a.status === 'rejected') {
                  cardStyle = { ...cardStyle, borderColor: 'rgba(239, 68, 68, 0.5)', background: 'rgba(239, 68, 68, 0.08)' };
                } else if (a.status === 'accepted') {
                  cardStyle = { ...cardStyle, borderColor: 'rgba(16, 185, 129, 0.5)', background: 'rgba(16, 185, 129, 0.08)' };
                }
              }

              return (
                <div key={a._id} className="glass-card" style={cardStyle}>
                  {isEditing ? (
                    // Inline Card Editing Form
                    <div className="edit-form">
                      <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.1rem", color: "#93c5fd" }}>Edit Appointment</h3>
                      
                      <div className="edit-field">
                        <label className="edit-label">Phone Contact</label>
                        <input
                          type="tel"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          className="edit-input"
                          required
                        />
                      </div>

                      <div className="edit-field">
                        <label className="edit-label">Appointment Date</label>
                        <input
                          type="date"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                          className="edit-input"
                          required
                        />
                      </div>

                      <div className="edit-field">
                        <label className="edit-label">Preferred Time Slot</label>
                        <select
                          value={editTime}
                          onChange={(e) => setEditTime(e.target.value)}
                          className="edit-input"
                          required
                        >
                          <option value="10-11 AM">10–11 AM</option>
                          <option value="11-12 AM">11–12 AM</option>
                          <option value="12-1 PM">12–1 PM</option>
                          <option value="1-2 PM">1–2 PM</option>
                          <option value="2-3 PM">2–3 PM</option>
                          <option value="3-4 PM">3–4 PM</option>
                          <option value="4-5 PM">4–5 PM</option>
                          <option value="5-6 PM">5–6 PM</option>
                        </select>
                      </div>

                      <div className="edit-field">
                        <label className="edit-label">Special Request Note</label>
                        <input
                          type="text"
                          value={editMessage}
                          onChange={(e) => setEditMessage(e.target.value)}
                          className="edit-input"
                        />
                      </div>

                      <div className="btn-group">
                        <button onClick={() => handleSave(a._id)} className="action-btn btn-save">
                          Save Details
                        </button>
                        <button onClick={handleCancel} className="action-btn btn-cancel">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Regular Display Mode Card
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
                          <span className="badge badge-doctor">
                            {a.doctor.toLowerCase().startsWith('dr') ? a.doctor : `Dr. ${a.doctor}`}
                          </span>
                          <span className={`badge status-${a.status || 'pending'}`}>
                            {a.status || 'pending'}
                          </span>
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
                              <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.03em" }}>Your Notes</p>
                              <p style={{ margin: "2px 0 0 0", fontSize: "0.85rem", color: "#cbd5e1" }}>{a.message}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {a.status !== 'rejected' && (
                        <div className="btn-group">
                          <button onClick={() => handleStartEdit(a)} className="action-btn btn-edit">
                            ✏️ Edit Booking
                          </button>
                          <button onClick={() => handleDelete(a._id)} className="action-btn btn-delete">
                            🗑️ Cancel Appointment
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
        
        <div style={{ marginTop: "2rem" }}>
          <button onClick={() => navigate("/make-appointment")} className="btn-primary-action">
            <i className="bi bi-calendar-plus"></i>
            Book Another Appointment
          </button>
        </div>
      </section>
    </div>
  );
};

export default CheckAppointments;
