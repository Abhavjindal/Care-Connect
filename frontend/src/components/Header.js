// src/components/Header.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../App';

function Header() {
  const { user } = React.useContext(AuthContext);

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    window.location.href = '/';
  };

  return (
    <header id="header" className="header d-flex align-items-center sticky-top">
      <div className="container-fluid container-xl d-flex align-items-center justify-content-between">
        {/* ✅ Updated logo path to work after deployment */}
        <a href="/" className="logo d-flex align-items-center">
          <img
            src={process.env.PUBLIC_URL + '/assets/img/logo.png'}
            alt="Logo"
          />
          <h1>CareConnect</h1>
        </a>

        <i className="mobile-nav-toggle bi bi-list d-xl-none"></i>

        <nav id="navmenu" className="navmenu">
          <ul>
            <li><Link to="/" className="nav-link">Home</Link></li>

            {user?.email === 'admin@careconnect.com' ? (
              // Logged in as administrator
              <>
                <li><Link to="/admin-dashboard" className="nav-link">Admin Dashboard</Link></li>
                <li>
                  <button
                    className="nav-link btn-logout"
                    onClick={handleLogout}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                    }}
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : user?.email ? (
              // Logged in as patient
              <>
                <li><Link to="/make-appointment" className="nav-link">Make Appointment</Link></li>
                <li><Link to="/check-appointments" className="nav-link">Check Appointments</Link></li>
                <li><Link to="/medicine-reminders" className="nav-link">Medicine Reminders</Link></li>
                <li>
                  <button
                    className="nav-link btn-logout"
                    onClick={handleLogout}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                    }}
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              // Not logged in
              <>
                <li><Link to="/make-appointment" className="nav-link">Make Appointment</Link></li>
                <li><Link to="/login" className="nav-link">Login</Link></li>
                <li><Link to="/signup" className="nav-link">Sign Up</Link></li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;
