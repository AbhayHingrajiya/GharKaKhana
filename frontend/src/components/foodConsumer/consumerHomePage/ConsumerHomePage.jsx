import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaStar } from 'react-icons/fa';
import Navbar from '../../foodProvider/providerNavbar/ProviderNavbar';
import ProviderDishCard from '../../foodProvider/providerOrderList/ProviderDishCard';
import axios from 'axios';

const ConsumerHomePage = () => {
  const [allDishes, setAllDishes] = useState(undefined);
  const [orderInfo, setOrderInfo] = useState([]); // For storing ordered dish info

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          getAddressFromCoordinates(latitude, longitude);
        },
        (err) => {
          console.log('Error getting location: ' + err);
        }
      );
    } else {
      console.log('Geolocation is not supported by this browser.');
    }
  }, []);

  const getAddressFromCoordinates = (lat, lon) => {
    axios
      .get(`https://nominatim.openstreetmap.org/reverse`, {
        params: {
          lat,
          lon,
          format: 'json',
        },
      })
      .then((response) => {
        if (response.data && response.data.display_name) {
          let cityName = response.data.address.city || response.data.address.town || response.data.address.village || '';
          let postcode = response.data.address.postcode || '';

          (async () => {
            try {
              const res = await axios.post('/api/consumerGetDishInfo', { cityName, postcode });
              console.log(res);
              if (res.data) {
                setAllDishes(res.data);
                console.log(res.data);
              } else {
                console.log("don't get a response data at consumerGetDishInfo");
              }
            } catch (err) {
              console.error("Error in consumerGetDishInfo at frontend side: " + err);
            }
          })();
        } else {
          console.log('No location found');
        }
      })
      .catch((error) => {
        console.log('Error fetching address: ' + error);
      });
  };

  const addToOrder = (dish, count) => {
    console.log(count)
    setOrderInfo((prev) => {
      const existingDish = prev.find((item) => item.dish._id === dish._id);
      if (existingDish) {
        return prev.map((item) =>
          item.dish._id === dish._id ? { ...item, quantity: item.quantity + count } : item
        );
      }
      return [...prev, { dish, quantity: count }];
    });
    console.log(orderInfo)
  };

  const increaseQuantity = (dishId) => {
    setOrderInfo((prev) =>
      prev.map((item) =>
        item.dish._id === dishId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQuantity = (dishId) => {
    setOrderInfo((prev) => 
      prev
        .map((item) =>
          item.dish._id === dishId
            ? { ...item, quantity: Math.max(item.quantity - 1, 0) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };  

  const placeOrder = () => {
    console.log('place Order click')
  }

  return (
    <div className="relative">
      <Navbar />

      <div className="space-y-16">
        <section className="relative h-[400px] bg-cover bg-center" style={{ backgroundImage: "url('https://via.placeholder.com/1600x400')" }}>
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2 }}
              className="text-center text-white"
            >
              <h1 className="text-5xl font-bold">Homemade Goodness</h1>
              <p className="mt-4 text-lg">Order your favorite meals, prepared with love</p>
              <motion.button className="mt-6 bg-green-500 text-white px-6 py-3 rounded-full hover:bg-green-600 transition duration-300" whileHover={{ scale: 1.1 }}>
                Explore Menu
              </motion.button>
            </motion.div>
          </div>
        </section>
      </div>

      {/* Search Bar */}
      <div className="mt-8 mb-12 flex justify-center">
        <div className="flex items-center border border-gray-300 rounded-full overflow-hidden shadow-md w-full md:w-2/3 lg:w-1/2">
          <input type="text" placeholder="Search for dishes or chefs..." className="w-full px-4 py-2 focus:outline-none" />
          <button className="bg-green-500 text-white px-6 py-3">
            <FaSearch />
          </button>
        </div>
      </div>

      <div className="space-y-8 w-full p-4">
        <motion.div
          className="flex justify-around w-full p-4 bg-gray-50 rounded-md shadow"
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div className="cursor-pointer hover:bg-green-100 p-2 rounded transition duration-300" whileHover={{ scale: 1.05 }}>
            New Arrivals
          </motion.div>
          <motion.div className="cursor-pointer hover:bg-green-100 p-2 rounded transition duration-300" whileHover={{ scale: 1.05 }}>
            Popular Dishes
          </motion.div>
          <select className="p-2 border rounded w-1/4">
            <option>Price Range</option>
          </select>
          <select className="p-2 border rounded w-1/4">
            <option>Time Range</option>
          </select>
        </motion.div>
      </div>

      <div className="flex flex-wrap gap-4">
        {allDishes && (
          allDishes.map(({ dishInfo, itemInfo, availableQuantity }, index) => (
            <ProviderDishCard
              key={index}
              dish={dishInfo}
              item={itemInfo}
              Quantity={availableQuantity}
              theme={true}
              userType={'consumer'}
              addToOrder={addToOrder}
            />
          ))
        )}
      </div>

      {/* Order Info Div */}
      {orderInfo.length > 0 && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 bg-white rounded-t-lg shadow-lg p-4 max-h-[300px] overflow-y-auto"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-lg font-semibold">Order Info</h2>
          <div className="flex flex-col space-y-2">
            {orderInfo.map(({ dish, quantity }) => (
              <div key={dish._id} className="flex justify-between items-center p-2 border-b">
                <span>{dish.dishName}</span>
                <span>{dish.dishPrice * quantity} RS</span>
                <div className="flex items-center">
                  <button onClick={() => decreaseQuantity(dish._id)} className="bg-gray-200 px-2 py-1 rounded">-</button>
                  <span className="mx-2">{quantity}</span>
                  <button onClick={() => increaseQuantity(dish._id)} className="bg-gray-200 px-2 py-1 rounded">+</button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center mt-4">
            <span className="font-semibold">
              Total: {orderInfo.reduce((total, { dish, quantity }) => total + dish.dishPrice * quantity, 0)} RS
            </span>
            <button
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all duration-200"
              onClick={() => placeOrder()} // Assuming you have a placeOrder function defined
            >
              Place Order
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ConsumerHomePage;