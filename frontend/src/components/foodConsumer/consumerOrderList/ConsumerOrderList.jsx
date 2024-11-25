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
                            const { _id, consumerId, paymentMethod, consumerAddress, status, dishPrice, gstPrice, deliveryPrice, totalPrice, createdAt, dishInfo, deliveryDate, cancelDishes } = order;

                            const dishDetails = Object.entries(dishInfo).map(([dishId, quantity]) => ({
                                dishId,
                                quantity
                            }));

                            const now = new Date();
                            const dateString = new Date(deliveryDate).toLocaleString();
                            const localDate = new Date(dateString);
                            let flagForCancleOrder = false;
                            let cancleDishIds = [];
                            if(localDate < now && status != 'confirmed'){
                                ( async () => {
                                    try {
                                        const res = await axios.post('/api/cancelOrderConsumer', { orderId: _id, dishDetails });
                                        
                                        if (res.status >= 200 && res.status < 300 && res.data.orderStatus) {
                                            console.log('Order cancelled successfully:', res.data);
                                            flagForCancleOrder = true;
                                            alert('One Order is Cancled')
                                        }if (res.status >= 200 && res.status < 300 && !res.data.orderStatus) {
                                            console.log('Order confirm successfully:', res.data);
                                            cancleDishIds.push([...res.data.cancleDishIds])
                                            alert('Some Dishes are Cancled')
                                        }else {
                                            console.error('Error in cancelOrderConsumer get res:', res.status, res.data);
                                        }
                                    } catch (error) {
                                        console.error('Error in cancelOrderConsumer at frontend side:', error);
                                    }                                    
                                })();
                                if(flagForCancleOrder){
                                    return(
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
                                                        theme={ !dishTheme }
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
                                        {deliveryDate && <p><span className="font-semibold">Delivery Date:</span> {new Date(deliveryDate).toLocaleString()}</p>}
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
