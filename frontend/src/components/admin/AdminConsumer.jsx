import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { ClimbingBoxLoader } from 'react-spinners';

const AdminConsumer = () => {
    const [expandedConsumerId, setExpandedConsumerId] = useState(null);
    const [expandedDish, setExpandedDish] = useState(null);
    const [consumers, setConsumers] = useState([]);
    const [dishInfoMap, setDishInfoMap] = useState({});
    
    // State for filters
    const [consumerEmailFilter, setConsumerEmailFilter] = useState('');
    const [orderOrDishIdFilter, setOrderOrDishIdFilter] = useState('');
    const [orderStatusFilter, setOrderStatusFilter] = useState('');

    useEffect(() => {
        (async () => {
            try {
                const res = await axios.post('/api/getAdminConsumerInfo');
                setDishInfoMap(res.data.dishInfoMap);
                setConsumers(res.data.consumersWithOrders);
            } catch (err) {
                console.error('Error in getAdminConsumerInfo at frontend side: ', err);
            }
        })();
    }, []);

    const toggleConsumerExpansion = (consumerId) => {
        setExpandedConsumerId((prevId) => (prevId === consumerId ? null : consumerId));
        setExpandedDish(null);
    };

    const toggleDishExpansion = (consumerId, orderId, dishId) => {
        const uniqueDishId = `${consumerId}-${orderId}-${dishId}`;
        setExpandedDish((prevDish) => (prevDish === uniqueDishId ? null : uniqueDishId));
    };

    const getOrderColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-200';
            case 'completed':
                return 'bg-green-200';
            case 'canceled':
                return 'bg-red-200';
            default:
                return 'bg-gray-300';
        }
    };

    // Determine if filtering is applied
    const isFiltering = consumerEmailFilter || orderOrDishIdFilter || orderStatusFilter;

    // Filter consumers based on filters
    const filteredConsumers = consumers.filter(consumer => {
        const matchesEmail = consumerEmailFilter
            ? consumer.consumerDetails.email.toLowerCase().includes(consumerEmailFilter.toLowerCase())
            : true;

        const matchesOrderOrDishId = orderOrDishIdFilter
            ? consumer.orders.some(order =>
                order.orderDetails._id.includes(orderOrDishIdFilter) ||
                Object.keys(order.orderDetails.dishInfo).some(dishId => dishId.includes(orderOrDishIdFilter))
            )
            : true;

        return matchesEmail && matchesOrderOrDishId;
    });

    // Map consumers to show their orders
    const consumersWithOrders = filteredConsumers.map(consumer => ({
        ...consumer,
        orders: consumer.orders.filter(order => 
            orderStatusFilter === '' || order.orderDetails.status === orderStatusFilter
        ).sort((a, b) => new Date(b.orderDetails.createdAt) - new Date(a.orderDetails.createdAt)) // Newest first
    }));

    const totalOrders = consumersWithOrders.reduce((sum, consumer) => sum + consumer.orders.length, 0);

    return (
        <div className="flex-1 p-8">
            <h1 className="text-3xl font-bold mb-8">Consumers Overview</h1>

            {/* Filter Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <input 
                    type="text" 
                    placeholder="Filter by Consumer Email" 
                    value={consumerEmailFilter} 
                    onChange={(e) => setConsumerEmailFilter(e.target.value)} 
                    className="border p-2 rounded w-full"
                />
                <input 
                    type="text" 
                    placeholder="Filter by Order or Dish ID" 
                    value={orderOrDishIdFilter} 
                    onChange={(e) => setOrderOrDishIdFilter(e.target.value)} 
                    className="border p-2 rounded w-full"
                />
                <select 
                    value={orderStatusFilter} 
                    onChange={(e) => setOrderStatusFilter(e.target.value)} 
                    className="border p-2 rounded w-full"
                >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="canceled">Canceled</option>
                </select>
            </div>

            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="bg-gray-100 p-4 rounded-lg shadow-lg mb-4 flex items-center justify-between"
            >
                <div className="text-lg font-bold">
                    Total Consumers: {isFiltering ? filteredConsumers.length : consumers.length}
                </div>
                <div className="text-lg font-bold">
                    Total Orders: {totalOrders}
                </div>
            </motion.div>

            {consumersWithOrders.length === 0 && !isFiltering ? (
                <div className="text-center text-gray-500 mt-8">No consumers found.</div>
            ) : (
                consumersWithOrders.map((consumer) => (
                    <motion.div
                        key={consumer.consumerDetails._id}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white shadow-lg p-4 rounded-lg mt-4"
                    >
                        <motion.div
                            className="cursor-pointer"
                            onClick={() => toggleConsumerExpansion(consumer.consumerDetails._id)}
                            whileHover={{ scale: 1.02 }}
                        >
                            <h2 className="text-2xl font-bold">{consumer.consumerDetails.name}</h2>
                            <p className="text-gray-600">Email: {consumer.consumerDetails.email}</p>
                            <p className="text-gray-600">Phone: {consumer.consumerDetails.phoneNumber}</p>
                        </motion.div>

                        <AnimatePresence>
                            {expandedConsumerId === consumer.consumerDetails._id && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="mt-4 overflow-hidden"
                                >
                                    {consumer.orders.length > 0 ? (
                                        consumer.orders.map((order) => (
                                            <motion.div
                                                key={order.orderDetails._id}
                                                className={`p-4 mt-2 cursor-pointer rounded-lg ${getOrderColor(order.orderDetails.status)}`}
                                            >
                                                <h3 className="text-xl font-bold">Order ID: {order.orderDetails._id}</h3>
                                                <p className="text-gray-600">Order Date: {new Date(order.orderDetails.createdAt).toLocaleString()}</p>
                                                <p className="text-gray-600"> Status: {order.orderDetails.status}</p>
                                                <p className="text-gray-600">Payment Method: {order.orderDetails.paymentMethod}</p>
                                                <p className="text-gray-600">Dish Price: {order.orderDetails.dishPrice} RS.</p>
                                                <p className="text-gray-600">Delivery Price: {order.orderDetails.deliveryPrice} RS.</p>
                                                <p className="text-gray-600">GST Price: {order.orderDetails.gstPrice} RS.</p>
                                                <p className="text-gray-600">Total Price: {order.orderDetails.totalPrice} RS.</p>

                                                <AnimatePresence>
                                                    {Object.entries(order.orderDetails.dishInfo).map(([dishId, quantity]) => {
                                                        const uniqueDishId = `${consumer.consumerDetails._id}-${order.orderDetails._id}-${dishId}`;
                                                        return (
                                                            <motion.div
                                                                key={uniqueDishId}
                                                                className="mt-2 cursor-pointer"
                                                                onClick={() => toggleDishExpansion(consumer.consumerDetails._id, order.orderDetails._id, dishId)}
                                                            >
                                                                <h4 className="text-lg font-semibold">{dishInfoMap[dishId]?.dishName}</h4>
                                                                <p className="text-gray-600">Quantity: {quantity}</p>
                                                                <AnimatePresence>
                                                                    {expandedDish === uniqueDishId && (
                                                                        <motion.div
                                                                            initial={{ opacity: 0, height: 0 }}
                                                                            animate={{ opacity: 1, height: 'auto' }}
                                                                            exit={{ opacity: 0, height: 0 }}
                                                                            transition={{ duration: 0.3 }}
                                                                            className="p-4 mt-2 rounded-lg"
                                                                        >
                                                                            <p className="text-gray-600">Dish Id: {dishInfoMap[dishId]._id}</p>
                                                                            <p className="text-gray-600">Provider Id: {dishInfoMap[dishId].providerId}</p>
                                                                            <p className="text-gray-600">Address: {dishInfoMap[dishId].address}</p>
                                                                            <p className="text-gray-600">City: {dishInfoMap[dishId].cityName}</p>
                                                                            <p className="text-gray-600">Pincode: {dishInfoMap[dishId].pincode}</p>
                                                                            <p className="text-gray-600">Price: ₹{dishInfoMap[dishId].dishPrice}</p>
                                                                            <p className="text-gray-600">Order Till: {dishInfoMap[dishId].orderTill}</p>
                                                                            <p className="text-gray-600">Delivery Till: {dishInfoMap[dishId].deliveryTill}</p>
                                                                            <p className="text-gray-600">Repeatable: {dishInfoMap[dishId].isRepeat ? 'Yes' : 'No'}</p>
                                                                        </motion.div>
                                                                    )}
                                                                </AnimatePresence>
                                                            </motion.div>
                                                        );
                                                    })}
                                                </AnimatePresence>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="text-center text-gray-500">No orders found for this consumer.</div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))
            )}
        </div>
    );
};

export default AdminConsumer;
