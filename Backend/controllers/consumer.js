import FoodProvider from '../models/FoodProvider.js';
import DishInfo from '../models/DishInfo.js';
import ItemDetails from '../models/itemDetails.js';
import DishStatus from '../models/DishStatus.js';
import axios from 'axios';

export const consumerGetDishInfo = async (req, res) => {
    const { cityName, postcode} = req.body;
    console.log(cityName,postcode)

    try{
        const dishesWithPincode = await DishInfo.find({
            $or: [
              { pincode: postcode },
              { cityName }
            ]
          }).select('_id');
          
          const dishIds = dishesWithPincode.map(dish => dish._id);
          
          const availableDish = await DishStatus.find({
            dishId: { $in: dishIds },
            availableQuantity: { $gt: 0 }
          }).select('dishId availableQuantity');
          
          const availableDishes = await Promise.all(
            availableDish.map(async ({ dishId, availableQuantity }) => {
              const dishInfo = await DishInfo.findOne({ _id: dishId });
              const itemInfo = await ItemDetails.find({ dishId: dishId });
          
              return { dishInfo, itemInfo, availableQuantity };
            })
          );
          
          const sortedDishes = availableDishes.sort((a, b) => {
            const aMatches = a.dishInfo.pincode === postcode ? 1 : 0;
            const bMatches = b.dishInfo.pincode === postcode ? 1 : 0;
          
            return bMatches - aMatches;
          });
          console.log(sortedDishes)
          return res.status(200).json(sortedDishes);;          
    }catch(err){
        console.error('Error in consumerGetDishInfo at backend: '+err);
        return res.status(404).json({ message: 'Dish not found' });
    }
};