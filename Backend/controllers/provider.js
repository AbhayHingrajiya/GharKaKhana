import FoodProvider from '../models/FoodProvider.js';
import DishInfo from '../models/DishInfo.js';
import ItemDetails from '../models/itemDetails.js';
import DishStatus from '../models/DishStatus.js';
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
      repeat,
      dishId
    } = req.body;

    const response = await axios.post('http://localhost:3000/api/getUserId', {}, {
            headers: {
                Cookie: req.headers.cookie // Forward the cookies to the axios request
            }
    });
    if(response.status == 200){
        const providerId = response.data.userId;

        if(dishId){
          try {
          // Update the dish info
          const updatedDish = await DishInfo.findOneAndUpdate(
            { _id: dishId },  // Find the dish by dishId
            {
              $set: {
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
              }
            },
            { new: true } // Return the updated document
          );
      
          if (!updatedDish) {
            return res.status(404).json({ message: 'Dish not found' });
          }

          await ItemDetails.deleteMany({ dishId });
          await DishStatus.deleteOne({ dishId });
          
          const newDishStatus = new DishStatus({
            dishId: dishId,
            providerId,
            availableQuantity: dishQuantity,
          });
    
          const savedDishStatus = await newDishStatus.save();
  
          const itemDetailsArray = items.map(item => ({
            dishId: dishId, // Link to the saved dish
            itemName: item.itemName,
            itemQuantity: item.itemQuantity,
            itemFlavor: item.itemFlavor
          }));
    
          const savedItems = await ItemDetails.insertMany(itemDetailsArray);
      
          res.status(200).json({
            dish: updatedDish,
            items: savedItems,
            status: savedDishStatus
          });
        } catch (err) {
          console.error('Error updating dish info:', err);
          res.status(500).json({ message: 'Internal Server Error' });
        }
      }else{
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
        
        const newDishStatus = new DishStatus({
          dishId: savedDish._id,
          providerId,
          availableQuantity: dishQuantity,
        });
  
        const savedDishStatus = await newDishStatus.save();

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
          items: savedItems,
          status: savedDishStatus
        });
      }
    }
  } catch (error) {
    console.error('Error adding dish:', error);
    res.status(500).json({ message: 'Failed to add dish' });
  }
};

export const getAvailableDishInfo = async (req, res) => {
  try {
    // Fetch the provider ID
    const response = await axios.post('http://localhost:3000/api/getUserId', {}, {
      headers: {
        Cookie: req.headers.cookie // Forward the cookies to the axios request
      }
    });

    if (response.status === 200) {
      const providerId = response.data.userId;

      try {

        const availableDish = await DishStatus.find({
          providerId: providerId,
          availableQuantity: { $gt: 0 }
        }).select('dishId availableQuantity');
        
        const availableDishes = await Promise.all(
          availableDish.map(async ({ dishId, availableQuantity }) => {
            const dishInfo = await DishInfo.findOne({ _id: dishId });
            const itemInfo = await ItemDetails.find({ dishId: dishId });
            
            return { dishInfo, itemInfo, availableQuantity };
          })
        );
        
        console.log(availableDishes);
        

        res.json(availableDishes);
      } catch (err) {
        console.error('Error fetching available dish info at provider.js:', err);
        res.status(500).send('Internal Server Error');
      }
    }
  } catch (error) {
    console.error('Error fetching provider ID:', error);
    res.status(500).json({ message: 'Failed to fetch provider ID' });
  }
};

export const cancelOrderProvider = async (req, res) => {
  try {
    // Fetch the provider ID
    const response = await axios.post('http://localhost:3000/api/getUserId', {}, {
      headers: {
        Cookie: req.headers.cookie // Forward the cookies to the axios request
      }
    });

    if (response.status === 200) {
      const providerId = response.data.userId;
      const dishId = req.body.dishId;

      try {
        const dishStatus = await DishStatus.findOne({ dishId, providerId });

        if (dishStatus) {
          const availableQty = dishStatus.availableQuantity+dishStatus.cancelQuantity;
          console.log('available Q: '+dishStatus)

          const updatedDishStatus = await DishStatus.findOneAndUpdate(
            { dishId, providerId },
            {
              $set: {
                cancelQuantity: availableQty,
                availableQuantity: 0
              }
            },
            { new: true }
          );

          res.status(200).send(updatedDishStatus);
        } else {
          res.status(404).send('Dish status not found');
        }
      } catch (err) {
        console.error('Error in set expireDish at provider.js:', err);
        res.status(500).send('Internal Server Error');
      }
    }
  } catch (error) {
    console.error('Error fetching provider ID:', error);
    res.status(500).json({ message: 'Failed to fetch provider ID' });
  }
};

export const getCancelDishInfo = async (req, res) => {
  try {
    // Fetch the provider ID
    const response = await axios.post('http://localhost:3000/api/getUserId', {}, {
      headers: {
        Cookie: req.headers.cookie // Forward the cookies to the axios request
      }
    });

    if (response.status === 200) {
      const providerId = response.data.userId;

      try {

        const cancelDish = await DishStatus.find({
          providerId: providerId,
          cancelQuantity: { $gt: 0 }
        }).select('dishId cancelQuantity');
        
        const cancelDishes = await Promise.all(
          cancelDish.map(async ({ dishId, cancelQuantity }) => {
            const dishInfo = await DishInfo.findOne({ _id: dishId }).select('-address -cityName -pincode -dishQuantity');
            const itemInfo = await ItemDetails.find({ dishId: dishId });
            
            return { dishInfo, itemInfo, cancelQuantity };
          })
        );
        
        console.log(cancelDishes);
        

        res.json(cancelDishes);
      } catch (err) {
        console.error('Error fetching cancel dish info at provider.js:', err);
        res.status(500).send('Internal Server Error');
      }
    }
  } catch (error) {
    console.error('Error fetching provider ID:', error);
    res.status(500).json({ message: 'Failed to fetch provider ID' });
  }
};