import React, { useEffect, useState } from 'react';
import DishCard from '../../dishCard/DishCard';
import ExpandableDiv from '../../expandableDiv/ExpandableDiv';
import Navbar from '../../navbar/Navbar';
import axios from 'axios';
import { ClimbingBoxLoader } from "react-spinners";
import io from 'socket.io-client';

const ProviderOrderList = () => {

  const [availableDishes, setAvailableDishes] = useState([]);
  const [cancelDishes, setCancelDishes] = useState([]);
  const [pendingDishes, setPendingDishes] = useState([]);
  const [completeDishes, setCompleteDishes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {

    const socket = io('http://localhost:4000', {
      transports: ['websocket', 'polling'], // Force WebSocket
    });

    socket.on('connect', () => {
      console.log('Connected to Socket.IO server with ID:', socket.id);
    });

    const fetchData = async () => {

      setIsLoading(true);
      try {
        const resAllDishes = await axios.post('/api/getAllDishInfoProvider');
        validateDishes(resAllDishes.data.availableDishes, resAllDishes.data.pendingDishes);
        setCancelDishes(resAllDishes.data.cancelDishes);
      } catch (error) {
        console.error('Error fetching dish info:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const validateDishes = async (availableDishes, pendingDishes) => {
      // Validate available dishes
      const validAvailableDishesArray = await Promise.all(
        availableDishes.map(async ({ dishInfo, itemInfo, availableQuantity }) => {
          const isValid = await isValidDish(dishInfo); // Check if the dish is valid
          return isValid ? { dishInfo, itemInfo, availableQuantity } : null;
        })
      );

      // Validate pending dishes
      const validPendingDishesArray = await Promise.all(
        pendingDishes.map(async ({ dishInfo, itemInfo, pendingQuantity, readyForDelivery }) => {
          const isValid = await isValidDish(dishInfo); // Check if the dish is valid
          return isValid ? { dishInfo, itemInfo, pendingQuantity, readyForDelivery } : null;
        })
      );

      // Set valid available and pending dishes
      setAvailableDishes(validAvailableDishesArray.filter(dish => dish !== null));
      setPendingDishes(validPendingDishesArray.filter(dish => dish !== null));

      try {
        const response = await axios.post('/api/getProviderId');
        if (response.status === 200) {
          socket.emit('joinProviderRoom', response.data.userId);
        } else {
          console.error('Error in getProviderId at frontend side');
        }
      } catch (error) {
        console.error('Error fetching provider ID: ', error);
      }
      socket.on('newOrder', (data) => {
        alert('New order received!!');
        const { dishId, quantity } = data;

        let fullDishInfo = null;

        setAvailableDishes(prevAvailableDishes => 
          prevAvailableDishes.reduce((updatedDishes, availableDish) => {
            // Check if the current dish is the one being updated
            if (availableDish.dishInfo._id === dishId) {
              fullDishInfo = availableDish; // Set fullDishInfo to the current availableDish
              const newQuantity = availableDish.availableQuantity - quantity;
        
              if (newQuantity > 0) {
                // If quantity is still available, update it
                updatedDishes.push({
                  ...availableDish,
                  availableQuantity: newQuantity, // Update the quantity
                });
              }
            } else {
              // Keep the unchanged dish
              updatedDishes.push(availableDish);
            }
            return updatedDishes;
          }, [])
        )

        setPendingDishes(prevPendingDishes => {
          let foundDish = false; // Flag to track if the dish is found
        
          const updatedPendingDishes = prevPendingDishes.map(pendingDish => {
            if (pendingDish.dishInfo._id === dishId) {
              foundDish = true; // Set the flag if the dish is found
              return {
                ...pendingDish,
                pendingQuantity: pendingDish.pendingQuantity + quantity, // Increase the quantity
              };
            }
            return pendingDish; // Return unchanged dish if ID doesn't match
          });
        
          // If the dish was not found in pendingDishes, add fullDishInfo
          if (!foundDish && fullDishInfo) {
            updatedPendingDishes.push({
              dishInfo: fullDishInfo.dishInfo, // Add the full dish info
              itemInfo: [], // Adjust as necessary
              pendingQuantity: quantity, // Set the quantity based on the new order
            });
          }
        
          return updatedPendingDishes; // Return the updated array
        });
        
      });
    };

    fetchData();

    return () => {
      socket.disconnect(); // Properly disconnect the socket
      console.log('Socket disconnected');
    };

  }, []);

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
      } catch (err) {
        console.error('Error in expireDish: ' + err);
      }
      return false;
    }
  };

  const addCardToCancel = (dishAllInfo) => {
    console.log(dishAllInfo);
    setCancelDishes((preItem) => [
      ...preItem,
      dishAllInfo
    ])
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen overflow-hidden">
        <ClimbingBoxLoader color={'#123abc'} />
      </div>
    );
  }

  return (
    <>
      <Navbar activeLink="order" />
      <div className="p-4 mt-20 space-y-4">

        <ExpandableDiv title="Pending Orders" defaultExpand={true} theme={true}>
          <div className="flex flex-wrap gap-4">
            {pendingDishes.map(({ dishInfo, itemInfo, pendingQuantity, readyForDelivery }, index) => (
              <DishCard
                key={index}
                dish={dishInfo}
                item={itemInfo}
                Quantity={pendingQuantity}
                theme={true}
                readyForDelivery={readyForDelivery}
                userType='providerPending'
                addCardToCancelDiv={addCardToCancel}
              />
            ))}
          </div>
        </ExpandableDiv>

        <ExpandableDiv title="Current Orders" defaultExpand={false} theme={true}>
          <div className="flex flex-wrap gap-4">
            {availableDishes.map(({ dishInfo, itemInfo, availableQuantity }, index) => (
              <DishCard
                key={index}
                dish={dishInfo}
                item={itemInfo}
                Quantity={availableQuantity}
                theme={true}
                addCardToCancelDiv={addCardToCancel}
              />
            ))}
          </div>
        </ExpandableDiv>

        <ExpandableDiv title="Complete Orders" defaultExpand={false} theme={true}>
          {/* Add logic for complete orders */}
        </ExpandableDiv>
        
        <ExpandableDiv title="Cancel Orders" defaultExpand={false} theme={false}>
          <div className="flex flex-wrap gap-4">
            {cancelDishes.map(({ dishInfo, itemInfo, cancelQuantity }, index) => (
              <DishCard
                key={index}
                dish={dishInfo}
                item={itemInfo}
                Quantity={cancelQuantity}
                theme={false}
              />
            ))}
          </div>
        </ExpandableDiv>
      </div>
    </>
  );
};

export default ProviderOrderList;
