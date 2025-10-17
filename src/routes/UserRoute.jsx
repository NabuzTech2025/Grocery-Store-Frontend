import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

const UserRoute = () => {
  const { user, loading } = useAuth();
  const storedCart = localStorage.getItem("cartItems");
  if (loading) {
    return <div>Loading...</div>;
  }
  return (user && user.role_id == "3") || storedCart ? (
    <Outlet />
  ) : (
    <Navigate to="/login" />
  );
};

export default UserRoute;
