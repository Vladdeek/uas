import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      {/* You can add a logo or other common elements for auth pages here */}
      <Outlet /> {/* This will render the nested route component, e.g., Auth.jsx */}
    </div>
  );
};

export default AuthLayout; 