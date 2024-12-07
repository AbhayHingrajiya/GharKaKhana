import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaStar } from 'react-icons/fa';
import Navbar from '../../navbar/Navbar';
import DishCard from '../../dishCard/DishCard';
import axios from 'axios';
import ConsumerConfirmOrderPage from '../consumerConfirmOrderPage/ConsumerConfirmOrderPage'
import consumerHeroSectionImage from '../../../assets/consumerHeroSectionImage.jpg'

const ConsumerHomePage = () => {
  const [allDishes, setAllDishes] = useState([]);
  const [orderInfo, setOrderInfo] = useState([]);
  const [moveToConsumerConfirmOrderPage, setMoveToConsumerConfirmOrderPage ] = useState(false);
  const [finalDeliveryTime, setFinalDeliveryTime] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredDishes, setFilteredDishes] = useState(allDishes);

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

  useEffect(() => {
    setFilteredDishes(
      allDishes.filter(({ dishInfo }) => 
        dishInfo.dishName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, allDishes])

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
              if (res.data) {
                validateDishes(res.data);
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

  const validateDishes = async (availableDishes) => {
    // Validate available dishes
    const validAvailableDishesArray = await Promise.all(
      availableDishes.map(async ({ dishInfo, itemInfo, availableQuantity }) => {
        const isValid = await isValidDish(dishInfo); // Check if the dish is valid
        return isValid ? { dishInfo, itemInfo, availableQuantity } : null;
      })
    );

    setAllDishes(validAvailableDishesArray.filter(dish => dish !== null));
  };

  const isValidDish = async (dishInfo) => {
    if (dishInfo.repeat.length > 0 || dishInfo.orderTill !== 'any' || dishInfo.deliveryTill !== 'any') {
      return true;
    }
    const currentFullDate = new Date();
    const dishFullDate = new Date(dishInfo.date);
  
    if (
      currentFullDate.getDate() === dishFullDate.getDate() &&
      currentFullDate.getMonth() === dishFullDate.getMonth() &&
      currentFullDate.getFullYear() === dishFullDate.getFullYear()
    ) {
      return true;
    } else {
      try {
        const res = await axios.post('/api/cancelOrderProvider', { dishId: dishInfo._id });
        console.log(res.data);
      } catch (err) {
        console.error('Error in expireDish: ' + err);
      }
      return false;
    }
  };

  const addToOrder = (dish, count, timeLeftDelivery) => {
    setOrderInfo((prev) => {
      const existingDish = prev.find((item) => item.dish._id === dish._id);
      if (existingDish) {
        return prev.map((item) =>
          item.dish._id === dish._id ? { ...item, quantity: item.quantity + count } : item
        );
      }
      return [...prev, { dish, quantity: count }];
    });
    if(timeLeftDelivery){
      const date = new Date()
      const [hours, minutes, seconds] = timeLeftDelivery.split(':').map(Number);

      date.setHours(date.getHours() + hours);
      date.setMinutes(date.getMinutes() + minutes);
      date.setSeconds(date.getSeconds() + seconds);

      setFinalDeliveryTime(prevState => ({
        ...prevState,
        [dish._id]: date
      }));
    }
  };

  const increaseQuantity = (dishId) => {
    const foundDish = allDishes.find(dish => dish.dishInfo._id === dishId);
    const availableQuantity = foundDish ? foundDish.availableQuantity : null;

    setOrderInfo((prev) =>
      prev.map((item) =>
        item.dish._id === dishId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQuantity = (dishId) => {
    setOrderInfo((prev) => {
      let updatedOrderInfo = prev.map((item) =>
        item.dish._id === dishId
          ? { ...item, quantity: Math.max(item.quantity - 1, 0) }
          : item
      );
  
      const itemWithZeroQuantity = updatedOrderInfo.find(
        (item) => item.dish._id === dishId && item.quantity === 0
      );
  
      // If the item quantity is 0, remove it from the order and from finalDeliveryTime
      if (itemWithZeroQuantity) {
        updatedOrderInfo = updatedOrderInfo.filter((item) => item.quantity > 0);
        
        // Remove dishId from finalDeliveryTime
        setFinalDeliveryTime((prevFinalTime) => {
          const { [dishId]: _, ...rest } = prevFinalTime;
          return rest;
        });
      }
  
      return updatedOrderInfo;
    });
    console.log(finalDeliveryTime)
  };
   

  const moveToConsumerConfirmOrderPageChange = () => {
    // Loop through each dish in orderDish
    orderInfo.forEach(order => {
      // Find the corresponding dish info in allDish
      const foundDish = allDishes.find(dish => dish.dishInfo._id === order.dish._id);
      
      // If found, add itemInfo to the order
      if (foundDish) {
          order.itemInfo = foundDish.itemInfo;
      }
    });

    console.log(orderInfo);
    setMoveToConsumerConfirmOrderPage(!moveToConsumerConfirmOrderPage)
  }

  if(moveToConsumerConfirmOrderPage){
    return (
      <ConsumerConfirmOrderPage orderInfo={orderInfo} deliveryDates={finalDeliveryTime} moveToConsumerConfirmOrderPageChangeFun={moveToConsumerConfirmOrderPageChange} />
    )
  }

  return (
    <div className={`relative ${orderInfo.length > 0 ? 'pb-[250px]' : ''}`}>
      <Navbar activeLink="home" />

      <div className="space-y-16">
        <section className="relative h-[400px] bg-cover bg-center" style={{ backgroundImage: `url(${consumerHeroSectionImage})` }}>
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
          <input type="text" placeholder="Search for dishes" className="w-full px-4 py-2 focus:outline-none" onChange={(e) => setSearchQuery(e.target.value)} />
          <button className="bg-green-500 text-white px-6 py-3">
            <FaSearch />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        {filteredDishes && (
          filteredDishes.map(({ dishInfo, itemInfo, availableQuantity }, index) => (
            <DishCard
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
          className="fixed bottom-0 left-0 right-0 bg-white rounded-t-lg shadow-lg p-4 max-h-[200px] overflow-y-auto"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-lg font-semibold">Order Info</h2>
          <div className="flex flex-col space-y-2">
          {orderInfo.map(({ dish, quantity }) => (
            <div key={dish._id} className="flex justify-between items-center p-2 border-b">
              <span className="w-1/3">{dish.dishName}</span>
              <span className="w-1/3 text-center">{dish.dishPrice * quantity} RS</span>
              <div className="flex items-center w-1/3 justify-end">
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
              onClick={() => moveToConsumerConfirmOrderPageChange()}
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