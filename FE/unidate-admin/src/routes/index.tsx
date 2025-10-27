import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AdminLayout from '../components/Layout/AdminLayout';
import Dashboard from '../pages/Dashboard';
import UsersList from '../pages/Users/UsersList';
import UserDetail from '../pages/Users/UserDetail';
import UserForm from '../pages/Users/UserForm';
import Settings from '../pages/Settings';
import Login from '../pages/Auth/Login';
import ProtectedRoute from '../pages/Auth/ProtectedRoute';

const AppRoutes = () => {
  return (
    <Router>
      <AdminLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/users" element={<UsersList />} />
          <Route path="/users/:id" element={<UserDetail />} />
          <Route path="/users/new" element={<UserForm />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/login" element={<Login />} />
          <Route path="/protected" element={<ProtectedRoute />} />
        </Routes>
      </AdminLayout>
    </Router>
  );
};

export default AppRoutes;