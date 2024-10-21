import React, { useEffect, useState } from 'react';
import DishCard from '../../dishCard/DishCard';
import ExpandableDiv from '../../expandableDiv/ExpandableDiv';
import Navbar from '../../navbar/Navbar';
import axios from 'axios';
import { motion } from 'framer-motion';

const ConsumerOrderList = () => {
    const [pendingOrders, setPendingOrders] = useState([]);
    const [dishesInfo, setDishesInfo] = useState(new Map()); // Initialize as a Map

    useEffect(() => {
        (async () => {
            try {
                const res = await axios.post('/api/getPendingOrdersConsumer');
                if (res.status === 200) {
                    console.log(res.data);
                    setPendingOrders(res.data.orders);
                    setDishesInfo(new Map(Object.entries(res.data.updatedDishInfo))); // Convert object to Map
                } else {
                    console.error('Error in get res in getPendingOrdersConsumer method');
                }
            } catch (err) {
                console.error('Error in getPendingOrdersConsumer: ' + err);
            }
        })();
    }, []);

    return (
        <div>
            <Navbar activeLink="order" />

            <div className="p-4 mt-20 space-y-4">
                <ExpandableDiv title="Pending Orders" defaultExpand={true} theme={true}>
                    <div>
                        {pendingOrders.map(order => {
                            const { _id, consumerId, paymentMethod, consumerAddress, status, dishPrice, gstPrice, deliveryPrice, totalPrice, createdAt, dishInfo } = order;

                            const dishDetails = Object.entries(dishInfo).map(([dishId, quantity]) => ({
                                dishId,
                                quantity
                            }));

                            return (
                                <div key={_id} className="border p-4 mb-4">
                                    <ExpandableDiv key={_id} title={`Order Details`} defaultExpand={true} theme={true}>
                                        <div className="flex flex-wrap gap-4">
                                            {dishDetails.map(({ dishId, quantity }) => {
                                                const dishDetail = dishesInfo.get(dishId);
                                                return (
                                                    <DishCard
                                                        dish={dishDetail?.dishDetails} // Use optional chaining to avoid errors
                                                        item={dishDetail?.itemDetails} // Use optional chaining to avoid errors
                                                        Quantity={quantity}
                                                        theme={true}
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
                                        <p><span className="font-semibold">Status:</span> {status}</p>
                                        <p><span className="font-semibold">Total Price:</span> {totalPrice} RS.</p>
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
