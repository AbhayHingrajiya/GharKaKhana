import React , { useEffect } from 'react'
import ProviderDishCard from './ProviderDishCard'
import ProviderExpandableDiv from './ProviderExpandableDiv';
import Navbar from '../providerNavbar/ProviderNavbar'
import axios from 'axios';

const ProviderOrderList = () => {

    useEffect(() => {
      // Define the async function inside useEffect
      (async () => {
        try {
          const response = await axios.post('/api/getDishInfo');
          console.log(response.data); // Log or handle the response data
        } catch (error) {
          console.error('Error fetching dish info:', error);
        }
      })();
    }, []);

    const dishes = [{
    addedDate: '2024-09-13T15:38:17.412Z', // ISO 8601 format
    expiryTime: '11:00', // Time in 24-hour format
    image: 'src/assets/test.jpg',
    dishName: 'Spaghetti Carbonara',
    dishPrice: 12.99,
    dishFlavor: 'Creamy',
    itemDetails: [
      {
        itemName: 'Pasta',
        itemQuantity: 200, // grams
        itemFlavor: 'Wheat'
      },
      {
        itemName: 'Bacon',
        itemQuantity: 100, // grams
        itemFlavor: 'Smoky'
      }
    ]
  },{
    addedDate: '2024-09-13T15:38:17.412Z', // ISO 8601 format
    expiryTime: '11:00', // Time in 24-hour format
    image: 'src/assets/test.jpg',
    dishName: 'Spaghetti Carbonara',
    dishPrice: 12.99,
    dishFlavor: 'Creamy',
    itemDetails: [
      {
        itemName: 'Pasta',
        itemQuantity: 200, // grams
        itemFlavor: 'Wheat'
      },
      {
        itemName: 'Bacon',
        itemQuantity: 100, // grams
        itemFlavor: 'Smoky'
      }
    ]
  },{
    addedDate: '2024-09-13T15:38:17.412Z', // ISO 8601 format
    expiryTime: '11:00', // Time in 24-hour format
    image: 'src/assets/test.jpg',
    dishName: 'Spaghetti Carbonara',
    dishPrice: 12.99,
    dishFlavor: 'Creamy',
    itemDetails: [
      {
        itemName: 'Pasta',
        itemQuantity: 200, // grams
        itemFlavor: 'Wheat'
      },
      {
        itemName: 'Bacon',
        itemQuantity: 100, // grams
        itemFlavor: 'Smoky'
      }
    ]
  },{
    addedDate: '2024-09-13T15:38:17.412Z', // ISO 8601 format
    expiryTime: '11:00', // Time in 24-hour format
    image: 'src/assets/test.jpg',
    dishName: 'Spaghetti Carbonara',
    dishPrice: 12.99,
    dishFlavor: 'Creamy',
    itemDetails: [
      {
        itemName: 'Pasta',
        itemQuantity: 200, // grams
        itemFlavor: 'Wheat'
      },
      {
        itemName: 'Bacon',
        itemQuantity: 100, // grams
        itemFlavor: 'Smoky'
      }
    ]
  },
];
  

      const repeatedDays = ['Monday', 'Wednesday', 'Wednesday', 'Friday', 'Monday', 'Wednesday', 'Friday'];

  return (
    <>
      <Navbar activeLink='order' />
      <div className="p-4 mt-20 space-y-4">
        <ProviderExpandableDiv title="Pending Orders" defaultExpand = {true}>
          <div className="flex flex-wrap gap-4">
            {dishes.map((dish, index) => (
              <ProviderDishCard key={index} dish={dish} repeatedDays={repeatedDays} />
            ))}
          </div>
        </ProviderExpandableDiv>

        <ProviderExpandableDiv title="Current Orders" defaultExpand = {false}>
          <div className="flex flex-wrap gap-4">
            {dishes.map((dish, index) => (
              <ProviderDishCard key={index} dish={dish} repeatedDays={repeatedDays} />
            ))}
          </div>
        </ProviderExpandableDiv>

        <ProviderExpandableDiv title="Complete Orders" defaultExpand = {false}>
          <div className="flex flex-wrap gap-4">
            {dishes.map((dish, index) => (
              <ProviderDishCard key={index} dish={dish} repeatedDays={repeatedDays} />
            ))}
          </div>
        </ProviderExpandableDiv>
      </div>
    </>
  )
}

export default ProviderOrderList
