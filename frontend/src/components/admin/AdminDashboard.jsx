import React, { useEffect, useState } from 'react';
import AdminProvider from './AdminProvider';
import AdminConsumer from './AdminConsumer';
import AdminDeliveryBoy from './AdminDeliveryBoy';
import AdminVerifyUser from './AdminVerifyUser';
import AddAdminForm from './AddAdminForm';
import AdminDetails from './AdminDetails';
import axios from 'axios';
import AdminLoginForm from './AdminLoginForm';
import { ClimbingBoxLoader } from "react-spinners";

const AdminDashboard = () => {
  const [divUser, setDivUser] = useState('provider');
  const [isLoding, setIsLoding] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoding(true)
    const checkLoginStatus = async () => {
      try {
        const res = await axios.post('/api/checkAdminLoginStatus');
        console.log(res)
        setIsLoggedIn(res.data.isLoggedIn);
      } catch (err) {
        console.error("Error checking login status:", err);
        setIsLoggedIn(false);
      }finally{
        setIsLoding(false);
      }
    };

    checkLoginStatus();
  }, []);

  // Function to handle setting the active user type
  const handleSetDivUser = (userType) => {
    setDivUser(userType);
  };

  const handleSignOutAdmin = async () => {
    try {
      const res = await axios.post('/api/signOut');
      if (res.status === 200) {
        // Successfully signed out
        console.log('signout succes')
        window.location.assign(window.location.href);
      } else {
        console.error('Failed to sign out. Please try again.');
      }
    } catch (error) {
      console.error('Error signing out:', error.message);
    }
  };  

  if(isLoding){
    return (
      <div className="flex items-center justify-center h-screen overflow-hidden">
        <ClimbingBoxLoader color={'#123abc'} />
      </div>
    );
  }
  
  if(!isLoggedIn){
    return <AdminLoginForm />
  }

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
          <li
            className={`mb-4 cursor-pointer ${divUser === 'admin' ? 'font-bold underline' : ''}`}
            onClick={() => handleSetDivUser('admin')}
          >
            <a className="hover:underline">Admin Details</a>
          </li>
          <li
            className={`mb-4 cursor-pointer ${divUser === 'verify' ? 'font-bold underline' : ''}`}
            onClick={() => handleSetDivUser('verify')}
          >
            <a className="hover:underline">Verify Users</a>
          </li>
          <li
            className={`mb-4 cursor-pointer ${divUser === 'addAdmin' ? 'font-bold underline' : ''}`}
            onClick={() => handleSetDivUser('addAdmin')}
          >
            <a className="hover:underline">Add new Admin</a>
          </li>
          <li
            className={`mb-4 cursor-pointer`}
            onClick={handleSignOutAdmin}
          >
            <a className="hover:underline">Sign Out</a>
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
        ) : divUser === 'deliver' ? (
          <AdminDeliveryBoy />
        ) : divUser === 'verify' ? (
          <AdminVerifyUser />
        ) : divUser === 'addAdmin' ? (
          <AddAdminForm />
        ) : divUser === 'admin' ? (
          <AdminDetails />
        ) : (
          <AdminLoginForm />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
