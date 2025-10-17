import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';

const AdminRoute = () => {
  const { user, loading } = useAuth();
  if (loading) {
    return <div>Loading...</div>; 
  }
  return user && user.role == '2' ? <Outlet /> : <Navigate to="/admin" />;
};

export default AdminRoute;
