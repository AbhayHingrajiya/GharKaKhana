import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../navbar/Navbar';
import axios from 'axios';

const DeliveryBoyOrderPage = () => {

    const [processedOrders, setProcessedOrders] = useState([]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.post('/api/deliveryBoyGetAllCompleteOrders');
                setProcessedOrders(prevOrders => [...(prevOrders || []), ...response.data.orders]);
            } catch (err) {
                setError('Failed to fetch orders.');  // Set an error message
            }
        };

        fetchOrders();  // Call the function to fetch the data
    }, []);

    const groupDishesByProvider = (dishes) => {
        return dishes.reduce((grouped, dish) => {
            const providerKey = `${dish.provider.name}-${dish.provider.phone}-${dish.provider.address}`;
            if (!grouped[providerKey]) {
                grouped[providerKey] = {
                    provider: dish.provider,
                    dishes: [],
                };
            }
            grouped[providerKey].dishes.push(dish);
            return grouped;
        }, {});
    };

    return (
        <>
            <Navbar activeLink="order" />
            <div className="mt-24">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Complete Orders</h2>
                <div className="space-y-6">
                    {processedOrders.map((order) => {
                        const groupedDishes = groupDishesByProvider(order.dishes);
                        return (
                            <motion.div
                                key={order.orderDetails.orderId}
                                className="bg-gradient-to-r from-green-100 to-green-300 border-l-4 border-green-600 shadow-lg rounded-lg p-6"
                                whileHover={{ scale: 1.02 }}
                            >
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-semibold text-green-700">
                                        Order ID: {order.orderDetails.orderId}
                                    </h2>
                                    <span className="px-4 py-1 bg-green-600 text-white rounded-full text-sm">
                                        Accepted
                                    </span>
                                </div>

                                {/* Payment Information */}
                                <div className="mt-4 bg-yellow-50 p-4 rounded-md">
                                    <h3 className="text-lg font-medium text-gray-800">Payment Information:</h3>
                                    {order.orderDetails.paymentMethod === 'cod' ? (
                                        <p className="text-gray-600">
                                            <span className="font-medium">Payment Method:</span> Cash on Delivery (COD)
                                            <br />
                                            <span className="font-medium">Total Amount:</span> ₹{order.orderDetails.totalPrice}
                                        </p>
                                    ) : (
                                        <p className="text-gray-600">
                                            <span className="font-medium">Payment Method:</span> Online Payment
                                            <br />
                                            <span className="font-medium">Paid:</span> ₹{order.orderDetails.totalPrice}
                                        </p>
                                    )}
                                </div>

                                {/* Consumer Details */}
                                <div className="mt-4 bg-yellow-50 p-4 rounded-md">
                                    <h3 className="text-lg font-medium text-gray-800">Consumer Details:</h3>
                                    <p className="text-gray-600">
                                        <span className="font-medium">Name:</span> {order.consumer.name}
                                    </p>
                                    <p className="text-gray-600">
                                        <span className="font-medium">Phone:</span> {order.consumer.phone}
                                    </p>
                                    <p className="text-gray-600">
                                        <span className="font-medium">Address:</span> {order.consumer.address}
                                    </p>
                                </div>

                                <div className="mt-4 space-y-6">
                                    {Object.values(groupedDishes).map(({ provider, dishes }) => (
                                        <div key={`${provider.name}-${provider.phone}`} className="space-y-4">
                                            <div className="bg-blue-50 p-4 rounded-md">
                                                <p className="font-medium text-gray-800">Provider: {provider.name}</p>
                                                <p className="text-gray-600">Phone: {provider.phone}</p>
                                                <p className="text-gray-600">Address: {provider.address}</p>
                                            </div>
                                            <div className="space-y-2">
                                                {dishes.map((dish) => (
                                                    <div
                                                        key={dish.dishId}
                                                        className="bg-gray-50 p-4 rounded-md hover:bg-gray-100"
                                                    >
                                                        <p className="font-medium text-gray-800">Dish Name: {dish.name}</p>
                                                        <p className="font-medium text-gray-800">OTP: {dish.otp}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </>
    )
}

export default DeliveryBoyOrderPage
