import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ProviderExpandableDiv = ({ title, children, defaultExpand }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpand);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-300 transition-transform duration-300 ease-in-out">
      <button
        onClick={handleToggle}
        className={`w-full py-3 px-4 text-left font-semibold focus:outline-none transition-colors duration-300 ${isExpanded ? 'bg-green-700 text-white' : 'bg-green-600 text-white'}`}
      >
        <span>{title}</span>
        <span className={`float-right transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}>
          ▼
        </span>
      </button>
      <motion.div
        initial={{ height: 0, opacity: 0, marginTop: 0 }}
        animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0, marginTop: isExpanded ? '1rem' : 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        className="overflow-hidden"
      >
        <div className="p-4 bg-gray-100">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

export default ProviderExpandableDiv;
