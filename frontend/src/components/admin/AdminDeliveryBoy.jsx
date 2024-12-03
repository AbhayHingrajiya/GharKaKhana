import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { ClimbingBoxLoader } from "react-spinners";

const AdminDeliveryBoy = () => {
    const [cityNameFilter, setCityNameFilter] = useState('');
    const [deliveryBoyEmailFilter, setDeliveryBoyEmailFilter] = useState('');
    const [orderIdFilter, setOrderIdFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [expandedDeliveryBoyId, setExpandedDeliveryBoyId] = useState(null);
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deliveryBoys, setDeliveryBoys] = useState([]);

    useEffect(() => {
        const fetchDeliveryBoyInfo = async () => {
            try {
                setLoading(true);
                const res = await axios.post('/api/getAdminDeliveryBoyInfo');
                setDeliveryBoys(res.data); // Assuming API returns an array of delivery boy data
            } catch (err) {
                console.error('Failed to fetch delivery boy information');
            } finally {
                setLoading(false);
            }
        };

        fetchDeliveryBoyInfo();
    }, []);

    // Check if any filter is applied
    const isFilterApplied = cityNameFilter || deliveryBoyEmailFilter || orderIdFilter || statusFilter;

    // Filters
    const filteredDeliveryBoys = deliveryBoys
        .map((boy) => {
            const filteredOrders = boy.orders?.filter((order) => {
                return (
                    (!orderIdFilter || order._id.includes(orderIdFilter)) &&
                    (!statusFilter || order.status.toLowerCase() === statusFilter.toLowerCase())
                );
            });

            return {
                ...boy,
                filteredOrders,
                hasMatchingOrders: filteredOrders?.length > 0,
            };
        })
        .filter((boy) => {
            return (
                (!cityNameFilter || boy.deliveryBoyInfo.cityName.toLowerCase().includes(cityNameFilter.toLowerCase())) &&
                (!deliveryBoyEmailFilter || boy.deliveryBoyInfo.email.toLowerCase().includes(deliveryBoyEmailFilter.toLowerCase())) &&
                (isFilterApplied ? boy.hasMatchingOrders : true)
            );
        });

    const toggleDeliveryBoyExpansion = (id) => {
        setExpandedDeliveryBoyId((prevId) => (prevId === id ? null : id));
    };

    const toggleOrderExpansion = (id) => {
        setExpandedOrderId((prevId) => (prevId === id ? null : id));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen overflow-hidden">
                <ClimbingBoxLoader color={'#123abc'} />
            </div>
        );
    }

    return (
        <div className="flex-1 p-8">
            <h1 className="text-3xl font-bold mb-8">Delivery Boys Overview</h1>

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
                    type="email"
                    placeholder="Filter by Delivery Boy Email"
                    value={deliveryBoyEmailFilter}
                    onChange={(e) => setDeliveryBoyEmailFilter(e.target.value)}
                    className="border p-2 rounded w-full"
                />
                <input
                    type="text"
                    placeholder="Filter by Order ID"
                    value={orderIdFilter}
                    onChange={(e) => setOrderIdFilter(e.target.value)}
                    className="border p-2 rounded w-full"
                />
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border p-2 rounded w-full"
                >
                    <option value="">Filter by Status</option>
                    <option value="proceedToDelivery">Proceed To Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="canceled">Canceled</option>
                </select>
            </div>

            {/* Delivery Boys Section */}
            {filteredDeliveryBoys.map((boy) => (
                <motion.div
                    key={boy.deliveryBoyInfo._id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white shadow-lg p-4 rounded-lg mt-4"
                >
                    {/* Delivery Boy Info */}
                    <motion.div
                        className="cursor-pointer"
                        onClick={() => toggleDeliveryBoyExpansion(boy.deliveryBoyInfo._id)}
                        whileHover={{ scale: 1.02 }}
                    >
                        <h2 className="text-2xl font-bold">{boy.deliveryBoyInfo.name}</h2>
                        <p className="text-gray-600">ID: {boy.deliveryBoyInfo._id}</p>
                        <p className="text-gray-600">Email: {boy.deliveryBoyInfo.email}</p>
                        <p className="text-gray-600">Phone: {boy.deliveryBoyInfo.phoneNumber}</p>
                        <p className="text-gray-600">Vehicle: {boy.deliveryBoyInfo.vehicleName}</p>
                        <p className="text-gray-600">Vehicle Number: {boy.deliveryBoyInfo.vehicleNumber}</p>
                        <p className="text-gray-600">License Number: {boy.deliveryBoyInfo.licenseNumber}</p>
                        <p className="text-gray-600">City: {boy.deliveryBoyInfo.cityName}</p>
                    </motion.div>

                    {/* Expanded Delivery Boy Details - Showing Orders */}
                    <AnimatePresence>
                        {expandedDeliveryBoyId === boy.deliveryBoyInfo._id && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 overflow-hidden"
                            >
                                {boy.filteredOrders.length > 0 ? (
                                    boy.filteredOrders.map((order) => (
                                        <motion.div
                                            key={order._id}
                                            className={`p-4 mt-2 rounded-lg ${
                                                order.status === 'proceedToDelivery'
                                                    ? 'bg-yellow-200'
                                                    : order.status === 'delivered'
                                                    ? 'bg-green-200'
                                                    : 'bg-red-200'
                                            }`}
                                        >
                                            {/* Order Info */}
                                            <motion.div
                                                className="cursor-pointer"
                                                onClick={() => toggleOrderExpansion(order._id)}
                                                whileHover={{ scale: 1.02 }}
                                            >
                                                <h3 className="text-xl font-bold">{order.orderName}</h3>
                                                <p className="text-gray-600">Status: {order.status}</p>
                                            </motion.div>

                                            {/* Expanded Order Details */}
                                            <AnimatePresence>
                                                {expandedOrderId === order._id && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="overflow-hidden mt-2"
                                                    >
                                                        <p className="text-gray-600">Consumer Address: {order.consumerAddress}</p>
                                                        <p className="text-gray-600">Dish IDs: {order.dishIds.join(', ')}</p>
                                                        <p className="text-gray-600">
                                                            Cancelled Dish IDs: {order.cancelDishIds.length > 0 ? order.cancelDishIds.join(', ') : 'None'}
                                                        </p>
                                                        <p className="text-gray-600">Delivery Date: {order.deliveryDate}</p>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    ))
                                ) : (
                                    !isFilterApplied && <p className="text-gray-600">No orders available</p>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            ))}
        </div>
    );
};

export default AdminDeliveryBoy;
