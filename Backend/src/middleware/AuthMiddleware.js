// import React from 'react';
// import { Navigate } from 'react-router-dom';

// const ProtectedRoute = ({ children, allowedRoles }) => {
//   const token = localStorage.getItem('token');
//   const userId = localStorage.getItem('Userid');
//   const adminToken = localStorage.getItem('adminToken');
//   const adminId = localStorage.getItem('adminId');
//   const doctorToken = localStorage.getItem('doctorToken');
//   const doctorId = localStorage.getItem('doctorId');

//   // Determine user role
//   let userRole = null;
//   if (adminToken && adminId) {
//     userRole = 'admin';
//   } else if (doctorToken && doctorId) {
//     userRole = 'doctor';
//   } else if (token && userId) {
//     userRole = 'patient';
//   }

//   // Check if user is authenticated and has the required role
//   if (!userRole || (allowedRoles && !allowedRoles.includes(userRole))) {
//     // Redirect to appropriate login page based on the route they tried to access
//     if (allowedRoles?.includes('admin')) {
//       return <Navigate to="/admin/login" />;
//     } else if (allowedRoles?.includes('doctor')) {
//       return <Navigate to="/doctor/login" />;
//     }
//     return <Navigate to="/login" />;
//   }

//   return children;
// };

// export default ProtectedRoute;