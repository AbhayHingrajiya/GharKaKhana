import React, { useState } from 'react';
import AdminProvider from './AdminProvider'
import AdminConsumer from './AdminConsumer'
import { motion, AnimatePresence } from 'framer-motion';

const AdminDashboard = () => {

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-green-800 text-white p-4">
        <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>
        <ul>
          <li className="mb-4">
            <a className="hover:underline">Food Providers</a>
          </li>
          <li className="mb-4">
            <a className="hover:underline">Food Consumer</a>
          </li>
          <li className="mb-4">
            <a className="hover:underline">Food Deliver</a>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      {/* <AdminProvider /> */}
      <AdminConsumer />
    </div>
  );
};

export default AdminDashboard;
