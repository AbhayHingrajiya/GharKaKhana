import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { ClimbingBoxLoader } from "react-spinners";

const AdminProvider = () => {
    
    const [expandedProviderId, setExpandedProviderId] = useState(null);
    const [expandedDishId, setExpandedDishId] = useState(null);
    const [providersData, setProvidersData] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const res = await axios.post('/api/getAdminProviderInfo');
                setProvidersData(res.data);
                console.log(res.data);
            } catch (err) {
                console.error('Error in getAdminProviderInfo at frontend side: ', err);
            }
        })();
    }, []);

    // Toggle provider expansion
    const toggleProviderExpansion = (providerId) => {
        setExpandedProviderId((prevId) => (prevId === providerId ? null : providerId));
        setExpandedDishId(null); // Collapse all dishes if a new provider is clicked
    };

    // Toggle dish expansion
    const toggleDishExpansion = (dishId) => {
        setExpandedDishId((prevId) => (prevId === dishId ? null : dishId));
    };

    const getDishColor = (dish) => {
        if (dish.dishStatus.pendingQuantity > 0) return 'bg-yellow-200'; // Yellow for pending
        if (dish.dishStatus.availableQuantity > 0) return 'bg-green-200'; // Green for available
        if (dish.dishStatus.completeQuantity > 0) return 'bg-gray-200';    // Gray for completed
        return 'bg-red-200'; // Red for unavailable
    };

    if (!providersData) {
        return (
            <div className="flex items-center justify-center h-screen overflow-hidden">
                <ClimbingBoxLoader color={'#123abc'} />
            </div>
        );
    }

    return (
        <div className="flex-1 p-8">
            <h1 className="text-3xl font-bold mb-8">Providers Overview</h1>

            {/* Providers Section */}
            {providersData.map((provider) => (
                <motion.div
                    key={provider.providerInfo._id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white shadow-lg p-4 rounded-lg mt-4"
                >
                    {/* Provider Info */}
                    <motion.div
                        className="cursor-pointer"
                        onClick={() => toggleProviderExpansion(provider.providerInfo._id)}
                        whileHover={{ scale: 1.02 }}
                    >
                        <h2 className="text-2xl font-bold">{provider.providerInfo.name}</h2>
                        <p className="text-gray-600">Email: {provider.providerInfo.email}</p>
                        <p className="text-gray-600">Phone: {provider.providerInfo.phoneNumber}</p>
                    </motion.div>

                    {/* Expanded Provider Details - Showing Dishes */}
                    <AnimatePresence>
                        {expandedProviderId === provider.providerInfo._id && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 overflow-hidden"
                            >
                                {provider.dishes.map((dish) => (
                                    <motion.div
                                        key={dish.dishInfo._id}
                                        className={`p-4 mt-2 rounded-lg ${getDishColor(dish)}`}
                                    >
                                        {/* Dish Info */}
                                        <motion.div
                                            className="cursor-pointer"
                                            onClick={() => toggleDishExpansion(dish.dishInfo._id)}
                                            whileHover={{ scale: 1.02 }}
                                        >
                                            <h3 className="text-xl font-bold">{dish.dishInfo.dishName}</h3>
                                        </motion.div>

                                        {/* Expanded Dish Details - Showing Items */}
                                        <AnimatePresence>
                                            {expandedDishId === dish.dishInfo._id && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="overflow-hidden mt-2"
                                                >
                                                    <p className="text-gray-600">Address: {dish.dishInfo.address}</p>
                                                    <p className="text-gray-600">Pincode: {dish.dishInfo.pincode}</p>
                                                    <p className="text-gray-600">Dish Price: ₹{dish.dishInfo.dishPrice}</p>
                                                    <p className="text-gray-600">Dish Repeat: {(dish.dishInfo.repeat.length > 0) ? dish.dishInfo.repeat.join(',') : 'None'}</p>
                                                    <p className="text-gray-600">Available Quantity: {dish.dishStatus.availableQuantity}</p>
                                                    <p className="text-gray-600">Pending Quantity: {dish.dishStatus.pendingQuantity}</p>
                                                    <p className="text-gray-600">Canceled Quantity: {dish.dishStatus.cancelQuantity}</p>
                                                    <p className="text-gray-600">Completed Quantity: {dish.dishStatus.completeQuantity}</p>

                                                    {/* Items List */}
                                                    <ul className="list-disc ml-6 mt-4">
                                                        {dish.itemInfo.map((item) => (
                                                            <li key={item._id} className="mb-2">
                                                                <span className="font-semibold">{item.itemName}</span> - 
                                                                Quantity: {item.itemQuantity}, Flavor: {(item.itemFlavor != 'flavor') ? item.itemFlavor : 'None'}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            ))}
        </div>
    );
};

export default AdminProvider;
