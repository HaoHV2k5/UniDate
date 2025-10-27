import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AdminLayout from './components/Layout/AdminLayout';
import Routes from './routes';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AdminLayout>
          <Routes />
        </AdminLayout>
      </Router>
    </AuthProvider>
  );
};

export default App;