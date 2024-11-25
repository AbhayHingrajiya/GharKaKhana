import React, { useState } from 'react';
import AdminProvider from './AdminProvider';
import AdminConsumer from './AdminConsumer';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDashboard = () => {
  const [divUser, setDivUser] = useState('provider');

  // Function to handle setting the active user type
  const handleSetDivUser = (userType) => {
    setDivUser(userType);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-green-800 text-white p-4">
        <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>
        <ul>
          <li
            className={`mb-4 cursor-pointer ${divUser === 'provider' ? 'font-bold underline' : ''}`}
            onClick={() => handleSetDivUser('provider')}
          >
            <a className="hover:underline">Food Providers</a>
          </li>
          <li
            className={`mb-4 cursor-pointer ${divUser === 'consumer' ? 'font-bold underline' : ''}`}
            onClick={() => handleSetDivUser('consumer')}
          >
            <a className="hover:underline">Food Consumer</a>
          </li>
          <li
            className={`mb-4 cursor-pointer ${divUser === 'deliver' ? 'font-bold underline' : ''}`}
            onClick={() => handleSetDivUser('deliver')}
          >
            <a className="hover:underline">Food Deliver</a>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      {/* <AdminConsumer /> */}
      <div className="flex-1 p-8">
        {divUser === 'provider' ? (
          <AdminProvider />
        ) : divUser === 'consumer' ? (
          <AdminConsumer />
        ) : (
          <AdminConsumer />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
