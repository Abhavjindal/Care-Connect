import React from 'react';
import { NavLink } from 'react-router-dom';

function Appointments() {
  return (
    <main className="auth-container" style={{
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      padding: '40px 30px',
      borderRadius: '12px',
      boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
      width: '100%',
      maxWidth: '400px',
      margin: '2rem auto',
    }} data-aos="fade-up">
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Make an Appointment</h2>
      <p style={{ textAlign: 'center' }}>Please login or sign up to continue booking your appointment.</p>
      <div className="appointment-btns" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <NavLink to="/login" className="btn cta-btn">Login</NavLink>
        <NavLink to="/signup" className="btn cta-btn">Sign Up</NavLink>
      </div>
    </main>
  );
}

export default Appointments;