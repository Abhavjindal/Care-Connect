// src/components/MedicineReminders.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/main.css";

const MedicineReminders = () => {
  const [reminders, setReminders] = useState([]);
  const [medName, setMedName] = useState("");
  const [medTime, setMedTime] = useState("08:00 AM (Breakfast)");
  const [loading, setLoading] = useState(false);

  // Toast status notification state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const navigate = useNavigate();

  const fetchReminders = (userEmail) => {
    setLoading(true);
    fetch(`http://localhost:5000/api/reminders?email=${userEmail}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load medication schedules");
        return res.json();
      })
      .then((data) => {
        setReminders(data);
      })
      .catch((err) => {
        console.error("Error loading medicine reminders:", err);
        showToast("Failed to fetch active medicine schedules.", "error");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) {
      alert("User not logged in!");
      navigate("/login");
      return;
    }
    fetchReminders(userEmail);
  }, [navigate]);

  // Handle Adding Medicine Reminder
  const handleAddReminder = async (e) => {
    e.preventDefault();
    if (!medName.trim()) {
      showToast("Please enter a medicine name!", "error");
      return;
    }
    const userEmail = localStorage.getItem("userEmail");
    try {
      const res = await fetch("http://localhost:5000/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail,
          medicineName: medName.trim(),
          time: medTime
        })
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.message || "Failed to add medicine reminder", "error");
        return;
      }
      showToast("Medicine schedule added successfully!", "success");
      setReminders((prev) => [data.reminder, ...prev]);
      setMedName("");
    } catch (err) {
      console.error("Error adding medicine reminder:", err);
      showToast("Failed to save schedule to server.", "error");
    }
  };

  // Handle Deleting Medicine Reminder
  const handleDeleteReminder = async (id) => {
    if (!window.confirm("Delete this medicine reminder?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/reminders/${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.message || "Failed to delete reminder", "error");
        return;
      }
      showToast("Medication schedule removed successfully.", "success");
      setReminders((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error("Error deleting medicine reminder:", err);
      showToast("Failed to delete schedule from server.", "error");
    }
  };

  return (
    <div className="patient-container">
      {/* Inline styles for custom premium elements, transitions and animations */}
      <style>{`
        .patient-container {
          background: radial-gradient(circle at top right, #1e1b4b, #0f172a);
          min-height: 100vh;
          color: #f8fafc;
          font-family: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          padding: 2.5rem 5% 5rem 5%;
          box-sizing: border-box;
        }

        /* Override generic template section styles */
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
          background: linear-gradient(135deg, #10b981, #34d399);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin: 0;
        }

        .dashboard-section {
          margin-bottom: 3.5rem;
          animation: slideUp 0.45s ease-out;
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
          color: #10b981;
          font-size: 1.5rem;
        }

        .cc-reminders-grid {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 2.5rem;
          margin-top: 1rem;
        }

        @media (max-width: 900px) {
          .cc-reminders-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
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
          box-sizing: border-box;
        }

        .glass-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: linear-gradient(90deg, #10b981, #059669);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .glass-card:hover {
          transform: translateY(-4px);
          border-color: rgba(255, 255, 255, 0.12);
          box-shadow: 0 12px 40px 0 rgba(0, 0, 0, 0.4);
        }

        .glass-card:hover::before {
          opacity: 1;
        }

        .edit-field {
          display: flex;
          flex-direction: column;
          margin-bottom: 1.25rem;
        }

        .edit-label {
          font-size: 0.72rem;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.5rem;
          font-weight: 700;
        }

        .edit-input {
          width: 100%;
          padding: 0.75rem 1.1rem;
          border-radius: 10px;
          background: rgba(15, 23, 42, 0.65);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #f8fafc;
          outline: none;
          font-family: inherit;
          box-sizing: border-box;
          font-size: 0.95rem;
          transition: border-color 0.25s ease, background-color 0.25s ease;
        }

        .edit-input:focus {
          border-color: #10b981;
          background: rgba(15, 23, 42, 0.85);
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.2);
        }

        .edit-input option {
          background: #0f172a;
          color: #f8fafc;
        }

        .btn-primary-action {
          background: linear-gradient(135deg, #10b981, #059669);
          border: none;
          color: #fff;
          padding: 0.85rem 1.5rem;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-size: 0.95rem;
        }

        .btn-primary-action:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(16, 185, 129, 0.5);
        }

        .cc-med-list {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          max-height: 400px;
          overflow-y: auto;
          padding-right: 0.25rem;
          box-sizing: border-box;
        }

        .cc-med-list::-webkit-scrollbar {
          width: 6px;
        }

        .cc-med-list::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
        }

        .cc-med-list::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 10px;
        }

        .cc-med-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.25rem;
          background: rgba(15, 23, 42, 0.35);
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-left: 4px solid #10b981;
          transition: all 0.25s ease;
        }

        .cc-med-item:hover {
          transform: translateX(5px);
          background: rgba(15, 23, 42, 0.55);
          border-color: rgba(255, 255, 255, 0.08);
          box-shadow: 0 4px 15px rgba(0,0,0,0.15);
        }

        .cc-med-info {
          display: flex;
          align-items: center;
          gap: 1.1rem;
        }

        .cc-med-capsule {
          font-size: 1.6rem;
          color: #10b981;
        }

        .cc-med-details h4 {
          margin: 0;
          font-weight: 700;
          font-size: 1.05rem;
          color: #f1f5f9;
        }

        .cc-med-details span {
          font-size: 0.85rem;
          color: #94a3b8;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          margin-top: 3px;
        }

        .cc-med-delete-btn {
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.25);
          color: #fca5a5;
          cursor: pointer;
          padding: 0.55rem;
          border-radius: 10px;
          font-size: 1rem;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cc-med-delete-btn:hover {
          background: #ef4444;
          color: #fff;
          box-shadow: 0 0 10px rgba(239, 68, 68, 0.4);
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          color: #94a3b8;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(255, 255, 255, 0.1);
          border-left-color: #10b981;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
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

        .btn-back-dashboard {
          background: rgba(59, 130, 246, 0.12);
          border: 1px solid rgba(59, 130, 246, 0.25);
          color: #93c5fd;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          margin-top: 2rem;
        }

        .btn-back-dashboard:hover {
          background: #3b82f6;
          color: #fff;
          box-shadow: 0 0 15px rgba(59, 130, 246, 0.35);
        }
      `}</style>

      {/* Styled Glassmorphic Page Header */}
      <header className="patient-header">
        <h1 className="patient-title">
          <i className="bi bi-capsule-pill" style={{ color: "#10b981" }}></i>
          Medicine Reminders Hub
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

      {/* SECTION 2: Medicine Reminders */}
      <section className="dashboard-section">
        <div className="section-title">
          <i className="bi bi-clock-history"></i>
          <h2>Your Medication Schedule</h2>
        </div>

        <div className="cc-reminders-grid">
          {/* Add Reminder Card */}
          <div className="glass-card" style={{ height: "fit-content" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, margin: "0 0 1.25rem 0", background: "linear-gradient(135deg, #10b981, #6ee7b7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Add Daily Schedule
            </h3>
            
            <form onSubmit={handleAddReminder} style={{ display: "flex", flexDirection: "column" }}>
              <div className="edit-field">
                <label className="edit-label">Medicine Name</label>
                <input
                  type="text"
                  placeholder="e.g. Paracetamol 650mg"
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  className="edit-input"
                  required
                />
              </div>

              <div className="edit-field">
                <label className="edit-label">Daily Time Slot</label>
                <select
                  value={medTime}
                  onChange={(e) => setMedTime(e.target.value)}
                  className="edit-input"
                >
                  <option value="07:00 AM">07:00 AM</option>
                  <option value="08:00 AM (Breakfast)">08:00 AM (Breakfast)</option>
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="12:00 PM">12:00 PM</option>
                  <option value="01:00 PM (Lunch)">01:00 PM (Lunch)</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="04:00 PM">04:00 PM</option>
                  <option value="06:00 PM">06:00 PM</option>
                  <option value="08:00 PM (Dinner)">08:00 PM (Dinner)</option>
                  <option value="09:00 PM">09:00 PM</option>
                  <option value="10:00 PM (Bedtime)">10:00 PM (Bedtime)</option>
                </select>
              </div>

              <button type="submit" className="btn-primary-action">
                <i className="bi bi-plus-circle"></i>
                Add Reminder
              </button>
            </form>
          </div>

          {/* Active Reminders Display Card */}
          <div className="glass-card" style={{ height: "fit-content", minHeight: "330px" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, margin: "0 0 1.25rem 0", color: "#f1f5f9" }}>
              Active Schedules
            </h3>
            
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p style={{ margin: 0, fontSize: "0.9rem" }}>Syncing schedules with database...</p>
              </div>
            ) : (
              <div className="cc-med-list">
                {reminders.length === 0 ? (
                  <div style={{ textAlign: "center", color: "#64748b", padding: "4rem 0", fontSize: "0.95rem" }}>
                    <i className="bi bi-clock" style={{ fontSize: "2.5rem", display: "block", marginBottom: "1rem", color: "#334155" }}></i>
                    No active medicine reminders yet.<br/>Create a daily schedule to keep track.
                  </div>
                ) : (
                  reminders.map((r, idx) => (
                    <div key={r._id || idx} className="cc-med-item">
                      <div className="cc-med-info">
                        <i className="bi bi-capsule cc-med-capsule"></i>
                        <div className="cc-med-details">
                          <h4>{r.medicineName}</h4>
                          <span><i className="bi bi-clock" style={{ color: "#10b981" }}></i> {r.time}</span>
                        </div>
                      </div>
                      <button
                        className="cc-med-delete-btn"
                        onClick={() => handleDeleteReminder(r._id)}
                        title="Remove schedule"
                      >
                        <i className="bi bi-trash-fill"></i>
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <div>
          <button onClick={() => navigate("/check-appointments")} className="btn-back-dashboard">
            <i className="bi bi-arrow-left"></i>
            Back to Bookings Dashboard
          </button>
        </div>
      </section>
    </div>
  );
};

export default MedicineReminders;
