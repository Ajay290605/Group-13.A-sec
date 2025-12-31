import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDashboardPath } from '../utils/dashboardRoutes';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to={getDashboardPath(user.role)} className="navbar-brand">
          🌾 Farmers Tracker
        </Link>
        <div className="navbar-links">
          <Link to={getDashboardPath(user.role)}>Dashboard</Link>
          <Link to="/activities">Activities</Link>
          <Link to="/tasks">Tasks</Link>
          {(user.role === 'Owner' || user.role === 'Manager') && (
            <Link to="/users">Users</Link>
          )}
          <div className="navbar-user">
            <span className="user-info">
              {user.username} ({user.role})
            </span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;




