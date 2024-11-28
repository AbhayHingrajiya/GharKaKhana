import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../navbar/Navbar';
import axios from 'axios';
import io from 'socket.io-client';

const DeliveryBoyHomePage = () => {
  const [deliveryRequests, setDeliveryRequests] = useState([]);
  const [processedOrders, setProcessedOrders] = useState([]);
  const [deliveryBoyId, setDeliveryBoyId] = useState(undefined);

  // Timer for countdown
  useEffect(() => {
    const initializeSocket = async () => {
      try {

        const socket = io('http://localhost:4000', {
          transports: ['websocket', 'polling'], // Force WebSocket
        });

        socket.on('connect', () => {
          console.log('Connected to Socket.IO server with ID:', socket.id);
        });
        
        socket.emit('deniedOrderByDeliveryBoy', deliveryBoyId);

        // Fetch the delivery boy ID from the API
        const response = await axios.post('/api/activeDeliveryBoy');
        setDeliveryBoyId(response.data.deliveryBoyId);
        const deliveryBoy = response.data.deliveryBoyId
        console.log(response.data.orders)
        console.log(Array.isArray(response.data.orders));
        setProcessedOrders(prevOrders => [...(prevOrders || []), ...response.data.orders]);

        // Emit to join the delivery boy room
        if(deliveryBoy) socket.emit('joinDeliveryBoyRoom', deliveryBoy);

        socket.on('sendDeliveryRequest', (orderDetails) => {
          setDeliveryRequests(prevRequests => [...prevRequests, orderDetails]);
          // setDeliveryRequests(prevRequests => [...prevRequests, {
          //     orderId: '1',
          //     consumer: {
          //       name: 'John Doe',
          //       phone: '111-222-3333',
          //       address: '789 Maple Street, Apartment 12B',
          //     },
          //     dishes: [
          //       {
          //         dishId: '101',
          //         name: 'Pasta',
          //         provider: { name: 'Provider A', phone: '123-456-7890', address: '123 Main St' },
          //         otp: '1234',
          //       },
          //       {
          //         dishId: '102',
          //         name: 'Pizza',
          //         provider: { name: 'Provider A', phone: '123-456-7890', address: '123 Main St' },
          //         otp: '5678',
          //       },
          //       {
          //         dishId: '103',
          //         name: 'Burger',
          //         provider: { name: 'Provider B', phone: '987-654-3210', address: '456 Elm St' },
          //         otp: '9101',
          //       },
          //     ],
          //     timeRemaining: 180,
          //   }])
        })

        // Listen for beforeunload event to clean up the socket connection
        window.addEventListener('beforeunload', () => {
          try {
            // Notify the server that the delivery boy is leaving the room
            socket.emit('leaveDeliveryBoyRoom', deliveryBoy);

            // Disconnect the socket manually
            socket.disconnect();
          } catch (error) {
            console.error('Error during socket cleanup:', error);
          }
        });
      } catch (error) {
        console.error('Error initializing socket or fetching user ID:', error);
      }

      // Timer for countdown
      const timer = setInterval(() => {
        setDeliveryRequests((prevRequests) =>
          prevRequests
            .map((order) => ({
              ...order,
              timeRemaining: Math.max(order.timeRemaining - 1, 0),
            }))
            .filter((order) => order.timeRemaining > 0)
        );
      }, 1000);

      // Cleanup the timer on component unmount
      return () => {
        clearInterval(timer);
        if (socket) {
          socket.disconnect();
        }
      };
    };

    // Call the initialization function
    initializeSocket();

  }, []);

  const handleAcceptOrder = async (orderId) => {
    const order = deliveryRequests.find((o) => o.orderId === orderId);
    if (!order) return;
  
    try {
      // Make the API request to accept the order
      const res = await axios.post('/api/acceptedOrderByDeliveryBoy', { orderId });
  
      if (res.status === 200) {
        await axios.post('/api/denyOrderByDeliveryBoy', { orderId, acceptOrder: true });
  
        // Add the accepted order to the processed list
        setProcessedOrders((prev) => [...prev, { ...order, status: 'accepted' }]);
  
        // Remove the accepted order from deliveryRequests
        setDeliveryRequests((prevRequests) =>
          prevRequests.filter((order) => order.orderId !== orderId)
        );
      } else {
        console.error('Failed to accept the order: ', res.data.message);
      }
    } catch (error) {
      console.error('Error accepting the order:', error.message);
    }
  };
  

  const handleDenyOrder = async (orderId) => {
    const order = deliveryRequests.find((o) => o.orderId === orderId);
    if (!order) return;

    await axios.post('/api/denyOrderByDeliveryBoy', { orderId, acceptOrder: false });

    // Add the denied order to the processed list
    setProcessedOrders((prev) => [...prev, { ...order, status: 'denied' }]);

    // Remove the denied order from deliveryRequests
    setDeliveryRequests((prevRequests) =>
      prevRequests.filter((order) => order.orderId !== orderId)
    );
  };

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
      <Navbar />
      <div className="bg-gray-100 p-6 min-h-screen pt-24">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Delivery Requests</h1>
        <div className="space-y-6">
        {deliveryRequests.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg font-semibold">
              🚚 No delivery requests at the moment. Please check back later!
            </p>
          </div>
        ) : (
          deliveryRequests.map((order) => {
            const groupedDishes = groupDishesByProvider(order.dishes);
            return (
              <motion.div
                key={order.orderId}
                className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow duration-200"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-800">Order ID: {order.orderId}</h2>
                  <p className="text-red-500 font-bold">Time Left: {order.timeRemaining}s</p>
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
                {/* Dishes */}
                <div className="mt-4 space-y-6">
                  {Object.values(groupedDishes).map(({ provider, dishes }) => (
                    <div key={`${provider.name}-${provider.phone}`} className="space-y-4">
                      <div className="bg-blue-100 p-4 rounded-md">
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
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-6">
                  <button
                    onClick={() => handleAcceptOrder(order.orderId)}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                  >
                    Accept Order
                  </button>
                  <button
                    onClick={() => handleDenyOrder(order.orderId)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                  >
                    Deny Order
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
        </div>

        {/* Processed Orders */}
        <div className="mt-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Accepted Orders</h2>
          <div className="space-y-6">
            {processedOrders
              .map((order) => {
                const groupedDishes = groupDishesByProvider(order.dishes);
                return (
                  <motion.div
                    key={order.orderId}
                    className="bg-gradient-to-r from-green-100 to-green-300 border-l-4 border-green-600 shadow-lg rounded-lg p-6"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold text-green-700">
                        Order ID: {order.orderId}
                      </h2>
                      <span className="px-4 py-1 bg-green-600 text-white rounded-full text-sm">
                        Accepted
                      </span>
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
      </div>
    </>
  );
};

export default DeliveryBoyHomePage;
