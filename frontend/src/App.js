import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './css/main.css';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Services from './components/Services';
import Departments from './components/Departments';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import Login from './components/Login';
import Signup from './components/Signup';
import Appointments from './components/Appointments';
import MakeAppointment from './components/MakeAppointment';
import CheckAppointments from './components/CheckAppointments';
import MedicineReminders from './components/MedicineReminders';
import AdminDashboard from './components/AdminDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import { API_BASE_URL } from './config/api';
import ChatWidget from './components/ChatWidget'; // ✅ Import floating Chat Widget

export const AuthContext = React.createContext();

function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showPreloader, setShowPreloader] = useState(true);
  const [user, setUser] = useState({
    email: localStorage.getItem('userEmail'),
    name: localStorage.getItem('userName'),
    role: localStorage.getItem('userRole'),
    age: localStorage.getItem('userAge'),
    emergencyContact: localStorage.getItem('userEmergencyContact')
  });
  const [backendStatus, setBackendStatus] = useState('Checking backend connection...');
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
  const [promptAge, setPromptAge] = useState('');
  const [promptContact, setPromptContact] = useState('');

  useEffect(() => {
    // Only patients need to fill out the emergency profile
    const isPatient = user?.email && user?.role !== 'admin' && user?.role !== 'doctor' && user.email !== 'admin@careconnect.com';
    if (isPatient && (!user.age || !user.emergencyContact)) {
      setShowProfilePrompt(true);
    } else {
      setShowProfilePrompt(false);
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!promptAge.trim() || !promptContact.trim()) {
      alert("Please fill in both Age and Emergency Contact fields.");
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: user.email,
          age: Number(promptAge.trim()),
          emergencyContact: promptContact.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to update profile details");
        return;
      }

      // Update local storage
      localStorage.setItem("userAge", data.user.age);
      localStorage.setItem("userEmergencyContact", data.user.emergencyContact);

      // Update React state context
      setUser((prev) => ({
        ...prev,
        age: data.user.age,
        emergencyContact: data.user.emergencyContact
      }));

      alert("Profile updated successfully! Thank you for completing your emergency details.");
      setShowProfilePrompt(false);
    } catch (err) {
      console.error("Error updating profile details:", err);
      alert("An error occurred. Please try again.");
    }
  };

  useEffect(() => {
    // ✅ Check backend connection
    const checkBackend = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/test`);
        const data = await res.json();
        console.log('✅ Backend connected:', data);
        setBackendStatus('✅ Backend connected successfully!');
      } catch (err) {
        console.error('❌ Backend connection failed:', err);
        setBackendStatus('❌ Failed to connect to backend.');
      }
    };
    checkBackend();

    // ✅ Admin setup
    const adminAccount = { email: 'admin@careconnect.com', password: 'admin123', name: 'Admin' };
    localStorage.setItem('adminAccount', JSON.stringify(adminAccount));

    // ✅ Initialize AOS, GLightbox, PureCounter
    if (window.AOS) window.AOS.init({ duration: 600, easing: 'ease-in-out', once: true, mirror: false });
    if (window.GLightbox) window.GLightbox({ selector: '.glightbox' });
    if (window.PureCounter) new window.PureCounter();

    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll);
    const preloaderTimer = setTimeout(() => setShowPreloader(false), 2000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(preloaderTimer);
    };
  }, []);

  const handleScrollTop = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Router>
      <AuthContext.Provider value={{ user, setUser }}>
        <div className={`App ${isScrolled ? 'scrolled' : ''}`}>
          <Header />

          <Routes>
            <Route
              path="/"
              element={
                <main className="main">
                  <Hero />
                  <About />
                  <Services />
                  <Departments />
                  <Testimonials />
                  {user?.email && <ChatWidget />}
                </main>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/make-appointment" element={<MakeAppointment />} />
            <Route path="/check-appointments" element={<CheckAppointments />} />
            <Route path="/medicine-reminders" element={<MedicineReminders />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/doctor-dashboard" element={<DoctorDashboard />} />

            {/* Redirect unknown routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          <Footer />

          {/* Scroll to top */}
          <button
            id="scroll-top"
            className={`scroll-top d-flex align-items-center justify-content-center ${isScrolled ? 'active' : ''}`}
            onClick={handleScrollTop}
            style={{ background: 'none', border: 'none', padding: 0 }}
          >
            <i className="bi bi-arrow-up-short"></i>
          </button>

          {showPreloader && <div id="preloader"></div>}

          {showProfilePrompt && (
            <div className="cc-modal-backdrop">
              <div className="cc-profile-modal">
                <div className="cc-profile-modal-header">
                  <i className="bi bi-shield-fill-plus cc-profile-modal-icon"></i>
                  <h3>Complete Your Emergency Profile</h3>
                </div>
                <p className="cc-profile-modal-desc">
                  Welcome to CareConnect! Please complete your medical details so that our AI assistant can immediately provide the correct contact options in case of any medical emergencies.
                </p>
                <form onSubmit={handleProfileSubmit}>
                  <div className="cc-profile-form-group">
                    <label>Your Age</label>
                    <input
                      type="number"
                      placeholder="e.g. 28"
                      min="1"
                      max="120"
                      className="cc-profile-input"
                      value={promptAge}
                      onChange={(e) => setPromptAge(e.target.value)}
                      required
                    />
                  </div>
                  <div className="cc-profile-form-group">
                    <label>Emergency Contact Phone</label>
                    <input
                      type="tel"
                      placeholder="e.g. +91 98765 43210"
                      className="cc-profile-input"
                      value={promptContact}
                      onChange={(e) => setPromptContact(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="cc-profile-submit-btn">
                    Save Profile & Continue
                  </button>
                </form>
              </div>
            </div>
          )}

          <style>{`
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
            .cc-profile-modal {
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
            .cc-profile-modal-icon {
              font-size: 2rem;
              color: #1977cc;
            }
            .cc-profile-modal-header h3 {
              font-size: 1.35rem;
              font-weight: 700;
              margin: 0;
              color: #0f172a;
            }
            .cc-profile-modal-desc {
              font-size: 14px;
              color: #475569;
              line-height: 1.6;
              margin-bottom: 1.8rem;
            }
            .cc-profile-form-group {
              margin-bottom: 1.25rem;
              text-align: left;
            }
            .cc-profile-form-group label {
              display: block;
              font-size: 13.5px;
              font-weight: 600;
              color: #334155;
              margin-bottom: 6px;
            }
            .cc-profile-input {
              width: 100%;
              padding: 10px 14px;
              border: 1px solid #cbd5e1;
              border-radius: 8px;
              font-size: 14px;
              outline: none;
              transition: border-color 0.2s;
            }
            .cc-profile-input:focus {
              border-color: #1977cc;
            }
            .cc-profile-submit-btn {
              background: #1977cc;
              color: white;
              border: none;
              padding: 12px 18px;
              border-radius: 8px;
              font-weight: 600;
              font-size: 15px;
              width: 100%;
              cursor: pointer;
              margin-top: 10px;
              transition: background 0.2s;
            }
            .cc-profile-submit-btn:hover {
              background: #1665a9;
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
        </div>
      </AuthContext.Provider>
    </Router>
  );
}

export default App;
