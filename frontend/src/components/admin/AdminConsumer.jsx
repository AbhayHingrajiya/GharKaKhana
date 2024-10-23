import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { ClimbingBoxLoader } from "react-spinners";

const AdminConsumer = () => {
    
    const [expandedConsumerId, setExpandedConsumerId] = useState(null);
    const [expandedDishId, setExpandedDishId] = useState(null);
    const [consumersData, setConsumersData] = useState(null);
    const [cityNameFilter, setCityNameFilter] = useState('');
    const [pincodeFilter, setPincodeFilter] = useState('');
    const [consumerEmailFilter, setConsumerEmailFilter] = useState('');
    const [dishStatusFilter, setDishStatusFilter] = useState('');

    useEffect(() => {
        (async () => {
            try {
                const res = await axios.post('/api/getAdminConsumerInfo');
                setConsumersData(res.data);
                console.log(res.data);
            } catch (err) {
                console.error('Error in getAdminConsumerInfo at frontend side: ', err);
            }
        })();
    }, []);

    // Toggle Consumer expansion
    // const toggleConsumerExpansion = (ConsumerId) => {
    //     setExpandedConsumerId((prevId) => (prevId === ConsumerId ? null : ConsumerId));
    //     setExpandedDishId(null); // Collapse all dishes if a new Consumer is clicked
    // };

    // // Toggle dish expansion
    // const toggleDishExpansion = (dishId) => {
    //     setExpandedDishId((prevId) => (prevId === dishId ? null : dishId));
    // };

    // const getDishColor = (dish) => {
    //     if (dish.dishStatus.pendingQuantity > 0) return 'bg-yellow-200'; // Yellow for pending
    //     if (dish.dishStatus.availableQuantity > 0) return 'bg-green-200'; // Green for available
    //     if (dish.dishStatus.completeQuantity > 0) return 'bg-gray-200';    // Gray for completed
    //     return 'bg-red-200'; // Red for unavailable
    // };

    // // Filter logic for dishes
    // const filterDishes = (dishes) => {
    //     return dishes.filter((dish) => {
    //         const cityMatch = cityNameFilter === '' || dish.dishInfo.cityName.toLowerCase().includes(cityNameFilter.toLowerCase());
    //         const pincodeMatch = pincodeFilter === '' || dish.dishInfo.pincode.includes(pincodeFilter);
    //         const dishStatusMatch = dishStatusFilter === '' || 
    //             ((dishStatusFilter === 'available' && dish.dishStatus.availableQuantity > 0) ||
    //             (dishStatusFilter === 'pending' && dish.dishStatus.pendingQuantity > 0) ||
    //             (dishStatusFilter === 'completed' && dish.dishStatus.completeQuantity > 0) ||
    //             (dishStatusFilter === 'unavailable' && dish.dishStatus.availableQuantity === 0 && dish.dishStatus.pendingQuantity === 0));

    //         return cityMatch && pincodeMatch && dishStatusMatch;
    //     })
    //     .sort((a, b) => {
    //         // Sort by pending first, then available
    //         if (a.dishStatus.pendingQuantity > 0 && b.dishStatus.pendingQuantity === 0) return -1;
    //         if (a.dishStatus.pendingQuantity === 0 && b.dishStatus.pendingQuantity > 0) return 1;

    //         if (a.dishStatus.availableQuantity > 0 && b.dishStatus.availableQuantity === 0) return -1;
    //         if (a.dishStatus.availableQuantity === 0 && b.dishStatus.availableQuantity > 0) return 1;

    //         if (a.dishStatus.completeQuantity > 0 && b.dishStatus.completeQuantity === 0) return -1;
    //         if (a.dishStatus.completeQuantity === 0 && b.dishStatus.completeQuantity > 0) return 1;

    //         return 0; // If both have the same status, keep the same order
    //     });
    // };

    // // Filter logic for Consumers
    // const filteredConsumers = consumersData ? consumersData.map((Consumer) => {
    //     // Filter dishes based on the criteria
    //     const filteredDishes = filterDishes(Consumer.dishes);

    //     // Filter by Consumer email
    //     const emailMatch = consumerEmailFilter === '' || Consumer.ConsumerInfo.email.toLowerCase().includes(consumerEmailFilter.toLowerCase());

    //     // Return the Consumer with only the filtered dishes and if email matches
    //     return emailMatch ? { ...Consumer, dishes: filteredDishes } : null;
    // }).filter(Consumer => Consumer && Consumer.dishes.length > 0) : [];
    
    // const totalDishes = filteredConsumers.reduce((acc, Consumer) => acc + Consumer.dishes.length, 0);

    // if (!consumersData) {
    //     return (
    //         <div className="flex items-center justify-center h-screen overflow-hidden">
    //             <ClimbingBoxLoader color={'#123abc'} />
    //         </div>
    //     );
    // }

    return (
        <div className="flex-1 p-8">
        </div>
    );
};

export default AdminConsumer;
