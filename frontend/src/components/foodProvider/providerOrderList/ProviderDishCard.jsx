import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaEllipsisV } from 'react-icons/fa';

const ProviderDishCard = ({ dish, repeatedDays }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expireDate, setExpireDate] = useState(
    calculateExpireDate(dish.addedDate, dish.expiryTime)
  );
  const [timeLeft, setTimeLeft] = useState(getFormattedTimeLeft(expireDate));
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getFormattedTimeLeft(expireDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [expireDate]);

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleMenuToggle = () => {
    setShowMenu(!showMenu);
  };

  function getFormattedTimeLeft(targetDate) {
    const now = new Date();
    const timeLeft = targetDate - now;

    const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
    const seconds = Math.floor((timeLeft / 1000) % 60);

    return `${hours}:${minutes}:${seconds}`;
  }

  function calculateExpireDate(addedDate, expiryTime) {
    const addedDateTime = new Date(addedDate);
    const [hours, minutes] = expiryTime.split(':').map(Number);

    addedDateTime.setHours(hours, minutes, 0, 0);

    if (addedDateTime < new Date()) {
      addedDateTime.setDate(addedDateTime.getDate() + 1);
    }

    return addedDateTime;
  }

  return (
    <motion.div
      className="relative max-w-lg mx-auto bg-green-100 rounded-lg shadow-lg overflow-hidden transition-transform duration-300"
      whileHover={{
        scale: 1.03,
        boxShadow: '0 10px 20px rgba(0, 128, 0, 0.3)',
        backgroundColor: '#e6f7e9',
      }}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 100 }}
    >
      <div className="relative">
        <button
          onClick={handleMenuToggle}
          className="absolute top-2 right-2 bg-green-600 text-white p-2 rounded-full focus:outline-none z-10"
        >
          <FaEllipsisV />
        </button>

        {showMenu && (
          <motion.div
            className="absolute top-10 right-2 bg-white border border-gray-300 rounded-lg shadow-lg w-48 z-20"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <button
              className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
              onClick={() => alert('Cancel Order clicked')}
            >
              Cancel Order
            </button>
            <button
              className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
              onClick={() => alert('Edit Order clicked')}
            >
              Edit Order
            </button>
          </motion.div>
        )}
      </div>

      <div className="relative flex flex-col lg:flex-row">
        <motion.div className="relative lg:w-1/2">
          <motion.img
            className="h-48 w-full object-cover"
            src={dish.image}
            alt={dish.dishName}
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          />
          <div className="absolute top-2 left-2 bg-green-600 text-white px-3 py-1 rounded-lg text-sm">
            Expire: {timeLeft}
          </div>
        </motion.div>

        <div className="p-4 lg:p-5 lg:w-1/2 flex flex-col justify-between">
          <motion.h2
            className="text-2xl font-bold text-green-800 mb-2"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {dish.dishName}
          </motion.h2>
          <motion.p
            className="text-gray-700 mb-2"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Price: ${dish.dishPrice.toFixed(2)}
          </motion.p>
          <motion.p
            className="text-gray-700 mb-4"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Flavor: {dish.dishFlavor}
          </motion.p>

          <motion.button
            onClick={handleToggleExpand}
            className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 transition-colors duration-200"
            whileTap={{ scale: 0.95 }}
          >
            {isExpanded ? 'Less Info' : 'More Info'}
          </motion.button>
        </div>
      </div>

      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
        transition={{ height: { duration: 0.4 }, opacity: { duration: 0.4 } }}
        className="overflow-hidden p-4 bg-green-200"
      >
        <div className="text-gray-700">
          <h3 className="text-xl font-semibold text-green-900 mb-2">Item Details:</h3>
          {dish.itemDetails.map((item, index) => (
            <motion.div
              key={index}
              className="text-green-900 mb-2"
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="flex justify-between">
                <span>{item.itemName}</span>
                <span>{item.itemQuantity}g</span>
                <span>{item.itemFlavor}</span>
              </div>
            </motion.div>
          ))}

          {/* Display repeated days */}
          <motion.div
            className="text-green-900 mt-4"
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <strong>Repeated Days:</strong>
            <br />
            {repeatedDays && repeatedDays.length > 0 ? (
              repeatedDays.reduce((acc, day, index) => {
                if (index % 3 === 0 && index !== 0) {
                  acc.push(<br key={`br-${index}`} />); // Break after every 3 days
                }
                acc.push(<span key={index}>{day}{index % 3 !== 2 && index !== repeatedDays.length - 1 ? ', ' : ''}</span>);
                return acc;
              }, [])
            ) : (
              'None'
            )}
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProviderDishCard;