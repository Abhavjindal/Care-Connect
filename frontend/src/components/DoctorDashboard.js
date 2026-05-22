import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../config/api";

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Rejection reason modal states
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  
  const doctorName = localStorage.getItem("doctorName");
  
  useEffect(() => {
    if (!doctorName) {
      window.location.href = "/login";
      return;
    }
    
    fetchAppointments();
  }, [doctorName]);

  const fetchAppointments = async () => {
    try {
      const doctorEmail = localStorage.getItem("userEmail");
      const res = await fetch(`${API_BASE_URL}/appointments?email=${doctorEmail}&role=doctor&doctorName=${encodeURIComponent(doctorName)}`);
      const data = await res.json();
      if (res.ok) {
        setAppointments(data);
      }
    } catch (err) {
      console.error("Failed to fetch doctor appointments", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status, rejectionReason = "") => {
    try {
      const body = { status };
      if (status === "rejected" && rejectionReason) {
        body.rejectionReason = rejectionReason;
      }
      
      const res = await fetch(`${API_BASE_URL}/appointments/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        setAppointments(appointments.map(app => app._id === id ? { ...app, status, rejectionReason } : app));
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const confirmRejection = () => {
    if (!rejectReason) {
      alert("Please select a rejection reason.");
      return;
    }
    
    let finalReason = rejectReason;
    if (rejectReason === "other") {
      if (!customReason.trim()) {
        alert("Please specify the custom rejection reason.");
        return;
      }
      finalReason = customReason.trim();
    }
    
    handleUpdateStatus(selectedAppId, "rejected", finalReason);
    setShowRejectModal(false);
    setSelectedAppId(null);
    setRejectReason("");
    setCustomReason("");
  };

  return (
    <div className="make-container">
      <style>{`
        .make-container {
          background: radial-gradient(circle at top right, #1e1b4b, #0f172a);
          min-height: 100vh;
          color: #f8fafc;
          font-family: 'Outfit', 'Inter', sans-serif;
          padding: 2.5rem 5% 5rem 5%;
          box-sizing: border-box;
        }
        .glass-header {
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
        .header-title {
          font-size: 1.6rem;
          font-weight: 800;
          background: linear-gradient(135deg, #60a5fa, #a78bfa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0;
        }
        .app-card {
          background: rgba(30, 41, 59, 0.45);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .app-details h4 {
          margin: 0 0 0.5rem 0;
          color: #f1f5f9;
        }
        .app-details p {
          margin: 0.25rem 0;
          color: #94a3b8;
          font-size: 0.9rem;
        }
        .btn-accept {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border: none;
          padding: 0.6rem 1.2rem;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
          margin-right: 0.5rem;
          transition: transform 0.2s;
        }
        .btn-accept:hover { transform: translateY(-2px); }
        .btn-reject {
          background: linear-gradient(135deg, #ef4444, #b91c1c);
          color: white;
          border: none;
          padding: 0.6rem 1.2rem;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .btn-reject:hover { transform: translateY(-2px); }
        .status-badge {
          padding: 0.4rem 0.8rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: bold;
          text-transform: uppercase;
        }
        .status-pending {
          background: rgba(245, 158, 11, 0.2);
          color: #fbbf24;
          border: 1px solid rgba(245, 158, 11, 0.4);
        }
        .status-accepted {
          background: rgba(16, 185, 129, 0.2);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.4);
        }
        .status-rejected {
          background: rgba(239, 68, 68, 0.2);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.4);
        }
        
        /* Modal Styles */
        .cc-modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(8px);
          z-index: 100000;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: cc-fade-in-modal 0.25s ease-out;
        }
        .cc-reject-modal {
          background: white;
          padding: 2.2rem;
          border-radius: 16px;
          width: 100%;
          max-width: 440px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          animation: cc-slide-up-modal 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .cc-profile-modal-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 1rem;
        }
        .cc-profile-form-group {
          margin-bottom: 1.25rem;
          text-align: left;
        }
        @keyframes cc-fade-in-modal {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes cc-slide-up-modal {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
      
      <header className="glass-header">
        <h1 className="header-title">
          <i className="bi bi-calendar2-pulse" style={{ color: "#3b82f6", marginRight: "10px" }}></i>
          Doctor Dashboard - {doctorName}
        </h1>
      </header>

      <div>
        {loading ? (
          <p style={{ textAlign: "center", color: "#94a3b8" }}>Loading appointments...</p>
        ) : appointments.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", background: "rgba(30,41,59,0.3)", borderRadius: "20px" }}>
            <h3 style={{ color: "#cbd5e1" }}>No Appointments Found</h3>
            <p style={{ color: "#64748b" }}>You currently have no scheduled appointments.</p>
          </div>
        ) : (
          appointments.map((app) => (
            <div className="app-card" key={app._id}>
              <div className="app-details">
                <h4>Patient: {app.userName}</h4>
                <p><i className="bi bi-envelope"></i> {app.userEmail} | <i className="bi bi-telephone"></i> {app.phone}</p>
                <p><i className="bi bi-calendar"></i> {app.date} | <i className="bi bi-clock"></i> {app.time}</p>
                {app.message && <p><strong>Notes:</strong> {app.message}</p>}
                
                <div style={{ marginTop: "10px" }}>
                  <span className={`status-badge status-${app.status || 'pending'}`}>
                    {app.status || 'pending'}
                  </span>
                  {app.status === "rejected" && app.rejectionReason && (
                    <p style={{ marginTop: "10px", color: "#f87171", fontSize: "0.85rem", background: "rgba(239, 68, 68, 0.1)", padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(239, 68, 68, 0.2)", display: "inline-block" }}>
                      <strong>Rejection Reason:</strong> {app.rejectionReason}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="app-actions">
                {(app.status === "pending" || !app.status) && (
                  <>
                    <button className="btn-accept" onClick={() => handleUpdateStatus(app._id, "accepted")}>
                      <i className="bi bi-check-lg"></i> Accept
                    </button>
                    <button className="btn-reject" onClick={() => {
                      setSelectedAppId(app._id);
                      setShowRejectModal(true);
                    }}>
                      <i className="bi bi-x-lg"></i> Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Sleek Glassmorphic Rejection Reason Modal */}
      {showRejectModal && (
        <div className="cc-modal-backdrop">
          <div className="cc-reject-modal">
            <div className="cc-profile-modal-header">
              <i className="bi bi-exclamation-triangle-fill" style={{ color: "#ef4444", fontSize: "1.8rem", marginRight: "10px" }}></i>
              <h3 style={{ margin: 0, color: "#1e293b", fontWeight: 700 }}>Specify Rejection Reason</h3>
            </div>
            <p style={{ color: "#64748b", fontSize: "0.9rem", margin: "10px 0 20px 0", textAlign: "left", lineHeight: "1.5" }}>
              Please select or enter the reason for rejecting this appointment. The patient will see this reason in their dashboard.
            </p>
            
            <div className="cc-profile-form-group">
              <label style={{ display: "block", fontSize: "13.5px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>Reason for Rejection</label>
              <select 
                className="cc-profile-input" 
                value={rejectReason} 
                onChange={(e) => setRejectReason(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  fontSize: "14px",
                  outline: "none",
                  background: "white",
                  color: "#334155"
                }}
              >
                <option value="">-- Select a reason --</option>
                <option value="Schedule conflict / Doctor unavailable">Schedule conflict / Doctor unavailable</option>
                <option value="Incorrect department selected">Incorrect department selected</option>
                <option value="Emergency surgical/clinical priority">Emergency surgical/clinical priority</option>
                <option value="Patient request for reschedule">Patient request for reschedule</option>
                <option value="Doctor on medical leave">Doctor on medical leave</option>
                <option value="other">Other (please specify)</option>
              </select>
            </div>
            
            {rejectReason === "other" && (
              <div className="cc-profile-form-group" style={{ marginTop: "15px" }}>
                <label style={{ display: "block", fontSize: "13.5px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>Custom Reason</label>
                <textarea 
                  className="cc-profile-input"
                  rows="3"
                  placeholder="Type the custom rejection reason here..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    fontFamily: "inherit",
                    resize: "none",
                    color: "#334155"
                  }}
                />
              </div>
            )}
            
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "25px" }}>
              <button 
                type="button" 
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedAppId(null);
                  setRejectReason("");
                  setCustomReason("");
                }}
                style={{
                  background: "#f1f5f9",
                  color: "#475569",
                  border: "none",
                  padding: "10px 18px",
                  borderRadius: "8px",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={confirmRejection}
                style={{
                  background: "linear-gradient(135deg, #ef4444, #b91c1c)",
                  color: "white",
                  border: "none",
                  padding: "10px 18px",
                  borderRadius: "8px",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
