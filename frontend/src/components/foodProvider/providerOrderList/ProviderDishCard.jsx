import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaEllipsisV } from 'react-icons/fa';
import {useNavigate, useLocation} from 'react-router-dom';
import axios from 'axios';

const ProviderDishCard = ({ dish, item, Quantity, theme, addCardToCancelDiv }) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCancel, setIsCancel] = useState(false);
  const [expireDateDelivery, setExpireDateDelivery] = ( dish.deliveryTill == 'any' || !theme) ? useState (false) :
   useState(
    calculateExpireDate(dish.date, dish.deliveryTill)
   );
  const [timeLeftDelivery, setTimeLeftDelivery] = ( expireDateDelivery && theme ) ? useState(getFormattedTimeLeft(expireDateDelivery, dish.deliveryTill)) : useState (false);
  
  const [expireDateOrder, setExpireDateOrder] = ( dish.orderTill == 'any' || !theme)? useState (false) :
   useState(
    calculateExpireDate(dish.date, dish.orderTill)
   );
  const [timeLeftOrder, setTimeLeftOrder] = ( expireDateOrder && theme ) ? useState(getFormattedTimeLeft(expireDateOrder, dish.orderTill)) : useState (false);
  
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if(timeLeftDelivery){
      const timer = setInterval(() => {
        setTimeLeftDelivery(getFormattedTimeLeft(expireDateDelivery, dish.deliveryTill));
        if(!timeLeftDelivery){
          console.log('delivery time expire')
          clearInterval(timer);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [expireDateDelivery]);

  useEffect(() => {
    if(timeLeftOrder){
      const timer = setInterval(() => {
        setTimeLeftOrder(getFormattedTimeLeft(expireDateOrder, dish.orderTill));
        if(!timeLeftOrder){
          console.log('Order time expire')
          clearInterval(timer);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [expireDateOrder]);

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleMenuToggle = () => {
    setShowMenu(!showMenu);
  };

  function getFormattedTimeLeft(targetDate, expireTime) {
    const now = new Date();
    if(expireTime == 'any') return false;
    if(targetDate < now || !targetDate){
      if(dish.repeat.length>0){
        const [hours, minutes] = expireTime.split(':').map(Number);
        targetDate = checkForRepeat(hours, minutes);
      }else{
        return false;
      }
    }
    const timeLeft = targetDate - now;

    const hours = Math.floor((timeLeft / (1000 * 60 * 60)));
    const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
    const seconds = Math.floor((timeLeft / 1000) % 60);

    return `${hours}:${minutes}:${seconds}`;
  }

  function checkForRepeat (hours, minutes) {
    let now = new Date();
    const dayOfWeek = now.getDay();
    const days = [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    if(dish.repeat.includes(days[dayOfWeek])){
      const nextTime = new Date(now.setHours(hours, minutes, 0, 0));
      now = new Date();
      if(now <= nextTime){
        return nextTime
      }
    }
    let i = (dayOfWeek != 6) ? dayOfWeek + 1 : 0;
    while(i != dayOfWeek){
      if(dish.repeat.includes(days[i])){
        const daysUntilNextDay = (i + 7 - dayOfWeek) % 7 || 7;
        const nextDay = new Date(now);
        nextDay.setDate(now.getDate() + daysUntilNextDay);
        nextDay.setHours(hours, minutes, 0, 0);
        return nextDay;
      }
      i++;
      if(i>=7) i=0;
    }
    const nextWeek = new Date(now);
    nextWeek.setDate(now.getDate() + 7);
    nextWeek.setHours(hours, minutes, 0, 0);
    return nextWeek;
  }

  function calculateExpireDate(addedDate, expiryTime) {
    const addedDateTime = new Date(addedDate);
    const [hours, minutes] = expiryTime.split(':').map(Number);
  
    addedDateTime.setHours(hours, minutes, 0, 0);
  
    const currentTime = new Date();
  
    if (addedDateTime < currentTime) {
      if(new Date(addedDate) < addedDateTime) {
        if(dish.repeat.length>0) return checkForRepeat(hours, minutes);
        const deleteCardFromDatabase = async () => {
          const res = await axios.post('/api/cancelOrderProvider', { dishId: dish._id });
          console.log(res.data);
        }
        deleteCardFromDatabase();
        return false;
      }
      addedDateTime.setDate(addedDateTime.getDate() + 1);
    }
  
    return addedDateTime;
  }

  const cancelOrderPress = async () => {
    try{
      const res = await axios.post('/api/cancelOrderProvider', {dishId: dish._id});
      alert('Order Cancel')
      addCardToCancelDiv({ dishInfo: dish, itemInfo: item, cancelQuantity: Quantity })
      setIsCancel(true);
    }catch(err){
      console.error('Error in cancleOrderPress function: '+err)
    }
  }

  const editOrderPress = () => {
    navigate('/providerHomePage', { state: { dishInfo: dish, itemInfo: item } })
  }
  
  if(isCancel){
    return(<></>)
  }

  return (
    <motion.div
  className={`relative max-w-lg mx-auto rounded-lg shadow-lg overflow-hidden transition-transform duration-300 ${theme ? 'bg-green-100' : 'bg-red-100'}`}
  whileHover={{
    scale: 1.03,
    boxShadow: `0 10px 20px rgba(${theme ? '0, 128, 0' : '255, 0, 0'}, 0.3)`,
    backgroundColor: `${theme ? '#e6f7e9' : '#fce4e4'}`,
  }}
  initial={{ opacity: 0, y: 50 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ type: 'spring', stiffness: 100 }}
>
  <div className="relative">
    <button
      onClick={handleMenuToggle}
      className={`absolute top-1 right-1 p-2 rounded-full focus:outline-none z-10 ${theme ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}
    >
      <FaEllipsisV />
    </button>

    {showMenu && (
      <motion.div
        className={`absolute top-10 right-2 border rounded-lg shadow-lg w-48 z-20 ${theme ? 'bg-white border-green-300' : 'bg-white border-red-300'}`}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {theme && (<button
          className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
          onClick={() => cancelOrderPress()}
        >
          Cancel Order
        </button>)}
        <button
          className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
          onClick={() => editOrderPress()}
        >
          Edit Order
        </button>
      </motion.div>
    )}
  </div>

  <div className="relative flex flex-col lg:flex-row">
    <motion.div className="relative lg:w-1/2">
      <motion.img
        className="h-48 w-full object-cover"
        src='src/assets/fullLogo.jpeg'
        alt={dish.dishName}
        initial={{ scale: 1 }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
      />
      <div className={`absolute top-2 left-2 px-3 py-1 rounded-lg text-sm ${theme ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
        Delivery Till: {timeLeftDelivery ? timeLeftDelivery : 'None'}
      </div>
      <div className={`absolute top-10 left-2 px-3 py-1 rounded-lg text-sm ${theme ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
        Order Till: {timeLeftOrder ? timeLeftOrder : 'None'}
      </div>
    </motion.div>

    <div className="p-4 lg:p-5 lg:w-1/2 flex flex-col justify-between">
      <motion.h2
        className={`text-2xl font-bold mt-3 mb-2 ${theme ? 'text-green-800' : 'text-red-800'}`}
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {dish.dishName}
      </motion.h2>
      <motion.p
        className="text-gray-700 mb-2"
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        Price: {dish.dishPrice.toFixed(2)} RS
      </motion.p>
      <motion.p
        className="text-gray-700 mb-4"
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        Quantity: {Quantity}
      </motion.p>

      <motion.button
        onClick={handleToggleExpand}
        className={`py-2 px-6 rounded-lg hover:bg-opacity-80 transition-colors duration-200 ${theme ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-red-600 text-white hover:bg-red-700'}`}
        whileTap={{ scale: 0.95 }}
      >
        {isExpanded ? 'Less Info' : 'More Info'}
      </motion.button>
    </div>
  </div>

  <motion.div
    initial={{ height: 0, opacity: 0 }}
    animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
    transition={{ height: { duration: 0.4 }, opacity: { duration: 0.4 } }}
    className={`overflow-hidden p-4 ${theme ? 'bg-green-200' : 'bg-red-200'}`}
  >
    <div className="text-gray-700">
      <h3 className={`text-xl font-semibold ${theme ? 'text-green-900' : 'text-red-900'} mb-2`}>
        Item Details:
      </h3>
      {item.map((items, index) => (
        <motion.div
          key={index}
          className={`p-4 mb-2 border rounded-lg shadow-sm ${theme ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <div className="flex flex-col">
            <div className="flex justify-between mb-1">
              <span className="font-semibold">Item:</span>
              <span>{items.itemName}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="font-semibold">Quantity:</span>
              <span>{items.itemQuantity}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Flavor:</span>
              <span>{items.itemFlavor}</span>
            </div>
          </div>
        </motion.div>
      ))}

      <motion.div
        className={`text-sm mt-4 ${theme ? 'text-green-900' : 'text-red-900'}`}
        initial={{ x: -30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <strong>Repeated Days:</strong>
        <br />
        {dish.repeat && dish.repeat.length > 0 ? (
          dish.repeat.reduce((acc, day, index) => {
            if (index % 3 === 0 && index !== 0) {
              acc.push(<br key={`br-${index}`} />); // Break after every 3 days
            }
            acc.push(<span key={index}>{day}{index % 3 !== 2 && index !== dish.repeat.length - 1 ? ', ' : ''}</span>);
            return acc;
          }, [])
        ) : (
          'None'
        )}
      </motion.div>
    </div>
  </motion.div>
</motion.div>

  );
};

export default ProviderDishCard;
