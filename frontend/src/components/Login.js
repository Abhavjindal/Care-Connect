import React, { useState, useContext } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { AuthContext } from "../App";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Login failed!");
        return;
      }

      // Save user info
      localStorage.setItem("token", data.token);
      localStorage.setItem("userName", data.user.name);
      localStorage.setItem("userEmail", data.user.email);
      localStorage.setItem("userRole", data.user.role);
      if (data.user.doctorName) {
        localStorage.setItem("doctorName", data.user.doctorName);
      }
      localStorage.setItem("userPassword", password);
      localStorage.setItem("userAge", data.user.age || "");
      localStorage.setItem("userEmergencyContact", data.user.emergencyContact || "");

      setUser({
        email: data.user.email,
        name: data.user.name,
        role: data.user.role,
        doctorName: data.user.doctorName,
        age: data.user.age,
        emergencyContact: data.user.emergencyContact
      });
      if (data.user.role === "admin") {
        navigate("/admin-dashboard");
      } else if (data.user.role === "doctor") {
        navigate("/doctor-dashboard");
      } else {
        navigate("/make-appointment");
      }
    } catch (error) {
      console.error("Error logging in:", error);
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
          background: "linear-gradient(135deg, #60a5fa, #a78bfa)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}>
          Login to CareConnect
        </h2>
        <form className="auth-form" onSubmit={handleSubmit}>
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
              background: "linear-gradient(135deg, #3b82f6, #6366f1)",
              color: "white",
              cursor: "pointer",
              boxShadow: "0 6px 20px rgba(59, 130, 246, 0.3)",
              transition: "transform 0.2s"
            }}
            onMouseOver={(e) => e.target.style.transform = "translateY(-2px)"}
            onMouseOut={(e) => e.target.style.transform = "translateY(0)"}
          >
            Login
          </button>
        </form>
        <p style={{ marginTop: "20px", fontSize: "14px", textAlign: "center", color: "#94a3b8" }}>
          Don’t have an account?{" "}
          <NavLink to="/signup" style={{ color: "#60a5fa", textDecoration: "none", fontWeight: 700 }}>
            Sign up here
          </NavLink>
        </p>
      </div>
    </div>
  );
}

export default Login;
