import React, { useEffect, useState } from 'react';
import ProviderDishCard from './ProviderDishCard';
import ProviderExpandableDiv from './ProviderExpandableDiv';
import Navbar from '../providerNavbar/ProviderNavbar';
import axios from 'axios';
import { ClimbingBoxLoader } from "react-spinners";

const ProviderOrderList = () => {
  const [validDishes, setValidDishes] = useState([]);
  const [cancelDishes, setCancelDishes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const responseAvailableDishes = await axios.post('/api/getAvailableDishInfo');
        console.log(responseAvailableDishes.data);
        validateDishes(responseAvailableDishes.data);

        const responseCancelDishes = await axios.post('/api/getCancelDishInfo');
        console.log(responseCancelDishes.data);
        setCancelDishes(responseCancelDishes.data);
      } catch (error) {
        console.error('Error fetching dish info:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Validate dishes
    const validateDishes = async (dishes) => {
      const validDishesArray = await Promise.all(
        dishes.map(async ({ dishInfo, itemInfo, availableQuantity }) => {
          const isValid = await isValidDish(dishInfo);
          return isValid ? { dishInfo, itemInfo, availableQuantity } : null;
        })
      );
      setValidDishes(validDishesArray.filter(dish => dish !== null)); // Set valid dishes
    };

    fetchData();
  }, []);

  const isValidDish = async (dishInfo) => {
    if (dishInfo.repeat.length > 0 || dishInfo.orderTill != 'any' || dishInfo.deliveryTill != 'any') return true;
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
          {/* Add logic for current orders */}
        </ProviderExpandableDiv>

        <ProviderExpandableDiv title="Current Orders" defaultExpand={false} theme={true}>
          <div className="flex flex-wrap gap-4">
            {validDishes.map(({ dishInfo, itemInfo, availableQuantity }, index) => (
              <ProviderDishCard
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
              <ProviderDishCard
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
