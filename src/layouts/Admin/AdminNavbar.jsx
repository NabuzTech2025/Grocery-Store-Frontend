const AdminNavbar = ({ toggleSidebar }) => {

    return (
      <header className="pc-header">
        <div className="header-wrapper">
          <div className="me-auto pc-mob-drp">
            <ul className="list-unstyled">
              {/* Sidebar collapse buttons */}
              <li className="pc-h-item pc-sidebar-collapse" onClick={toggleSidebar}>
                <a href="#" className="pc-head-link ms-0" id="sidebar-hide">
                  <i className="ti ti-menu-2"></i>
                </a>
              </li>
              <li className="pc-h-item pc-sidebar-popup">
                <a href="#" className="pc-head-link ms-0" id="mobile-collapse">
                  <i className="ti ti-menu-2"></i>
                </a>
              </li>
              
              {/* Search */}
              <li className="dropdown pc-h-item d-inline-flex d-md-none">
                <a className="pc-head-link dropdown-toggle arrow-none m-0" data-bs-toggle="dropdown" href="#" role="button">
                  <i className="ph-duotone ph-magnifying-glass"></i>
                </a>
                <div className="dropdown-menu pc-h-dropdown drp-search">
                  <form className="px-3">
                    <div className="mb-0 d-flex align-items-center">
                      <input type="search" className="form-control border-0 shadow-none" placeholder="Search..." />
                      <button className="btn btn-light-secondary btn-search">Search</button>
                    </div>
                  </form>
                </div>
              </li>
              
              <li className="pc-h-item d-none d-md-inline-flex">
                <form className="form-search">
                  <i className="ph-duotone ph-magnifying-glass icon-search"></i>
                  <input type="search" className="form-control" placeholder="Search..." />
                  <button className="btn btn-search" style={{padding: 0}}></button>
                </form>
              </li>
            </ul>
          </div>
          
          <div className="ms-auto">
            <ul className="list-unstyled">
              {/* User Profile */}
              <li className="dropdown pc-h-item header-user-profile">
                <a className="pc-head-link dropdown-toggle arrow-none me-0" data-bs-toggle="dropdown" href="#" role="button">
                  <img src="https://html.phoenixcoded.net/light-able/bootstrap/assets/images/user/avatar-2.jpg" alt="user" className="user-avtar" />
                </a>
                <div className="dropdown-menu dropdown-user-profile dropdown-menu-end pc-h-dropdown">
                  {/* Profile dropdown items */}
                </div>
              </li>
            </ul>
          </div>
        </div>
      </header>
    );
  };
  
  export default AdminNavbar;