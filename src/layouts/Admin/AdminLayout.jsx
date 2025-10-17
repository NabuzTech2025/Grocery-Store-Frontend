import { Outlet } from 'react-router-dom';
import React, { useState } from "react";
import AdminNavbar from './AdminNavbar';
import AdminSidebar from './AdminSidebar';
import AdminFooter from './AdminFooter';

const AdminLayout = () => {
  const [isPcBarOpen, setIsPcBarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsPcBarOpen(prev => !prev);
  };

  return (
    <div className="admin-layout" data-pc-preset="preset-1" data-pc-sidebar-theme="light" 
         data-pc-sidebar-caption="true" data-pc-direction="ltr" data-pc-theme="light">
      {/* Loading Indicator */}
      <div className="loader-bg">
        <div className="loader-track">
          <div className="loader-fill"></div>
        </div>
      </div>

      {/* Layout Structure */}
      <AdminNavbar toggleSidebar={toggleSidebar} />
      <AdminSidebar isPcBarOpen={isPcBarOpen} />
      
      {/* Main Content Area */}
      <main className="pc-container">
        <div className="pc-content">
          <Outlet /> {/* Child routes will render here */}
        </div>
      </main>
      
      <AdminFooter />
      
      {/* Settings Panel */}
      <div className="offcanvas border-0 pct-offcanvas offcanvas-end" tabIndex="-1" id="offcanvas_pc_layout">
        {/* Settings content would go here */}
      </div>
    </div>
  );
};

export default AdminLayout;