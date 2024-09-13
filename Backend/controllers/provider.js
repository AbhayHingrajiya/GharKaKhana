import FoodConsumer from '../models/FoodConsumer.js'; 
import DeliveryBoy from '../models/deliveryBoy.js'; 
import FoodProvider from '../models/FoodProvider.js';
import DishInfo from '../models/DishInfo.js';
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
      dishQuantity,
      orderTill,
      deliveryTill,
      items,
      repeat
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
        dishQuantity,
        orderTill,
        deliveryTill,
        repeat
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

export const getDishInfo = async (req, res) => {
  try{
    const response = await axios.post('http://localhost:3000/api/getUserId', {}, {
            headers: {
                Cookie: req.headers.cookie // Forward the cookies to the axios request
            }
    });
    if(response.status == 200){
      try{
        const providerId = response.data.userId;

        const dish = await DishInfo.model.findOne({ providerId: providerId });
        console.log(dish)
        res.json(dish);
      }catch(err){
        console.error('Error fetching dish info at provider.js:', err);
        res.status(500).send('Internal Server Error');
      }
        // const items = await DishInfo.model.findOne({ _id: dish. });

        // Save the new dish info to the database
        // const savedDish = await newDish.save();
        // console.log(savedDish)

        // const itemDetailsArray = items.map(item => ({
        //   dishId: savedDish._id, // Link to the saved dish
        //   itemName: item.itemName,
        //   itemQuantity: item.itemQuantity,
        //   itemFlavor: item.itemFlavor
        // }));
  
        // const savedItems = await ItemDetails.insertMany(itemDetailsArray);
  
        // // Respond with both the saved dish and item details
        // res.status(201).json({
        //   dish: savedDish,
        //   items: savedItems
        // });
    }
  } catch (error) {
    console.error('Error adding dish:', error);
    res.status(500).json({ message: 'Failed to add dish' });
  }
};
