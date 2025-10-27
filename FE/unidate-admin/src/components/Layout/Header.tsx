import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-800 text-white p-4">
      <h1 className="text-xl font-bold">Admin Panel</h1>
      <nav>
        <ul className="flex space-x-4">
          <li><a href="/dashboard" className="hover:underline">Dashboard</a></li>
          <li><a href="/users" className="hover:underline">Users</a></li>
          <li><a href="/settings" className="hover:underline">Settings</a></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;