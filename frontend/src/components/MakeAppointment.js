// src/components/MakeAppointment.js
import React, { useEffect, useState } from "react";
import "../css/main.css";

const MakeAppointment = () => {
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [department, setDepartment] = useState("");
  const [message, setMessage] = useState("");
  const [doctorsData, setDoctorsData] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Toast status notification state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    const storedEmail = localStorage.getItem("userEmail");

    if (storedName && storedEmail) {
      setUserName(storedName);
      setUserEmail(storedEmail);
    } else {
      setShowLoginPrompt(true);
    }

    // Load doctors from MongoDB backend API
    fetch("http://localhost:5000/api/doctors")
      .then((res) => res.json())
      .then((data) => {
        setDoctorsData(data);
      })
      .catch((err) => {
        console.error("Error loading doctors from database:", err);
        showToast("Failed to connect to the medical directory.", "error");
      });
  }, []);

  const filteredDoctors = doctorsData.filter(
    (doc) =>
      doc.Field &&
      doc.Field.trim().toLowerCase() === department.toLowerCase()
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoctor) {
      showToast("Please choose a specialist doctor from the available directory.", "error");
      return;
    }

    setSubmitting(true);

    const appointment = {
      userName,
      userEmail,
      phone,
      date,
      time,
      department,
      doctor: selectedDoctor,
      message,
    };

    try {
      const res = await fetch("http://localhost:5000/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appointment),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.message || "Failed to book appointment!", "error");
        setSubmitting(false);
        return;
      }

      showToast("Appointment booked successfully! Syncing scheduler...", "success");
      
      // Clear inputs
      setPhone("");
      setDate("");
      setTime("");
      setDepartment("");
      setMessage("");
      setSelectedDoctor("");

      setTimeout(() => {
        window.location.href = "/check-appointments";
      }, 2000);
    } catch (error) {
      console.error("Error booking appointment:", error);
      showToast("Server connection error. Please try again later.", "error");
      setSubmitting(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  };

  return (
    <>
    <div className="make-container" style={{ filter: showLoginPrompt ? "blur(8px)" : "none", transition: "filter 0.3s ease", pointerEvents: showLoginPrompt ? "none" : "auto" }}>
      {/* Inline styles for custom premium glassmorphic dark-theme design */}
      <style>{`
        .make-container {
          background: radial-gradient(circle at top right, #1e1b4b, #0f172a);
          min-height: 100vh;
          color: #f8fafc;
          font-family: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
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
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0;
        }

        .header-profile {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .header-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.95rem;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .booking-grid {
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: 2.5rem;
          max-width: 1300px;
          margin: 0 auto;
          align-items: start;
        }

        @media (max-width: 1024px) {
          .booking-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
        }

        .glass-main-card {
          background: rgba(30, 41, 59, 0.45);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 24px;
          padding: 2.5rem;
          box-shadow: 0 15px 40px rgba(0,0,0,0.35);
          animation: slideUp 0.45s ease-out;
        }

        .glass-side-card {
          background: rgba(30, 41, 59, 0.25);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 24px;
          padding: 2.5rem;
          box-shadow: 0 15px 40px rgba(0,0,0,0.25);
          min-height: 480px;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          animation: slideUp 0.6s ease-out;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .form-label {
          display: block;
          font-size: 0.72rem;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
          font-weight: 700;
        }

        .form-input {
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
          transition: all 0.25s ease;
        }

        .form-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 12px rgba(59, 130, 246, 0.25);
          background: rgba(15, 23, 42, 0.85);
        }

        .form-input option {
          background: #0f172a;
          color: #f8fafc;
        }

        .doctor-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 1.25rem;
          margin-top: 1rem;
          animation: fadeIn 0.4s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .doctor-card {
          background: rgba(15, 23, 42, 0.45);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 18px;
          padding: 1.25rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .doctor-card:hover {
          transform: translateY(-4px);
          border-color: rgba(255, 255, 255, 0.15);
          background: rgba(15, 23, 42, 0.65);
          box-shadow: 0 10px 20px rgba(0,0,0,0.3);
        }

        .doctor-card.selected {
          background: rgba(16, 185, 129, 0.08);
          border-color: #10b981;
          box-shadow: 0 0 15px rgba(16, 185, 129, 0.2);
        }

        .doctor-card.selected::before {
          content: '✓';
          position: absolute;
          top: 12px;
          right: 12px;
          width: 22px;
          height: 22px;
          background: #10b981;
          color: #fff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          font-weight: bold;
          box-shadow: 0 0 8px rgba(16, 185, 129, 0.4);
        }

        .doctor-card-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }

        .doctor-avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #3b82f6);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.95rem;
        }

        .doctor-name {
          font-size: 1rem;
          font-weight: 700;
          color: #f1f5f9;
          margin: 0;
          padding-right: 1.5rem;
          line-height: 1.2;
        }

        .doctor-meta {
          font-size: 0.8rem;
          color: #94a3b8;
          margin-bottom: 0.25rem;
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .doctor-info {
          font-size: 0.78rem;
          color: #cbd5e1;
          margin-top: 0.75rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: 0.5rem;
          line-height: 1.4;
        }

        .badge-exp {
          background: rgba(59, 130, 246, 0.15);
          border: 1px solid rgba(59, 130, 246, 0.3);
          color: #93c5fd;
          font-size: 0.68rem;
          padding: 0.15rem 0.5rem;
          border-radius: 12px;
          font-weight: 700;
          display: inline-block;
          margin-top: 0.25rem;
        }

        .btn-primary {
          width: 100%;
          margin-top: 2rem;
          padding: 0.9rem;
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          color: #fff;
          font-size: 1rem;
          font-weight: 700;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(59, 130, 246, 0.5);
        }

        .btn-primary:disabled {
          background: rgba(100, 116, 139, 0.3);
          color: #64748b;
          cursor: not-allowed;
          box-shadow: none;
          transform: none;
        }

        .btn-secondary {
          width: 100%;
          margin-top: 1rem;
          padding: 0.8rem;
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.25);
          color: #6ee7b7;
          font-size: 0.95rem;
          font-weight: 700;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .btn-secondary:hover {
          background: #10b981;
          color: #fff;
          box-shadow: 0 0 12px rgba(16, 185, 129, 0.3);
        }

        .empty-selection-placeholder {
          text-align: center;
          margin: auto;
          color: #64748b;
          padding: 2rem;
        }

        .empty-selection-placeholder i {
          font-size: 3.5rem;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          display: block;
          margin-bottom: 1.25rem;
          opacity: 0.8;
          animation: pulseIcon 2s infinite;
        }

        @keyframes pulseIcon {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.08); opacity: 1; }
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

      {/* Styled Glassmorphic Header */}
      <header className="glass-header">
        <h1 className="header-title">
          <i className="bi bi-heart-pulse-fill" style={{ color: "#3b82f6" }}></i>
          CareConnect
        </h1>
        <div className="header-profile">
          <div className="header-avatar" title={userName}>
            {getInitials(userName)}
          </div>
          {/* Resolved broken img link by applying process.env.PUBLIC_URL */}
          <img 
            src={process.env.PUBLIC_URL + "/assets/img/logo.png"} 
            alt="CareConnect Logo" 
            style={{ height: "45px", width: "auto", display: "block" }} 
          />
        </div>
      </header>

      {/* Dynamic Toast System */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          <i className={`bi ${toast.type === "success" ? "bi-check-circle-fill" : "bi-exclamation-circle-fill"}`}></i>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Booking Form Layout */}
      <div className="booking-grid">
        <main className="glass-main-card">
          <h2 style={{ textAlign: "center", marginBottom: "1.5rem", fontSize: "1.6rem", fontWeight: 800 }}>
            Book Your Appointment
          </h2>

          <form id="appointmentForm" onSubmit={handleSubmit}>
            <input type="hidden" id="name" value={userName} />
            <input type="hidden" id="email" value={userEmail} />

            <label className="form-label" htmlFor="phone">Phone Contact Number</label>
            <input
              type="tel"
              id="phone"
              placeholder="e.g. +91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="form-input"
              required
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
              <div>
                <label className="form-label" htmlFor="date">Preferred Date</label>
                <input
                  type="date"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label className="form-label" htmlFor="time">Preferred Time Slot</label>
                <select
                  id="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="form-input"
                  required
                >
                  <option value="">-- Select Time Slot --</option>
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
            </div>

            <label className="form-label" htmlFor="department">Medical Department</label>
            <select
              id="department"
              value={department}
              onChange={(e) => {
                setDepartment(e.target.value);
                setSelectedDoctor(""); // Reset doctor selection
              }}
              className="form-input"
              required
            >
              <option value="">-- Select Department --</option>
              <option value="cardiology">Cardiology</option>
              <option value="neurology">Neurology</option>
              <option value="hepatology">Hepatology</option>
              <option value="pediatrics">Pediatrics</option>
              <option value="eye care">Eye Care</option>
              <option value="dermatology">Dermatology</option>
            </select>

            <label className="form-label" htmlFor="message">Additional Medical Notes (Optional)</label>
            <textarea
              id="message"
              rows="3"
              placeholder="Type any symptoms or special requests..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="form-input"
              style={{ resize: "none" }}
            />

            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" style={{ marginRight: "0.5rem" }}></span>
                  Booking Scheduler Sync...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle-fill"></i>
                  Confirm Appointment Booking
                </>
              )}
            </button>
          </form>

          <button
            type="button"
            className="btn-secondary"
            onClick={() => (window.location.href = "/check-appointments")}
          >
            <i className="bi bi-calendar-check"></i>
            Check Booked Appointments
          </button>
        </main>

        <aside className="glass-side-card">
          {!department ? (
            <div className="empty-selection-placeholder">
              <i className="bi bi-heart-pulse"></i>
              <h3>Select a Department</h3>
              <p style={{ fontSize: "0.9rem", lineHeight: 1.5 }}>
                Choose a medical branch from the drop-down list on the left to see our available world-class specialists and booking cards.
              </p>
            </div>
          ) : (
            <div style={{ width: "100%" }}>
              <h3 style={{ fontSize: "1.3rem", fontWeight: 800, borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "0.75rem", margin: "0 0 1rem 0" }}>
                Specialist Doctors Directory
              </h3>
              <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: "0 0 1.25rem 0" }}>
                Select a consultant doctor in <span style={{ color: "#60a5fa", fontWeight: 700, textTransform: "capitalize" }}>{department}</span> to coordinate your booking:
              </p>

              {filteredDoctors.length === 0 ? (
                <div style={{ textAlign: "center", color: "#64748b", padding: "3rem 0" }}>
                  <i className="bi bi-person-exclamation" style={{ fontSize: "2.5rem", display: "block", marginBottom: "0.75rem" }}></i>
                  No consultant specialists currently available in this department.
                </div>
              ) : (
                <div className="doctor-grid">
                  {filteredDoctors.map((doc, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedDoctor(doc.Name)}
                      className={`doctor-card ${selectedDoctor === doc.Name ? "selected" : ""}`}
                    >
                      <div>
                        <div className="doctor-card-header">
                          <span className="doctor-avatar">{getInitials(doc.Name)}</span>
                          <div>
                            <h4 className="doctor-name">{doc.Name}</h4>
                            <span className="badge-exp">{doc.Experience || "5+"} Years Exp</span>
                          </div>
                        </div>
                        <div className="doctor-meta" style={{ marginTop: "0.5rem" }}>
                          <i className="bi bi-telephone-fill" style={{ color: "#3b82f6" }}></i>
                          <span>{doc["Contact Number"]}</span>
                        </div>
                      </div>
                      
                      {doc.Information && (
                        <p className="doctor-info">{doc.Information}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>

      {/* Login Prompt Overlay */}
      {showLoginPrompt && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(15, 23, 42, 0.4)",
          zIndex: 9999,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          animation: "fadeIn 0.3s ease"
        }}>
          <div style={{
            background: "rgba(30, 41, 59, 0.95)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            padding: "3rem",
            borderRadius: "24px",
            textAlign: "center",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            maxWidth: "400px",
            width: "90%"
          }}>
            <i className="bi bi-lock-fill" style={{ fontSize: "3rem", color: "#60a5fa", marginBottom: "1rem", display: "block" }}></i>
            <h2 style={{ color: "#f8fafc", fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem" }}>Login to use</h2>
            <p style={{ color: "#94a3b8", marginBottom: "2rem", lineHeight: 1.5 }}>
              You need to be logged in to access the CareConnect appointment scheduler.
            </p>
            <div style={{ display: "flex", gap: "1rem", flexDirection: "column" }}>
              <button 
                onClick={() => window.location.href = "/login"}
                style={{
                  background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                  color: "white",
                  border: "none",
                  padding: "12px",
                  borderRadius: "12px",
                  fontWeight: 700,
                  fontSize: "1rem",
                  cursor: "pointer",
                  transition: "transform 0.2s"
                }}
                onMouseOver={(e) => e.target.style.transform = "translateY(-2px)"}
                onMouseOut={(e) => e.target.style.transform = "translateY(0)"}
              >
                Login to Continue
              </button>
              <button 
                onClick={() => window.location.href = "/signup"}
                style={{
                  background: "transparent",
                  color: "#60a5fa",
                  border: "1px solid rgba(96, 165, 250, 0.3)",
                  padding: "12px",
                  borderRadius: "12px",
                  fontWeight: 700,
                  fontSize: "1rem",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                onMouseOver={(e) => { e.target.style.background = "rgba(96, 165, 250, 0.1)"; e.target.style.transform = "translateY(-2px)"; }}
                onMouseOut={(e) => { e.target.style.background = "transparent"; e.target.style.transform = "translateY(0)"; }}
              >
                Create an Account
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MakeAppointment;
