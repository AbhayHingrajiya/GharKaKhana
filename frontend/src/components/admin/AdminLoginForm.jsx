import React, { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import {useNavigate, useLocation} from 'react-router-dom';

const AdminLoginForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError("Both fields are required.");
      return;
    }

    try {
      const res = await axios.post("/api/adminLogin", formData);
      console.log("Login successful:", res.data);
      window.location.assign(window.location.href);
    } catch (err) {
      console.error("Login failed:", err.response.data);
      setError(err.response.data.message || "An error occurred.");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white shadow-lg rounded-lg p-6"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
          Admin Login
        </h2>
        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              placeholder="Enter your password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition"
          >
            Login
          </motion.button>
        </form>
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Forgot your password?{" "}
            <a className="text-blue-500 cursor-pointer hover:underline" onClick = { () => navigate('/forgotPassword', { state: { role: 'admin' } }) }>
              Reset it here
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLoginForm;
