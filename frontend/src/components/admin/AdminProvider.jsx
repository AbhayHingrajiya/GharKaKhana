import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { ClimbingBoxLoader } from "react-spinners";

const AdminProvider = () => {
    
    const [expandedProviderId, setExpandedProviderId] = useState(null);
    const [expandedDishId, setExpandedDishId] = useState(null);
    const [providersData, setProvidersData] = useState(null);
    
    // Filter states
    const [cityNameFilter, setCityNameFilter] = useState('');
    const [pincodeFilter, setPincodeFilter] = useState('');
    const [providerEmailFilter, setProviderEmailFilter] = useState('');
    const [dishStatusFilter, setDishStatusFilter] = useState('');

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

    // Filter logic for dishes
    const filterDishes = (dishes) => {
        return dishes.filter((dish) => {
            const cityMatch = cityNameFilter === '' || dish.dishInfo.cityName.toLowerCase().includes(cityNameFilter.toLowerCase());
            const pincodeMatch = pincodeFilter === '' || dish.dishInfo.pincode.includes(pincodeFilter);
            const dishStatusMatch = dishStatusFilter === '' || 
                ((dishStatusFilter === 'available' && dish.dishStatus.availableQuantity > 0) ||
                (dishStatusFilter === 'pending' && dish.dishStatus.pendingQuantity > 0) ||
                (dishStatusFilter === 'completed' && dish.dishStatus.completeQuantity > 0) ||
                (dishStatusFilter === 'unavailable' && dish.dishStatus.availableQuantity === 0 && dish.dishStatus.pendingQuantity === 0));

            return cityMatch && pincodeMatch && dishStatusMatch;
        })
        .sort((a, b) => {
            // Sort by pending first, then available
            if (a.dishStatus.pendingQuantity > 0 && b.dishStatus.pendingQuantity === 0) return -1;
            if (a.dishStatus.pendingQuantity === 0 && b.dishStatus.pendingQuantity > 0) return 1;

            if (a.dishStatus.availableQuantity > 0 && b.dishStatus.availableQuantity === 0) return -1;
            if (a.dishStatus.availableQuantity === 0 && b.dishStatus.availableQuantity > 0) return 1;

            if (a.dishStatus.completeQuantity > 0 && b.dishStatus.completeQuantity === 0) return -1;
            if (a.dishStatus.completeQuantity === 0 && b.dishStatus.completeQuantity > 0) return 1;

            return 0; // If both have the same status, keep the same order
        });
    };

    // Filter logic for providers
    const filteredProviders = providersData ? providersData.map((provider) => {
        // Filter dishes based on the criteria
        const filteredDishes = filterDishes(provider.dishes);

        // Filter by provider email
        const emailMatch = providerEmailFilter === '' || provider.providerInfo.email.toLowerCase().includes(providerEmailFilter.toLowerCase());

        // Return the provider with only the filtered dishes and if email matches
        return emailMatch ? { ...provider, dishes: filteredDishes } : null;
    }).filter(provider => provider && provider.dishes.length > 0) : [];

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

            {/* Filter Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <input 
                    type="text" 
                    placeholder="Filter by City Name" 
                    value={cityNameFilter} 
                    onChange={(e) => setCityNameFilter(e.target.value)} 
                    className="border p-2 rounded w-full"
                />
                <input 
                    type="text" 
                    placeholder="Filter by Pincode" 
                    value={pincodeFilter} 
                    onChange={(e) => setPincodeFilter(e.target.value)} 
                    className="border p-2 rounded w-full"
                />
                <input 
                    type="email" 
                    placeholder="Filter by Provider Email" 
                    value={providerEmailFilter} 
                    onChange={(e) => setProviderEmailFilter(e.target.value)} 
                    className="border p-2 rounded w-full"
                />
                <select 
                    value={dishStatusFilter} 
                    onChange={(e) => setDishStatusFilter(e.target.value)} 
                    className="border p-2 rounded w-full"
                >
                    <option value="">All Statuses</option>
                    <option value="available">Available</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="unavailable">Unavailable</option>
                </select>
            </div>

            {/* Providers Section */}
            {filteredProviders.map((provider) => (
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
                                                    <p className="text-gray-600">City Name: {dish.dishInfo.cityName}</p>
                                                    <p className="text-gray-600">Pincode: {dish.dishInfo.pincode}</p>
                                                    <p className="text-gray-600">Dish Price: ₹{dish.dishInfo.dishPrice}</p>
                                                    <p className="text-gray-600">Dish Repeat: {(dish.dishInfo.repeat.length > 0) ? dish.dishInfo.repeat.join(',') : 'None'}</p>
                                                    <p className="text-gray-600">Dish Order Till: {dish.dishInfo.orderTill}</p>
                                                    <p className="text-gray-600">Dish Delivery Till: {dish.dishInfo.deliveryTill}</p>
                                                    <p className="text-gray-600">Dish Date: {dish.dishInfo.date}</p>
                                                    <p className="text-gray-600">Available Quantity: {dish.dishStatus.availableQuantity}</p>
                                                    <p className="text-gray-600">Pending Quantity: {dish.dishStatus.pendingQuantity}</p>
                                                    <p className="text-gray-600">Canceled Quantity: {dish.dishStatus.cancelQuantity}</p>
                                                    <p className="text-gray-600">Complete Quantity: {dish.dishStatus.completeQuantity}</p>
                                                    <ul className="list-disc ml-6 mt-4">
                                                        {dish.itemInfo.map((item) => (
                                                            <li key={item._id} className="mb-2">
                                                                <span className="font-semibold">{item.itemName}</span> - 
                                                                Quantity: {item.itemQuantity}, Flavor: {(item.itemFlavor != 'flavor') ? item.itemFlavor : 'N/A'}
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
