import React, { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";

function Signup() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fullName, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Signup failed!");
        return;
      }

      alert("Signup successful! You can now login.");
      navigate("/login");
    } catch (error) {
      console.error("Error signing up:", error);
      alert("Something went wrong! Please try again later.");
    }
  };

  return (
    <div className="auth-container index-page make-container" style={{
      background: "radial-gradient(circle at top right, #1e1b4b, #0f172a)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      fontFamily: "'Outfit', 'Inter', sans-serif",
      color: "#f8fafc"
    }}>
      <div className="glass-card" style={{
        background: "rgba(30, 41, 59, 0.45)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        borderRadius: "24px",
        padding: "40px 30px",
        boxShadow: "0 15px 40px rgba(0,0,0,0.35)",
        width: "100%",
        maxWidth: "400px"
      }}>
        <h2 style={{
          fontWeight: 800,
          marginBottom: "30px",
          textAlign: "center",
          background: "linear-gradient(135deg, #10b981, #34d399)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}>
          Signup for CareConnect
        </h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Full Name"
            required
            className="form-input"
            value={fullName}
            onChange={(e) => setFullName(e.target.value.trim())}
            style={{
              width: "100%",
              padding: "12px 15px",
              marginBottom: "15px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "10px",
              background: "rgba(15, 23, 42, 0.65)",
              color: "#f8fafc",
              fontSize: "15px",
              outline: "none",
              boxSizing: "border-box"
            }}
          />
          <input
            type="email"
            placeholder="Email"
            required
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value.trim())}
            style={{
              width: "100%",
              padding: "12px 15px",
              marginBottom: "15px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "10px",
              background: "rgba(15, 23, 42, 0.65)",
              color: "#f8fafc",
              fontSize: "15px",
              outline: "none",
              boxSizing: "border-box"
            }}
          />
          <input
            type="password"
            placeholder="Password"
            required
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 15px",
              marginBottom: "25px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "10px",
              background: "rgba(15, 23, 42, 0.65)",
              color: "#f8fafc",
              fontSize: "15px",
              outline: "none",
              boxSizing: "border-box"
            }}
          />
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "14px",
              border: "none",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: 700,
              background: "linear-gradient(135deg, #10b981, #059669)",
              color: "white",
              cursor: "pointer",
              boxShadow: "0 6px 20px rgba(16, 185, 129, 0.3)",
              transition: "transform 0.2s"
            }}
            onMouseOver={(e) => e.target.style.transform = "translateY(-2px)"}
            onMouseOut={(e) => e.target.style.transform = "translateY(0)"}
          >
            Signup
          </button>
        </form>
        <p style={{ marginTop: "20px", fontSize: "14px", textAlign: "center", color: "#94a3b8" }}>
          Already have an account?{" "}
          <NavLink to="/login" style={{ color: "#10b981", textDecoration: "none", fontWeight: 700 }}>
            Login here
          </NavLink>
        </p>
      </div>
    </div>
  );
}

export default Signup;
