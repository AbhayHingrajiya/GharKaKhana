import React , { useEffect, useState } from 'react'
import ProviderDishCard from './ProviderDishCard'
import ProviderExpandableDiv from './ProviderExpandableDiv';
import Navbar from '../providerNavbar/ProviderNavbar'
import axios from 'axios';
import { ClimbingBoxLoader } from "react-spinners";

const ProviderOrderList = () => {

  const [dishes, setDishes] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
  
      try {
        const response = await axios.post('/api/getDishInfo');
        setDishes(response.data);
        console.log(response.data);
      } catch (error) {
        console.error('Error fetching dish info:', error);
      } finally {
        setIsLoading(false)
      }
    };
  
    fetchData();
  }, []);
  
  // useEffect(() => {
  //   setIsLoading(true)
  //   console.log('Dishes updated:', dishes);
  //   setIsLoading(false);
  // }, [dishes]);
  

  if (isLoading || dishes.length == 0) {
    return (
      <div className="flex items-center justify-center h-screen overflow-hidden">
        <ClimbingBoxLoader color={'#123abc'} />
      </div>
    );
  }

  return (
    <>
      <Navbar activeLink='order' />
      <div className="p-4 mt-20 space-y-4">
        <ProviderExpandableDiv title="Pending Orders" defaultExpand = {true}>
          <div className="flex flex-wrap gap-4">
            {dishes.map(({ dishInfo, itemInfo, availableQuantity }, index) => (
              <ProviderDishCard key={index} dish={dishInfo} item={itemInfo} Quantity={availableQuantity} />
            ))}
          </div>
        </ProviderExpandableDiv>

        <ProviderExpandableDiv title="Current Orders" defaultExpand = {false}>
          {/* <div className="flex flex-wrap gap-4">
            {dishes.map((dish, index) => (
              <ProviderDishCard key={index} dish={dish} repeatedDays={repeatedDays} />
            ))}
          </div> */}
        </ProviderExpandableDiv>

        <ProviderExpandableDiv title="Complete Orders" defaultExpand = {false}>
          {/* <div className="flex flex-wrap gap-4">
            {dishes.map((dish, index) => (
              <ProviderDishCard key={index} dish={dish} repeatedDays={repeatedDays} />
            ))}
          </div> */}
        </ProviderExpandableDiv>
      </div>
    </>
  )
}

export default ProviderOrderList
