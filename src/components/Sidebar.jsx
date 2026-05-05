import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaHome, 
  FaRoute, 
  FaChartBar, 
  FaUser, 
  FaCog, 
  FaSignOutAlt,
  FaLock
} from 'react-icons/fa';
import { ShieldLogo } from './Icons';
import '../styles/Platform.css';

const Sidebar = () => {
  const { logout, user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', name: 'Dashboard', icon: <FaHome /> },
    { path: '/learning-path', name: 'Learning Path', icon: <FaRoute /> },
    { path: '/global-stats', name: 'Global Stats', icon: <FaChartBar /> },
    { path: '/profile', name: 'My Profile', icon: <FaUser /> },
    { path: '/settings', name: 'Settings', icon: <FaCog /> },
  ];

  if (isAdmin) {
    navItems.push({ path: '/admin', name: 'Admin Panel', icon: <FaLock /> });
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <ShieldLogo size={18} />
        </div>
        <span className="sidebar-app-name">CyberShield</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-text">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user-info">
          <div className="sidebar-avatar">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="sidebar-user-details">
            <span className="sidebar-user-name">
              {user?.user_metadata?.full_name || 'Trainee'}
            </span>
            <span className="sidebar-user-email">
              {user?.email}
            </span>
          </div>
        </div>
        <button className="sidebar-logout-btn" onClick={handleLogout}>
          <FaSignOutAlt />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
