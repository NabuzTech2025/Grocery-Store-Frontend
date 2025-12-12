// components/CheckoutProtection.jsx
import React, { useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";

const CheckoutProtection = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // IMPORTANT: Allow Stripe redirect without blocking
    const isStripeRedirect =
      searchParams.get("payment_intent") && searchParams.get("redirect_status");

    if (isStripeRedirect) {
      console.log("✅ Stripe redirect detected - allowing access");
      return; // Don't block Stripe redirects
    }

    // Check if it's a page refresh after order placement
    const orderPlaced = localStorage.getItem("order_placed");
    if (orderPlaced === "true") {
      console.log("✅ Order completed - allowing access");
      return; // Allow access to show success/redirect
    }

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
        console.log("❌ Invalid access for authenticated user - redirecting");
        navigate("/update-address", { replace: true });
        return;
      }
    } else {
      // Non-logged in users can only come from guest-login
      isValidAccess = allowedRoutesForGuest.includes(previousRoute);
      if (!isValidAccess) {
        console.log("❌ Invalid access for guest user - redirecting");
        navigate("/guest-login", { replace: true });
        return;
      }
    }
  }, [user, location.state, navigate, searchParams]);

  return children;
};

export default CheckoutProtection;
