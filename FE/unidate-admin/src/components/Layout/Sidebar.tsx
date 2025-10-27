import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-gray-800 text-white h-full">
      <div className="p-4">
        <h2 className="text-lg font-bold">Admin Panel</h2>
      </div>
      <nav className="mt-4">
        <ul>
          <li>
            <Link to="/dashboard" className="block p-2 hover:bg-gray-700">
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/users" className="block p-2 hover:bg-gray-700">
              Users
            </Link>
          </li>
          <li>
            <Link to="/settings" className="block p-2 hover:bg-gray-700">
              Settings
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;