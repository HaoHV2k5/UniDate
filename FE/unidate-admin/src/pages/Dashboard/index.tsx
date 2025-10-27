import React from 'react';
import { AdminLayout } from '../../components/Layout/AdminLayout';

const Dashboard: React.FC = () => {
  return (
    <AdminLayout>
      <div className="p-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p>Welcome to the admin dashboard!</p>
        {/* Additional dashboard components and functionalities can be added here */}
      </div>
    </AdminLayout>
  );
};

export default Dashboard;