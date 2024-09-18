import FoodProvider from '../models/FoodProvider.js';
import DishInfo from '../models/DishInfo.js';
import ItemDetails from '../models/itemDetails.js';
import DishStatus from '../models/DishStatus.js';

export const getAdminProviderInfo = async (req, res) => {
    try {
        // Fetch all providers
        const providers = await FoodProvider.find().lean();
    
        // Populate dish information for each provider
        const providersWithDishes = await Promise.all(providers.map(async (provider) => {
          // Fetch dishes for each provider
          const dishes = await DishInfo.find({ providerId: provider._id }).lean();
          
          // Populate dish status and item details for each dish
          const dishesWithStatusAndItems = await Promise.all(dishes.map(async (dish) => {
            // Fetch dish status
            const dishStatus = await DishStatus.findOne({ dishId: dish._id }).lean();
    
            // Fetch item details
            const items = await ItemDetails.find({ dishId: dish._id }).lean();
    
            return {
              dishInfo: dish,
              itemInfo: items,
              dishStatus: dishStatus || { // Handle case when dishStatus is null
                availableQuantity: 0,
                pendingQuantity: 0,
                completeQuantity: 0,
                cancelQuantity: 0
              }
            };
          }));
    
          return {
            providerInfo: provider,
            dishes: dishesWithStatusAndItems
          };
        }));
    
        res.json(providersWithDishes);
    } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
    }
};