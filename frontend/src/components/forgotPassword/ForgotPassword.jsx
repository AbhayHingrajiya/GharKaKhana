import React, { useState } from 'react';
import { motion } from 'framer-motion';
import logo from '../../assets/logoBlack.png';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('consumer');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [wrongOtpCount, setWrongOtpCount] = useState(0);
  const [otpError, setOtpError] = useState('');
  const [otpFinal, setOtpFinal] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState(''); // New state for feedback messages

  const handleSendOtp = async () => {
    if (email) {
      try {
        setOtpError('');
        setFeedbackMessage('');
        const res = await axios.post('/api/forgotPasswordSendOtp', { userEmail: email, role: selectedRole });

        if (res.status === 200) {
          setIsOtpSent(true);
          setOtpFinal(res.data.otp);
          console.log('Generated OTP:', res.data.otp); // For testing/debugging purposes
          setTimeout(() => {
            setOtpFinal('');
          }, 600000); // Clear OTP after 10 minutes
          setFeedbackMessage('OTP has been sent to your email!');
        } else {
          setOtpError(res.data.message || 'Failed to send OTP. Please try again.');
        }
      } catch (error) {
        console.error(error);
        setOtpError(error.response?.data?.message || 'An error occurred while sending OTP.');
      }
    } else {
      setOtpError('Please enter a valid email address.');
    }
  };

  const handleVerifyOtp = () => {
    if (otp == otpFinal) {
      setIsOtpVerified(true);
      setOtpError('');
      setFeedbackMessage('OTP verified successfully.');
    } else {
      setOtpError('Invalid OTP. Please try again.');
      setWrongOtpCount((prev) => prev + 1);
    }
  };

  const handleRoleChange = (role) => setSelectedRole(role.toLowerCase());

  const resetPasswordClick = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      setFeedbackMessage('Please fill in both password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setFeedbackMessage('Passwords do not match. Please try again.');
      return;
    }

    try {
      const res = await axios.post('/api/resetPassword', {
        newPassword,
        role: selectedRole,
      });

      if (res.status === 200) {
        setFeedbackMessage('Password reset successfully. You can now log in.');
        alert('password reset successfully');
        return (
          <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 p-4">
            {/* Animated Logo */}
            <motion.div
              className="flex items-center justify-center w-24 h-24"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 120 }}
            >
              <img src={logo} alt="Logo" className="rounded-full shadow-lg" />
            </motion.div>
        
            {/* Title */}
            <motion.h2
              className="mt-6 text-2xl font-bold text-gray-700"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Forgot Password
            </motion.h2>
        
            {/* Role Selection */}
            <motion.div
              className="mt-8 flex space-x-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {['Consumer', 'Provider', 'Delivery Boy'].map((role) => (
                <label
                  key={role}
                  className={`cursor-pointer px-4 py-2 rounded-lg font-medium ${
                    selectedRole === role.toLowerCase()
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-white text-gray-700 border-2 border-blue-300'
                  } transition-all`}
                  onClick={() => handleRoleChange(role)}
                >
                  {role}
                </label>
              ))}
            </motion.div>
        
            {/* Input Fields */}
            <motion.form
              className="mt-8 w-full max-w-md space-y-4 bg-white p-6 rounded-lg shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onSubmit={resetPasswordClick} // Updated to prevent page refresh
            >
              {/* Email Input */}
              <div className="relative flex items-center">
                <input
                  type="email"
                  placeholder="Email Address"
                  className="peer w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  disabled={isOtpVerified}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {!isOtpVerified && (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isOtpSent}
                    className={`ml-4 w-36 px-4 py-2 font-semibold rounded-lg ${
                      isOtpSent
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        : 'bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300'
                    }`}
                  >
                    Send OTP
                  </button>
                )}
              </div>
        
              {/* OTP Input */}
              {isOtpSent && !isOtpVerified && (
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    className="peer w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    className="ml-4 w-40 px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 focus:outline-none focus:ring-4 focus:ring-green-300"
                  >
                    Verify OTP
                  </button>
                </div>
              )}
        
              {/* Error or Feedback Message */}
              {feedbackMessage && <p className="text-blue-600 text-sm mt-2">{feedbackMessage}</p>}
              {otpError && <p className="text-red-500 text-sm mt-2">{otpError}</p>}
        
              {/* New Password Fields */}
              {isOtpVerified && (
                <>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="New Password"
                      className="peer w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="Confirm Password"
                      className="peer w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </>
              )}
        
              {/* Submit Button */}
              {isOtpVerified && (
                <motion.button
                  type="submit"
                  className="w-full px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Reset Password
                </motion.button>
              )}
            </motion.form>
        
            {/* Go to Login Page Button */}
            <button
              className="mt-4 text-blue-600 hover:text-blue-700 focus:text-blue-700 active:text-blue-800 cursor-pointer duration-200 transition ease-in-out"
              onClick={() => (window.location.href = '/login')}
            >
              Go to Login Page
            </button>
          </div>
        );
        ;
      } else {
        setFeedbackMessage(res.data.message || 'Failed to reset password. Please try again.');
      }
    } catch (error) {
      setFeedbackMessage(error.response?.data?.message || 'An error occurred during password reset.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 p-4">
      {/* Animated Logo */}
      <motion.div
        className="flex items-center justify-center w-24 h-24"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 120 }}
      >
        <img src={logo} alt="Logo" className="rounded-full shadow-lg" />
      </motion.div>
  
      {/* Title */}
      <motion.h2
        className="mt-6 text-2xl font-bold text-gray-700"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Forgot Password
      </motion.h2>
  
      {/* Role Selection */}
      <motion.div
        className="mt-8 flex space-x-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {['Consumer', 'Provider', 'Delivery Boy'].map((role) => (
          <label
            key={role}
            className={`cursor-pointer px-4 py-2 rounded-lg font-medium ${
              selectedRole === role.toLowerCase()
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-white text-gray-700 border-2 border-blue-300'
            } transition-all`}
            onClick={() => handleRoleChange(role)}
          >
            {role}
          </label>
        ))}
      </motion.div>
  
      {/* Input Fields */}
      <motion.form
        className="mt-8 w-full max-w-md space-y-4 bg-white p-6 rounded-lg shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        onSubmit={resetPasswordClick} // Updated to prevent page refresh
      >
        {/* Email Input */}
        <div className="relative flex items-center">
          <input
            type="email"
            placeholder="Email Address"
            className="peer w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            disabled={isOtpVerified}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {!isOtpVerified && (
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={isOtpSent}
              className={`ml-4 w-36 px-4 py-2 font-semibold rounded-lg ${
                isOtpSent
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300'
              }`}
            >
              Send OTP
            </button>
          )}
        </div>
  
        {/* OTP Input */}
        {isOtpSent && !isOtpVerified && (
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Enter OTP"
              className="peer w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button
              type="button"
              onClick={handleVerifyOtp}
              className="ml-4 w-40 px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 focus:outline-none focus:ring-4 focus:ring-green-300"
            >
              Verify OTP
            </button>
          </div>
        )}
  
        {/* Error or Feedback Message */}
        {feedbackMessage && <p className="text-blue-600 text-sm mt-2">{feedbackMessage}</p>}
        {otpError && <p className="text-red-500 text-sm mt-2">{otpError}</p>}
  
        {/* New Password Fields */}
        {isOtpVerified && (
          <>
            <div className="relative">
              <input
                type="password"
                placeholder="New Password"
                className="peer w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="relative">
              <input
                type="password"
                placeholder="Confirm Password"
                className="peer w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </>
        )}
  
        {/* Submit Button */}
        {isOtpVerified && (
          <motion.button
            type="submit"
            className="w-full px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Reset Password
          </motion.button>
        )}
      </motion.form>
  
      {/* Go to Login Page Button */}
      <button
        className="mt-4 text-blue-600 hover:text-blue-700 focus:text-blue-700 active:text-blue-800 cursor-pointer duration-200 transition ease-in-out"
        onClick={() => navigate('/login')}
      >
        Go to Login Page
      </button>
    </div>
  );
  
};

export default ForgotPassword;
