import React, { useEffect, useState } from 'react';
import DishCard from '../../dishCard/DishCard';
import ProviderExpandableDiv from './ProviderExpandableDiv';
import Navbar from '../../navbar/Navbar';
import axios from 'axios';
import { ClimbingBoxLoader } from "react-spinners";
import io from 'socket.io-client';

const ProviderOrderList = () => {

  const socket = io('/api/');

  const [availableDishes, setAvailableDishes] = useState([]);
  const [cancelDishes, setCancelDishes] = useState([]);
  const [pendingDishes, setPendingDishes] = useState([]);
  const [completeDishes, setCompleteDishes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
        pendingDishes.map(async ({ dishInfo, itemInfo, pendingQuantity }) => {
          const isValid = await isValidDish(dishInfo); // Check if the dish is valid
          return isValid ? { dishInfo, itemInfo, pendingQuantity } : null;
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
        console.log('New order received:', data);
      });
    };

    fetchData();
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
        console.log(res.data);
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

        <ProviderExpandableDiv title="Pending Orders" defaultExpand={true} theme={true}>
          <div className="flex flex-wrap gap-4">
            {pendingDishes.map(({ dishInfo, itemInfo, pendingQuantity }, index) => (
              <DishCard
                key={index}
                dish={dishInfo}
                item={itemInfo}
                Quantity={pendingQuantity}
                theme={true}
                addCardToCancelDiv={addCardToCancel}
              />
            ))}
          </div>
        </ProviderExpandableDiv>

        <ProviderExpandableDiv title="Current Orders" defaultExpand={false} theme={true}>
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
        </ProviderExpandableDiv>

        <ProviderExpandableDiv title="Complete Orders" defaultExpand={false} theme={true}>
          {/* Add logic for complete orders */}
        </ProviderExpandableDiv>
        
        <ProviderExpandableDiv title="Cancel Orders" defaultExpand={false} theme={false}>
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
        </ProviderExpandableDiv>
      </div>
    </>
  );
};

export default ProviderOrderList;
