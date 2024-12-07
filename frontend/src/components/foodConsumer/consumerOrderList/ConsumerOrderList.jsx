import React, { useEffect, useState } from 'react';
import DishCard from '../../dishCard/DishCard';
import ExpandableDiv from '../../expandableDiv/ExpandableDiv';
import Navbar from '../../navbar/Navbar';
import axios from 'axios';
import { motion } from 'framer-motion';

const ConsumerOrderList = () => {
    const [pendingOrders, setPendingOrders] = useState([]);
    const [completedOrders, setCompletedOrders] = useState([]);
    const [dishesInfo, setDishesInfo] = useState(new Map()); // Initialize as a Map
    const [completeDishesInfo, setCompleteDishesInfo] = useState(new Map()); // Initialize as a Map

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                // Fetch pending orders
                const pendingOrdersResponse = await axios.post('/api/getPendingOrdersConsumer');
                if (pendingOrdersResponse.status === 200) {
                    console.log('Pending Orders:', pendingOrdersResponse.data);
                    setPendingOrders(pendingOrdersResponse.data.orders);
                    setDishesInfo(new Map(Object.entries(pendingOrdersResponse.data.updatedDishInfo))); // Convert object to Map
                } else {
                    console.error('Error fetching pending orders.');
                }

                // Fetch completed orders
                const completedOrdersResponse = await axios.post('/api/getCompleteOrdersConsumer');
                if (completedOrdersResponse.status === 200) {
                    console.log('Completed Orders:', completedOrdersResponse.data);
                    setCompletedOrders(completedOrdersResponse.data.orders);
                    setCompleteDishesInfo(new Map(Object.entries(completedOrdersResponse.data.updatedDishInfo)));
                } else {
                    console.error('Error fetching completed orders.');
                }
            } catch (err) {
                console.error('Error fetching orders:', err);
            }
        };

        fetchOrders();
    }, []);


    return (
        <div>
            <Navbar activeLink="order" />

            <div className="p-4 mt-20 space-y-4">
                <ExpandableDiv title="Pending Orders" defaultExpand={true} theme={true}>
                    <div>
                        {pendingOrders.map(order => {
                            const { _id, consumerId, paymentMethod, consumerAddress, status, dishPrice, gstPrice, deliveryPrice, totalPrice, createdAt, dishInfo, expectedDeliveryDate, cancelDishes } = order;

                            const dishDetails = Object.entries(dishInfo).map(([dishId, quantity]) => ({
                                dishId,
                                quantity
                            }));

                            const now = new Date();
                            const dateString = new Date(expectedDeliveryDate).toLocaleString();
                            const localDate = new Date(dateString);
                            let flagForCancleOrder = false;
                            let cancleDishIds = [];
                            if (localDate < now && status == 'pending') {
                                (async () => {
                                    try {
                                        const res = await axios.post('/api/cancelOrderConsumer', { orderId: _id, dishDetails });

                                        if (res.status >= 200 && res.status < 300 && res.data.orderStatus) {
                                            console.log('Order cancelled successfully:', res.data);
                                            flagForCancleOrder = true;
                                            alert('One Order is Cancled')
                                        } if (res.status >= 200 && res.status < 300 && !res.data.orderStatus) {
                                            console.log('Order confirm successfully:', res.data);
                                            cancleDishIds.push([...res.data.cancleDishIds])
                                            alert('Some Dishes are Cancled')
                                        } else {
                                            console.error('Error in cancelOrderConsumer get res:', res.status, res.data);
                                        }
                                    } catch (error) {
                                        console.error('Error in cancelOrderConsumer at frontend side:', error);
                                    }
                                })();
                                if (flagForCancleOrder) {
                                    return (
                                        <></>
                                    );
                                }
                            }

                            return (
                                <div key={_id} className="border p-4 mb-4">
                                    <ExpandableDiv key={_id} title={`Order Details`} defaultExpand={true} theme={true}>
                                        <div className="flex flex-wrap gap-4">
                                            {dishDetails.map(({ dishId, quantity }) => {
                                                const dishDetail = dishesInfo.get(dishId);
                                                const dishTheme = cancelDishes.includes(dishId)

                                                return (
                                                    <DishCard
                                                        dish={dishDetail?.dishDetails} // Use optional chaining to avoid errors
                                                        item={dishDetail?.itemDetails} // Use optional chaining to avoid errors
                                                        Quantity={quantity}
                                                        theme={!dishTheme}
                                                        userType='consumerOrder'
                                                    />
                                                );
                                            })}
                                        </div>
                                    </ExpandableDiv>
                                    <motion.div
                                        className="bg-blue-100 border border-blue-300 rounded-lg p-4 mb-4 shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                    >
                                        <h4 className="font-bold">Order Details</h4>
                                        <p><span className="font-semibold">Order Id:</span> {_id}</p>
                                        {expectedDeliveryDate && <p><span className="font-semibold">Delivery Date:</span> {new Date(expectedDeliveryDate).toLocaleString()}</p>}
                                        <p><span className="font-semibold">Status:</span> {status}</p>
                                        <p><span className="font-semibold">Total Price:</span> {totalPrice} RS.</p>
                                        <p>
                                            <span className="font-semibold">Payment Method:</span>
                                            {paymentMethod === 'cod'
                                                ? 'Cash On Delivery'
                                                : paymentMethod === 'online'
                                                    ? 'Online'
                                                    : 'Unknown'}
                                        </p>
                                        <p><span className="font-semibold">Address:</span> {consumerAddress}</p>
                                        <p><span className="font-semibold">Orderd Date:</span> {new Date(createdAt).toLocaleString()}</p>
                                    </motion.div>
                                </div>
                            );
                        })}
                    </div>
                </ExpandableDiv>
            </div>

            <div className="p-4 space-y-4">
                <ExpandableDiv title="Complete Orders" defaultExpand={false} theme={true}>
                    <div>
                        {completedOrders.map(order => {
                            const { _id, consumerId, paymentMethod, consumerAddress, status, dishPrice, gstPrice, deliveryPrice, totalPrice, createdAt, dishInfo, expectedDeliveryDate, cancelDishes } = order;

                            const dishDetails = Object.entries(dishInfo).map(([dishId, quantity]) => ({
                                dishId,
                                quantity
                            }));

                            return (
                                <div key={_id} className="border p-4 mb-4">
                                    <ExpandableDiv key={_id} title={`Order Details`} defaultExpand={true} theme={true}>
                                        <div className="flex flex-wrap gap-4">
                                            {dishDetails.map(({ dishId, quantity }) => {
                                                const dishDetail = completeDishesInfo.get(dishId);
                                                const dishTheme = cancelDishes.includes(dishId)

                                                return (
                                                    <DishCard
                                                        dish={dishDetail?.dishDetails} // Use optional chaining to avoid errors
                                                        item={dishDetail?.itemDetails} // Use optional chaining to avoid errors
                                                        Quantity={quantity}
                                                        theme={!dishTheme}
                                                        userType='consumerOrder'
                                                    />
                                                );
                                            })}
                                        </div>
                                    </ExpandableDiv>
                                    <motion.div
                                        className="bg-blue-100 border border-blue-300 rounded-lg p-4 mb-4 shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                    >
                                        <h4 className="font-bold">Order Details</h4>
                                        <p><span className="font-semibold">Order Id:</span> {_id}</p>
                                        {expectedDeliveryDate && <p><span className="font-semibold">Delivery Date:</span> {new Date(expectedDeliveryDate).toLocaleString()}</p>}
                                        <p><span className="font-semibold">Status:</span> {status}</p>
                                        <p><span className="font-semibold">Total Price:</span> {totalPrice} RS.</p>
                                        <p>
                                            <span className="font-semibold">Payment Method:</span>
                                            {paymentMethod === 'cod'
                                                ? 'Cash On Delivery'
                                                : paymentMethod === 'online'
                                                    ? 'Online'
                                                    : 'Unknown'}
                                        </p>
                                        <p><span className="font-semibold">Address:</span> {consumerAddress}</p>
                                        <p><span className="font-semibold">Orderd Date:</span> {new Date(createdAt).toLocaleString()}</p>
                                    </motion.div>
                                </div>
                            );
                        })}
                    </div>
                </ExpandableDiv>
            </div>
        </div>
    );
};

export default ConsumerOrderList;
