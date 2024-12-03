import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios'

const AddAdminForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    aadhaarPhoto: null,
    aadhaarNumber: '',
    password: '',
    confirmPassword: '',
    city: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      aadhaarPhoto: e.target.files[0],
    }));
  };

  const validateForm = () => {
    const validationErrors = {};

    // Name validation
    if (!formData.name) validationErrors.name = 'Name is required';

    // Phone number validation (Assuming Indian phone number format)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!formData.phoneNumber) {
      validationErrors.phoneNumber = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phoneNumber)) {
      validationErrors.phoneNumber = 'Enter a valid phone number';
    }

    // Email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!formData.email) {
      validationErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      validationErrors.email = 'Enter a valid email address';
    }

    // Aadhaar card number validation (12 digits)
    const aadhaarRegex = /^\d{12}$/;
    if (!formData.aadhaarNumber) {
      validationErrors.aadhaarNumber = 'Aadhaar number is required';
    } else if (!aadhaarRegex.test(formData.aadhaarNumber)) {
      validationErrors.aadhaarNumber = 'Enter a valid 12-digit Aadhaar number';
    }

    // Aadhaar photo validation
    if (!formData.aadhaarPhoto) {
      validationErrors.aadhaarPhoto = 'Aadhaar photo is required';
    }

    // Password validation
    if (!formData.password) {
      validationErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      validationErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      validationErrors.confirmPassword = 'Passwords do not match';
    }

    // City validation
    if (!formData.city) {
      validationErrors.city = 'City is required';
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (validateForm()) {
      try {
        console.log('Form submitted successfully with:', formData);
  
        // Send the form data to the backend
        const res = await axios.post('/api/addNewAdmin', formData);
  
        if (res.status === 201) {
          // Success feedback
          console.log('Admin added successfully:', res.data);
          alert('Admin added successfully!');
          
          // Optionally, reset the form or navigate elsewhere
          setFormData({
            name: '',
            phoneNumber: '',
            email: '',
            aadhaarPhoto: null,
            aadhaarNumber: '',
            password: '',
            confirmPassword: '',
            city: '',
          });
        }
      } catch (error) {
        // Handle errors
        console.error('Error adding admin:', error.response?.data || error.message);
        alert(
          `Failed to add admin: ${
            error.response?.data?.message || error.message
          }`
        );
      }
    } else {
      // Validation error feedback
      alert('Please correct the errors in the form.');
    }
  };  

  return (
    <motion.div
      className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-lg mt-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-3xl font-semibold text-center text-gray-700 mb-6">Add New Admin</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-600">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>

        {/* Phone Number */}
        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-600">Phone Number</label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
          {errors.phoneNumber && <p className="text-red-500 text-sm">{errors.phoneNumber}</p>}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-600">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
        </div>

        {/* Aadhaar Photo */}
        <div>
          <label htmlFor="aadhaarPhoto" className="block text-sm font-medium text-gray-600">Aadhaar Card Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
          {errors.aadhaarPhoto && <p className="text-red-500 text-sm">{errors.aadhaarPhoto}</p>}
        </div>

        {/* Aadhaar Number */}
        <div>
          <label htmlFor="aadhaarNumber" className="block text-sm font-medium text-gray-600">Aadhaar Number</label>
          <input
            type="text"
            name="aadhaarNumber"
            value={formData.aadhaarNumber}
            onChange={handleChange}
            className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
          {errors.aadhaarNumber && <p className="text-red-500 text-sm">{errors.aadhaarNumber}</p>}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-600">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-600">Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
          {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
        </div>

        {/* City */}
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-600">City</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
          {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}
        </div>

        {/* Warning Message */}
        <div className="text-red-600 text-sm mt-2">
          <p className="italic">* You are responsible for this admin. You take full guarantee of this admin.</p>
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          className="w-full py-3 mt-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Add Admin
        </motion.button>
      </form>
    </motion.div>
  );
};

export default AddAdminForm;
