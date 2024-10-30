import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaEllipsisV } from 'react-icons/fa';
import {useNavigate, useLocation} from 'react-router-dom';
import axios from 'axios';

const ProviderDishCard = ({ dish, item, Quantity, theme, addCardToCancelDiv, userType, addToOrder, readyForDelivery }) => {
  const navigate = useNavigate();
  const [themeFlag, changeThemeFlag] = useState(theme)
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCancel, setIsCancel] = useState(false);
  const [expireDateDelivery, setExpireDateDelivery] = ( dish.deliveryTill == 'any' || !themeFlag) ? useState (false) :
   useState(
    calculateExpireDate(dish.date, dish.deliveryTill)
   );
  const [timeLeftDelivery, setTimeLeftDelivery] = ( expireDateDelivery && themeFlag ) ? useState(getFormattedTimeLeft(expireDateDelivery, dish.deliveryTill)) : useState (false);
  
  const [expireDateOrder, setExpireDateOrder] = ( dish.orderTill == 'any' || !themeFlag) ? useState (false) :
   useState(
    calculateExpireDate(dish.date, dish.orderTill)
   );
  const [timeLeftOrder, setTimeLeftOrder] = ( expireDateOrder && themeFlag ) ? useState(getFormattedTimeLeft(expireDateOrder, dish.orderTill)) : useState (false);
  const [showMenu, setShowMenu] = useState(false);
  const [count, setCount] = useState(1);
  const [orders, setOrders] = useState([]);
  const [readyToDeliverFlag, setReadyToDeliverFlag] = useState(readyForDelivery)
  const [errorMsg, setErrorMsg] = useState(""); // State for error messages
  const [deliveredOrders, setDeliveredOrders] = useState([]); // State to track delivered orders
  const [enteredOtps, setEnteredOtps] = useState({}); // Store OTPs for each order

  const incrementCount = () => {
    if(Quantity > count) setCount(prevCount => prevCount + 1);
  };

  const decrementCount = () => {
    if (count > 1) {
      setCount(prevCount => prevCount - 1);
    }
  };

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
      const addedDT = new Date(addedDate);
      addedDT.setHours(addedDT.getHours() - 6);
      addedDT.setMinutes(addedDT.getMinutes() + 30);
      if(addedDT < addedDateTime) {
        if(dish.repeat.length>0) return checkForRepeat(hours, minutes);
        const deleteCardFromDatabase = async () => {
          const res = await axios.post('/api/cancelOrderProvider', { dishId: dish._id });
          if(res && userType == 'consumer') changeThemeFlag(false);
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
  };

  useEffect( () => {
    if(readyForDelivery) readyToDeliver();
  }, []);

  const readyToDeliver = async () => {
    try {
        const res = await axios.post('/api/getOTPforDelivery', { dishId: dish._id });
        setOrders(res.data.orders);
        setReadyToDeliverFlag(true);
        console.log(res.data.orders)
    } catch (error) {
        const errorMessage = error.response 
            ? `Error: ${error.response.status} - ${error.response.data.message || "Something went wrong during the getOTPforDelivery POST request."}` 
            : `Error: ${error.message}`;
        
        console.error(`Error in getOTPforDelivery POST method: ${errorMessage}`);
    }
  };


  const handleOtpChange = (orderId, otp) => {
    setEnteredOtps(prev => ({ ...prev, [orderId]: otp }));
  };

  const deliveryButtonClick = async (orderId) => {
    const order = orders.find(o => o.orderId === orderId);
    const enteredOtp = enteredOtps[orderId];
    
    if (order && order.otp == enteredOtp) {
      try {
        const res = await axios.post('/api/comfirmOrderDeliveryByProvider', {
          orderId,
          dishId: dish._id,
          quantity: order.quantity
        });
        
        setDeliveredOrders(prev => [...prev, order]);
        setOrders(prevOrders => 
          prevOrders.filter(existingOrder => existingOrder.orderId !== orderId)
        );
        setErrorMsg("");
      } catch (error) {
        setErrorMsg("Error confirming delivery. Please try again.");
        console.error('Error in comfirmOrderDeliveryByProvider: '+error)
      }
    } else {
      setErrorMsg("The OTP you entered is incorrect. Please try again.");
    }
  };
  
    
  if(isCancel){
    return(<></>)
  }

  return (
    <motion.div
      className={`relative max-w-lg mx-auto rounded-lg shadow-lg overflow-hidden transition-transform duration-300 ${themeFlag ? 'bg-green-100' : 'bg-red-100'}`}
      whileHover={{
        scale: 1.03,
        boxShadow: `0 10px 20px rgba(${themeFlag ? '0, 128, 0' : '255, 0, 0'}, 0.3)`,
        backgroundColor: `${themeFlag ? '#e6f7e9' : '#fce4e4'}`,
      }}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      // transition={{ type: 'spring', stiffness: 100 }}
    >
    {userType == 'ProviderAvailableDish' && (<div className="relative">
      <button
        onClick={handleMenuToggle}
        className={`absolute top-1 right-1 p-2 rounded-full focus:outline-none z-10 ${themeFlag ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}
      >
        <FaEllipsisV />
      </button>

      {showMenu && (
        <motion.div
          className={`absolute top-10 right-2 border rounded-lg shadow-lg w-48 z-20 ${themeFlag ? 'bg-white border-green-300' : 'bg-white border-red-300'}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {themeFlag && (<button
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
    </div>)}

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
        { userType != 'consumerOrder' && (
          <>
            <div className={`absolute top-2 left-2 px-3 py-1 rounded-lg text-sm ${themeFlag ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
              Delivery Till: {timeLeftDelivery ? timeLeftDelivery : 'None'}
            </div>
            <div className={`absolute top-10 left-2 px-3 py-1 rounded-lg text-sm ${themeFlag ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
              Order Till: {timeLeftOrder ? timeLeftOrder : 'None'}
            </div>
          </>
        )}
      </motion.div>

      <div className="p-4 lg:p-5 lg:w-1/2 flex flex-col justify-between">
        <motion.h2
          className={`text-2xl font-bold mt-3 mb-2 ${themeFlag ? 'text-green-800' : 'text-red-800'}`}
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
          className={`py-2 px-6 rounded-lg hover:bg-opacity-80 transition-colors duration-200 ${themeFlag ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-red-600 text-white hover:bg-red-700'}`}
          whileTap={{ scale: 0.95 }}
        >
          {isExpanded ? 'Less Info' : 'More Info'}
        </motion.button>
      </div>
    </div>

    {userType == 'providerPending' && !readyToDeliverFlag && (<motion.button
      onClick={readyToDeliver}
      className="w-full bg-green-600 text-white px-6 py-3 mt-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200 ease-in-out"
      whileHover={{ scale: 1.05, boxShadow: "0 8px 15px rgba(34, 139, 34, 0.3)" }} // Green shadow on hover
      whileTap={{ scale: 0.95 }}
    >
      Ready to deliver
    </motion.button>)}

    {errorMsg && <div className="text-red-600 mb-4">{errorMsg}</div>}
    {orders.length > 0 && readyToDeliverFlag && (
        <div className="p-4 lg:p-5 lg:w-full flex flex-col justify-between">
            <h3 className={`text-xl font-semibold ${themeFlag ? 'text-green-900' : 'text-red-900'} mb-2`}>
                Orders:
            </h3>
            {orders.map((order) => (
                <div key={order.orderId} className={`flex items-center justify-between border p-2 rounded-lg shadow-sm mb-2 ${themeFlag ? 'bg-green-50' : 'bg-red-50'}`}>
                    <div className="flex flex-col">
                        <span><strong>Order ID:</strong> {order.orderId}</span>
                        <span><strong>Quantity:</strong> {order.quantity}</span>
                        <input
                            type="text"
                            placeholder="Enter OTP"
                            className={`border rounded px-2 py-1 mt-1 ${themeFlag ? 'border-green-400' : 'border-red-400'}`}
                            onChange={(e) => handleOtpChange(order.orderId, e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => deliveryButtonClick(order.orderId)}
                        className={`ml-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200`}
                    >
                        Deliver
                    </button>
                </div>
            ))}
        </div>
    )}
    {deliveredOrders.length > 0 && (
        <div className="p-4">
            <h3 className="text-xl font-semibold">Delivered Orders:</h3>
            {deliveredOrders.map(deliveredOrder => (
                <div key={deliveredOrder.orderId} className="mb-2">
                    <span>Order ID: {deliveredOrder.orderId} - Delivered</span>
                </div>
            ))}
        </div>
    )}


    {(userType == 'consumer' && themeFlag && <div className="flex items-center justify-between ">
      <div className="flex items-center m-2 space-x-4">
        <button
          onClick={decrementCount}
          className="bg-gray-200 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-300"
        >
          -
        </button>
        <span className="text-lg font-semibold">{count}</span>
        <button
          onClick={incrementCount}
          className="bg-gray-200 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-300"
        >
          +
        </button>
      </div>

      <button className="bg-green-600 m-2 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all duration-200"
      onClick={() => addToOrder(dish, count, timeLeftDelivery)}>
        Add Order
      </button>
    </div>)}

    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
      transition={{ height: { duration: 0.4 }, opacity: { duration: 0.4 } }}
      className={`overflow-hidden p-4 ${themeFlag ? 'bg-green-200' : 'bg-red-200'}`}
    >
      <div className="text-gray-700">
        <h3 className={`text-xl font-semibold ${themeFlag ? 'text-green-900' : 'text-red-900'} mb-2`}>
          Item Details:
        </h3>
        {item.map((items, index) => (
          <motion.div
            key={index}
            className={`p-4 mb-2 border rounded-lg shadow-sm ${themeFlag ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
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
          className={`text-sm mt-4 ${themeFlag ? 'text-green-900' : 'text-red-900'}`}
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
