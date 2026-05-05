import React from 'react';
import Sidebar from './Sidebar';
import '../styles/Platform.css';

const Layout = ({ children }) => {
  return (
    <div className="platform-layout">
      <Sidebar />
      <main className="platform-main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
