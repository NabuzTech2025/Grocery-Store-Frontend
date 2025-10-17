// components/CheckoutProtection.jsx
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";

const CheckoutProtection = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get the previous route from navigation state
    const previousRoute = location.state?.from;

    // Check if user is authenticated
    const isAuthenticated = !!user;

    // Define allowed previous routes based on auth status
    const allowedRoutesForAuth = ["/update-address"];
    const allowedRoutesForGuest = ["/guest-login"];

    let isValidAccess = false;

    if (isAuthenticated) {
      // Logged in users can only come from update-address
      isValidAccess = allowedRoutesForAuth.includes(previousRoute);
      if (!isValidAccess) {
        navigate("/update-address", { replace: true });
        return;
      }
    } else {
      // Non-logged in users can only come from guest-login
      isValidAccess = allowedRoutesForGuest.includes(previousRoute);
      if (!isValidAccess) {
        navigate("/guest-login", { replace: true });
        return;
      }
    }
  }, [user, location.state, navigate]);

  return children;
};

export default CheckoutProtection;
