import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { removeuserAccessToken } from "../../utils/helper/accessToken";
import { getStoreDetails } from "../../api/UserServices";

const AdminSidebar = ({ isPcBarOpen }) => {
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState({
    category: false,
    product: false,
    allergy: false, // Add this new state for allergy submenu
  });

  const [storeName, setStoreName] = useState("Food Order");

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const res = await getStoreDetails();
        if (res?.name) {
          setStoreName(res.name); // server se aaya store name set karo
        }
      } catch (err) {
        console.error("Store fetch failed", err);
      }
    };

    fetchStore();
  }, []);

  // Set active menu based on current route
  useEffect(() => {
    const path = location.pathname;
    setActiveMenu({
      category: path.includes("/category-list"),
      product:
        path.includes("/products-list") ||
        path.includes("/category-list") ||
        path.includes("/toppings") ||
        path.includes("/topping-groups") ||
        path.includes("/group-item") ||
        path.includes("/product-groups"),
      allergy:
        path.includes("/admin/add-allergy") ||
        // path.includes("/admin/allergy-group") ||
        path.includes("/admin/item-allergy") ||
        path.includes("/admin/allergy"), // Add allergy path detection
    });
  }, [location.pathname]);

  const toggleMenu = (menu) => {
    setActiveMenu((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  // In your component
  const handleLogout = async () => {
    // alert('hii')
    try {
      // await logoutUser();
      // Clear client-side authentication
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("store_id");
      // localStorage.removeItem('userData');
      removeuserAccessToken({ tokenName: "userData" });

      // Redirect with state reset
      window.location.href = "/admin"; // Full page reload to clear state
      // OR if you prefer SPA navigation:
    } catch (error) {
      // Handle 401 specifically
      if (error.response?.status === 401) {
        // Still proceed with client-side cleanup
        localStorage.clear();
      }
    }
  };

  return (
    <nav className={`pc-sidebar ${!isPcBarOpen ? "pc-sidebar-hide" : ""}`}>
      <div className="navbar-wrapper">
        <div className="m-header">
          {/* <a href="#" className="b-brand text-primary">
            <img 
              src="https://html.phoenixcoded.net/light-able/bootstrap/assets/images/logo-dark.svg" 
              alt="logo" 
              className="logo-lg" 
            />
            <span className="badge bg-brand-color-2 rounded-pill ms-1 theme-version">
            <h3> {storeName}</h3>
            </span>
          </a> */}
          <h4> {storeName}</h4>
        </div>

        <div className="navbar-content">
          <ul className="pc-navbar">
            <li className="pc-item pc-caption">
              <label>Navigation</label>
              <i className="ph-duotone ph-gauge"></i>
            </li>

            <li
              className={`pc-item ${
                location.pathname === "/admin/home" ? "active" : ""
              }`}
            >
              <a href="/admin/home" className="pc-link">
                <span className="pc-micon">
                  <i className="ph-duotone ph-gauge"></i>
                </span>
                <span className="pc-mtext">Dashboard</span>
              </a>
            </li>

            <li
              className={`pc-item ${
                location.pathname === "/admin/tax" ? "active" : ""
              }`}
            >
              <a href="/admin/tax" className="pc-link">
                <span className="pc-micon">
                  <i className="ph-duotone ph-gauge"></i>
                </span>
                <span className="pc-mtext">Tax</span>
              </a>
            </li>

            {/* Product Menu */}
            <li
              className={`pc-item pc-hasmenu ${
                activeMenu.product ? "active pc-trigger" : ""
              }`}
            >
              <a
                href="#!"
                className="pc-link"
                onClick={(e) => {
                  e.preventDefault();
                  toggleMenu("product");
                }}
              >
                <span className="pc-micon">
                  <i className="ph-duotone ph-shopping-cart"></i>
                </span>
                <span className="pc-mtext">Product</span>
                <span className="pc-arrow">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </span>
              </a>
              <ul className="pc-submenu">
                <li
                  className={`pc-item ${
                    location.pathname.includes("/category-list") ? "active" : ""
                  }`}
                >
                  <a className="pc-link" href="/admin/category-list">
                    Category
                  </a>
                </li>
                <li
                  className={`pc-item ${
                    location.pathname.includes("/products-list") ? "active" : ""
                  }`}
                >
                  <a className="pc-link" href="/admin/products-list">
                    Product
                  </a>
                </li>
                <li
                  className={`pc-item ${
                    location.pathname.includes("/toppings") ? "active" : ""
                  }`}
                >
                  <a className="pc-link" href="/admin/toppings">
                    Toppings
                  </a>
                </li>
                <li
                  className={`pc-item ${
                    location.pathname.includes("/admin/topping-groups")
                      ? "active"
                      : ""
                  }`}
                >
                  <a className="pc-link" href="/admin/topping-groups">
                    Topping Groups
                  </a>
                </li>

                <li
                  className={`pc-item ${
                    location.pathname.includes("/admin/group-item")
                      ? "active"
                      : ""
                  }`}
                >
                  <a className="pc-link" href="/admin/group-item">
                    Group Item
                  </a>
                </li>

                <li
                  className={`pc-item ${
                    location.pathname.includes("/admin/product-groups")
                      ? "active"
                      : ""
                  }`}
                >
                  <a className="pc-link" href="/admin/product-groups">
                    Product Groups
                  </a>
                </li>
              </ul>
            </li>

            {/* Allergy Menu - Add this new section */}
            <li
              className={`pc-item pc-hasmenu ${
                activeMenu.allergy ? "active pc-trigger" : ""
              }`}
            >
              <a
                href="#!"
                className="pc-link"
                onClick={(e) => {
                  e.preventDefault();
                  toggleMenu("allergy");
                }}
              >
                <span className="pc-micon">
                  <i className="ph-duotone ph-warning"></i>
                </span>
                <span className="pc-mtext">Allergy</span>
                <span className="pc-arrow">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </span>
              </a>
              <ul className="pc-submenu">
                <li
                  className={`pc-item ${
                    location.pathname.includes("/admin/allergy") ? "active" : ""
                  }`}
                >
                  <a className="pc-link" href="/admin/allergy">
                    Add Allergy
                  </a>
                </li>
                {/* <li
                  className={`pc-item ${
                    location.pathname.includes("/admin/allergy-group") ? "active" : ""
                  }`}
                >
                  <a className="pc-link" href="/admin/allergy-group">
                    Allergy Group
                  </a>
                </li> */}
                <li
                  className={`pc-item ${
                    location.pathname.includes("/admin/item-allergy")
                      ? "active"
                      : ""
                  }`}
                >
                  <a className="pc-link" href="/admin/item-allergy">
                    Item Allergy
                  </a>
                </li>
              </ul>
            </li>

            {/* categoriespage sidebar   */}

            {/* CategoriesPage sidebar */}
            <li
              className={`pc-item ${
                location.pathname.includes("/categories-page") ? "active" : ""
              }`}
            >
              <a
                href="#!"
                className="pc-link"
                onClick={(e) => {
                  e.preventDefault(); // sidebar collapse hone se roka
                  window.history.pushState({}, "", "/admin/categories-page"); // url change
                  window.dispatchEvent(new PopStateEvent("popstate")); // react-router ko notify
                }}
              >
                <span className="pc-micon">
                  <i className="ph-duotone ph-list-bullets"></i>{" "}
                  {/* Category icon */}
                </span>
                <span className="pc-mtext">Category</span>
              </a>
            </li>

            <li
              className={`pc-item ${
                location.pathname === "/store-setting" ? "active" : ""
              }`}
            >
              <a href="/admin/store-setting" className="pc-link">
                <span className="pc-micon">
                  <i className="ph-duotone ph-gauge"></i>
                </span>
                <span className="pc-mtext">Store setting </span>
              </a>
            </li>
            <li
              className={`pc-item ${
                location.pathname === "/admin/disscount" ? "active" : ""
              }`}
            >
              <a href="/admin/disscount" className="pc-link">
                <span className="pc-micon">
                  <i className="ph-duotone ph-gauge"></i>
                </span>
                <span className="pc-mtext">Disscount</span>
              </a>
            </li>
          </ul>
        </div>

        {/* User Card */}
        <div className="card pc-user-card">
          <div className="card-body">
            <div className="d-flex align-items-center">
              {/* User Image */}
              <div className="flex-shrink-0">
                <img
                  alt="user"
                  className="user-avtar wid-45 rounded-circle"
                  src="https://html.phoenixcoded.net/light-able/bootstrap/assets/images/user/avatar-1.jpg"
                />
              </div>

              {/* Dropdown Always Open */}
              <div className="flex-grow-1 ms-3">
                <div className="dropdown">
                  <a
                    href="#"
                    className="arrow-none dropdown-toggle show"
                    aria-expanded="true"
                    data-bs-offset="0,20"
                    onClick={(e) => e.preventDefault()}
                    style={{ textDecoration: "none" }}
                  >
                    <div
                      className="btn btn-sm btn-success d-flex align-items-center justify-content-center"
                      onClick={handleLogout}
                    >
                      <i className="ph-duotone ph-power me-2"></i>
                      Logout
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminSidebar;
