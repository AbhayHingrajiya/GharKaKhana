import FoodConsumer from '../models/FoodConsumer.js'; 
import DeliveryBoy from '../models/deliveryBoy.js'; 
import FoodProvider from '../models/FoodProvider.js';
import DishInfo from '../models/dishInfo.js';
import ItemDetails from '../models/itemDetails.js';
import axios from 'axios';

export const addDish = async (req, res) => {
  try {
    const {
      dishName,
      address,
      cityName,
      pincode,
      dishPrice,
      dishFlavor,
      orderTill,
      deliveryTill,
      items
    } = req.body;

    const response = await axios.post('http://localhost:3000/api/getUserId', {}, {
            headers: {
                Cookie: req.headers.cookie // Forward the cookies to the axios request
            }
    });
    if(response.status == 200){
        const providerId = response.data.userId;

        // Create a new dish info document
        const newDish = new DishInfo({
        providerId,
        dishName,
        address,
        cityName,
        pincode,
        dishPrice,
        dishFlavor,
        orderTill,
        deliveryTill
        });

        // Save the new dish info to the database
        const savedDish = await newDish.save();
        console.log(savedDish)

        const itemDetailsArray = items.map(item => ({
          dishId: savedDish._id, // Link to the saved dish
          itemName: item.itemName,
          itemQuantity: item.itemQuantity,
          itemFlavor: item.itemFlavor
        }));
  
        const savedItems = await ItemDetails.insertMany(itemDetailsArray);
  
        // Respond with both the saved dish and item details
        res.status(201).json({
          dish: savedDish,
          items: savedItems
        });
    }
  } catch (error) {
    console.error('Error adding dish:', error);
    res.status(500).json({ message: 'Failed to add dish' });
  }
};
