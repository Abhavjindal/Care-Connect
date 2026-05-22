// src/components/Header.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../App';

function Header() {
  const { user } = React.useContext(AuthContext);

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('doctorName');
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  const getInitials = (name) => {
    if (!name) return "U";
    const cleanName = name.replace(/@.*/, ''); // If it's email, remove domain
    const parts = cleanName.trim().split(/[\s._-]+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return cleanName.slice(0, 2).toUpperCase();
  };

  const renderProfileAvatar = () => {
    if (!user?.email) return null;
    const name = user.name || (user.role === 'admin' ? 'Admin' : 'User');
    const roleText = user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Patient';

    return (
      <li className="profile-item-dropdown">
        <div className="profile-avatar-container">
          <div className="profile-avatar">
            {getInitials(name)}
          </div>
          <div className="profile-tooltip">
            <div className="tooltip-name">{name}</div>
            <div className="tooltip-email">{user.email}</div>
            <div className="tooltip-role">{roleText}</div>
          </div>
        </div>
      </li>
    );
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

            {user?.role === 'admin' || user?.email === 'admin@careconnect.com' ? (
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
            ) : user?.role === 'doctor' ? (
              // Logged in as doctor
              <>
                <li><Link to="/doctor-dashboard" className="nav-link">Doctor Dashboard</Link></li>
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

            {/* Profile avatar badge showing initials and detail tooltip */}
            {renderProfileAvatar()}
          </ul>
        </nav>
      </div>

      <style>{`
        .profile-item-dropdown {
          position: relative;
          display: flex;
          align-items: center;
          margin-left: 15px;
        }

        .profile-avatar-container {
          position: relative;
          cursor: pointer;
          display: flex;
          align-items: center;
        }

        .profile-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: linear-gradient(135deg, #1977cc, #6366f1);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
          letter-spacing: 0.5px;
          border: 2px solid rgba(255, 255, 255, 0.8);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .profile-avatar-container:hover .profile-avatar {
          transform: scale(1.08);
          border-color: #1977cc;
          box-shadow: 0 10px 15px -3px rgba(25, 119, 204, 0.3), 0 4px 6px -2px rgba(25, 119, 204, 0.2);
        }

        /* Tooltip Styling */
        .profile-tooltip {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 12px;
          background: white;
          border-radius: 12px;
          padding: 14px 18px;
          min-width: 200px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          border: 1px solid rgba(226, 232, 240, 0.8);
          opacity: 0;
          visibility: hidden;
          transform: translateY(10px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1000;
          text-align: left;
        }

        .profile-avatar-container:hover .profile-tooltip {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        /* Arrow for the tooltip */
        .profile-tooltip::before {
          content: '';
          position: absolute;
          bottom: 100%;
          right: 14px;
          border-width: 6px;
          border-style: solid;
          border-color: transparent transparent white transparent;
        }

        .tooltip-name {
          font-weight: 700;
          font-size: 15px;
          color: #1e293b;
          margin-bottom: 2px;
          white-space: nowrap;
        }

        .tooltip-email {
          font-size: 12px;
          color: #64748b;
          margin-bottom: 8px;
          word-break: break-all;
        }

        .tooltip-role {
          display: inline-block;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 3px 8px;
          border-radius: 6px;
          background: #f1f5f9;
          color: #475569;
        }

        @media (max-width: 1199px) {
          .profile-item-dropdown {
            margin-left: 0;
            margin-top: 10px;
            padding: 10px 20px;
            display: block;
          }
          .profile-avatar-container {
            flex-direction: column;
            align-items: flex-start;
          }
          .profile-avatar {
            margin-bottom: 10px;
          }
          .profile-tooltip {
            position: static;
            opacity: 1;
            visibility: visible;
            transform: none;
            box-shadow: none;
            border: none;
            padding: 0;
            min-width: auto;
            background: transparent;
          }
          .profile-tooltip::before {
            display: none;
          }
          .tooltip-name {
            color: rgba(255, 255, 255, 0.8);
          }
          .tooltip-email {
            color: rgba(255, 255, 255, 0.5);
          }
          .tooltip-role {
            background: rgba(255, 255, 255, 0.1);
            color: rgba(255, 255, 255, 0.8);
          }
        }
      `}</style>
    </header>
  );
}

export default Header;
