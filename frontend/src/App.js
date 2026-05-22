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

  // Medication active popup notification states
  const [activeAlert, setActiveAlert] = useState(null);
  const [lastNotified, setLastNotified] = useState({});
  const [snoozedAlerts, setSnoozedAlerts] = useState({});

  useEffect(() => {
    // Only patients need to fill out the emergency profile
    const isPatient = user?.email && user?.role !== 'admin' && user?.role !== 'doctor' && user.email !== 'admin@careconnect.com';
    if (isPatient && (!user.age || !user.emergencyContact)) {
      setShowProfilePrompt(true);
    } else {
      setShowProfilePrompt(false);
    }
  }, [user]);

  // Request browser Notification permission for Patients
  useEffect(() => {
    if (user?.email && user.role !== 'admin' && user.role !== 'doctor') {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, [user]);

  // Custom Event Listener to simulate/trigger preview test notifications
  useEffect(() => {
    const handleTestTrigger = (e) => {
      playNotificationSound();
      setActiveAlert({
        id: "test-reminder-" + Date.now(),
        medicineName: e.detail?.medicineName || "Test Multivitamin 500mg",
        time: e.detail?.time || "Immediate Test Alarm",
        isTest: true
      });
      
      // Trigger native browser push notification
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        try {
          const notification = new Notification("💊 Medication Time (Test)!", {
            body: `It is time to take your test medicine: ${e.detail?.medicineName || "Test Multivitamin 500mg"}`,
            icon: "/assets/img/logo.png",
            requireInteraction: true
          });
          notification.onclick = () => {
            window.focus();
            notification.close();
          };
        } catch (err) {
          console.warn("Failed to trigger native Notification:", err);
        }
      }
    };
    
    window.addEventListener("trigger-test-med-reminder", handleTestTrigger);
    return () => window.removeEventListener("trigger-test-med-reminder", handleTestTrigger);
  }, []);

  // Audio synthesize chime function using Web Audio API
  const playNotificationSound = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      // Note 1 (E5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
      gain1.gain.setValueAtTime(0, ctx.currentTime);
      gain1.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.05);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.6);

      // Note 2 (A5)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(880.00, ctx.currentTime + 0.18); // A5
      gain2.gain.setValueAtTime(0, ctx.currentTime + 0.18);
      gain2.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.23);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc2.start(ctx.currentTime + 0.18);
      osc2.stop(ctx.currentTime + 0.8);
    } catch (e) {
      console.warn("AudioContext failed to start or play:", e);
    }
  };

  // Background medicine checker loop (runs every 15 seconds)
  useEffect(() => {
    if (!user?.email || user.role === 'admin' || user.role === 'doctor') return;

    const checkReminders = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/reminders?email=${user.email}`);
        if (!res.ok) return;
        const remindersList = await res.json();

        const now = new Date();
        const nowMs = now.getTime();
        const curDay = now.getDate();
        let curHour = now.getHours();
        const curMin = now.getMinutes();
        const curAmpm = curHour >= 12 ? 'PM' : 'AM';
        curHour = curHour % 12;
        curHour = curHour ? curHour : 12;

        remindersList.forEach((reminder) => {
          const snoozeTime = snoozedAlerts[reminder._id];
          let shouldAlert = false;
          let alertKey = "";

          if (snoozeTime) {
            if (nowMs >= snoozeTime) {
              shouldAlert = true;
              const snoozeDate = new Date(snoozeTime);
              alertKey = `${reminder._id}-snooze-${snoozeDate.getDate()}-${snoozeDate.getHours()}-${snoozeDate.getMinutes()}`;
            }
          } else {
            const timeStr = reminder.time;
            const match = timeStr.match(/^(\d{2}):(\d{2})\s*(AM|PM)/i);
            if (!match) return;
            
            const remHour = parseInt(match[1], 10);
            const remMin = parseInt(match[2], 10);
            const remAmpm = match[3].toUpperCase();

            if (curHour === remHour && curMin === remMin && curAmpm === remAmpm) {
              shouldAlert = true;
              alertKey = `${reminder._id}-${curDay}-${curHour}-${curMin}`;
            }
          }

          if (shouldAlert && (!alertKey || !lastNotified[alertKey])) {
            // Remove from snoozedAlerts if it was triggered
            if (snoozeTime) {
              setSnoozedAlerts(prev => {
                const updated = { ...prev };
                delete updated[reminder._id];
                return updated;
              });
            }

            playNotificationSound();
            setActiveAlert({
              id: reminder._id,
              medicineName: reminder.medicineName,
              time: reminder.time
            });

            if (alertKey) {
              setLastNotified(prev => ({ ...prev, [alertKey]: true }));
            }

            // Trigger native push notification
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              try {
                const notification = new Notification("💊 Medication Time!", {
                  body: `It is time to take your scheduled medicine: ${reminder.medicineName} (Scheduled for ${reminder.time})`,
                  icon: "/assets/img/logo.png",
                  tag: reminder._id,
                  requireInteraction: true
                });
                notification.onclick = () => {
                  window.focus();
                  notification.close();
                };
              } catch (e) {
                console.warn("Failed to trigger native Notification:", e);
              }
            }
          }
        });
      } catch (err) {
        console.error("Error in background medicine checker:", err);
      }
    };

    checkReminders();
    const interval = setInterval(checkReminders, 15000);
    return () => clearInterval(interval);
  }, [user, lastNotified, snoozedAlerts]);

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

          {/* Medicine Reminder Popup Alert */}
          {activeAlert && (
            <div className="cc-modal-backdrop">
              <div className="cc-med-alert-modal">
                <div className="cc-med-pulse-ring">
                  <i className="bi bi-capsule-pill cc-med-alert-icon"></i>
                </div>
                <h3 className="cc-med-alert-title">Medication Time!</h3>
                <p className="cc-med-alert-desc">
                  It is time to take your scheduled daily medicine:
                </p>
                
                <div className="cc-med-alert-box">
                  <span className="cc-med-alert-name">{activeAlert.medicineName}</span>
                  <span className="cc-med-alert-time">
                    <i className="bi bi-clock"></i> Scheduled for {activeAlert.time}
                  </span>
                </div>

                <div className="cc-med-alert-actions">
                  <button 
                    onClick={() => {
                      setActiveAlert(null);
                      if (!activeAlert.isTest) {
                        alert(`Glad you took your ${activeAlert.medicineName}! Stay healthy.`);
                      }
                    }} 
                    className="cc-med-alert-btn cc-med-btn-taken"
                  >
                    <i className="bi bi-check2-all"></i> Mark as Taken
                  </button>
                  <button 
                    onClick={() => {
                      if (activeAlert.isTest) {
                        setActiveAlert(null);
                        alert("Snoozing a simulated alarm will not schedule a real reminder, but it works perfectly on actual scheduled medicines!");
                      } else {
                        const snoozeUntil = Date.now() + 5 * 60 * 1000;
                        setSnoozedAlerts(prev => ({
                          ...prev,
                          [activeAlert.id]: snoozeUntil
                        }));
                        setActiveAlert(null);
                        alert("Medication snoozed for 5 minutes.");
                      }
                    }} 
                    className="cc-med-alert-btn cc-med-btn-snooze"
                  >
                    Snooze (5m)
                  </button>
                </div>
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
            
            /* Medicine Alert Modal CSS */
            .cc-med-alert-modal {
              background: linear-gradient(145deg, #ffffff, #f8fafc);
              padding: 2.5rem 2rem;
              border-radius: 24px;
              width: 100%;
              max-width: 420px;
              box-shadow: 0 25px 50px -12px rgba(16, 185, 129, 0.25), 0 15px 20px -5px rgba(0, 0, 0, 0.1);
              animation: cc-slide-up-modal 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
              text-align: center;
              border: 2px solid rgba(16, 185, 129, 0.15);
            }

            .cc-med-pulse-ring {
              width: 76px;
              height: 76px;
              border-radius: 50%;
              background: rgba(16, 185, 129, 0.1);
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 1.5rem auto;
              position: relative;
            }

            .cc-med-pulse-ring::before {
              content: '';
              position: absolute;
              width: 100%;
              height: 100%;
              border-radius: 50%;
              background: rgba(16, 185, 129, 0.2);
              animation: cc-pulse-glow 1.5s infinite ease-in-out;
            }

            .cc-med-alert-icon {
              font-size: 2.2rem;
              color: #10b981;
              z-index: 2;
            }

            .cc-med-alert-title {
              font-size: 1.5rem;
              font-weight: 800;
              color: #0f172a;
              margin: 0 0 0.5rem 0;
            }

            .cc-med-alert-desc {
              font-size: 14.5px;
              color: #64748b;
              margin: 0 0 1.5rem 0;
            }

            .cc-med-alert-box {
              background: #f1f5f9;
              border-radius: 16px;
              padding: 1.25rem;
              margin-bottom: 2rem;
              border: 1px solid #e2e8f0;
              text-align: center;
            }

            .cc-med-alert-name {
              display: block;
              font-size: 1.2rem;
              font-weight: 700;
              color: #0f172a;
              margin-bottom: 6px;
            }

            .cc-med-alert-time {
              font-size: 13px;
              color: #10b981;
              font-weight: 600;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 4px;
            }

            .cc-med-alert-actions {
              display: flex;
              flex-direction: column;
              gap: 10px;
            }

            .cc-med-alert-btn {
              width: 100%;
              padding: 12px;
              border-radius: 12px;
              font-weight: 700;
              font-size: 15px;
              cursor: pointer;
              transition: all 0.2s ease;
              outline: none;
              box-sizing: border-box;
            }

            .cc-med-btn-taken {
              background: linear-gradient(135deg, #10b981, #059669);
              color: white;
              border: none;
              box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
            }

            .cc-med-btn-taken:hover {
              transform: translateY(-2px);
              box-shadow: 0 6px 20px rgba(16, 185, 129, 0.45);
            }

            .cc-med-btn-snooze {
              background: white;
              color: #475569;
              border: 1px solid #cbd5e1;
            }

            .cc-med-btn-snooze:hover {
              background: #f8fafc;
              color: #0f172a;
            }

            @keyframes cc-pulse-glow {
              0% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.3); opacity: 0; }
              100% { transform: scale(1.3); opacity: 0; }
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
