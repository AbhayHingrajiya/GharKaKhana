import FoodProvider from '../models/FoodProvider.js';
import FoodConsumer from '../models/FoodConsumer.js';
import DishInfo from '../models/DishInfo.js';
import ItemDetails from '../models/itemDetails.js';
import DishStatus from '../models/DishStatus.js';
import OrderInfo from '../models/OrderInfo.js';

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

export const getAdminConsumerInfo = async (req, res) => {
  try {
      let dishIdSet = new Set(); // To collect all unique dishIds

      // Step 1: Fetch all consumers
      const consumers = await FoodConsumer.find().lean(); // Get plain JavaScript objects for consumers

      // Step 2: Initialize an array to hold consumer info with their orders
      const consumersWithOrders = await Promise.all(consumers.map(async (consumer) => {
          // Step 3: Fetch orders for each consumer and use .lean() to get plain JavaScript objects
          const orders = await OrderInfo.find({ consumerId: consumer._id }).lean();

          // Step 4: Map orders to include only dishId set
          const mappedOrders = orders.map((order) => {
              // Extract dishId from dishInfo and add to dishIdSet
              Object.keys(order.dishInfo).forEach((dishId) => {
                  dishIdSet.add(dishId);
              });

              return {
                  orderDetails: order,
              };
          });

          return {
              consumerDetails: consumer,
              orders: mappedOrders,
          };
      }));

      // Convert the Set of dishIds into an array
      const dishIdsArray = Array.from(dishIdSet);

      // Step 6: Fetch dish details for all dishIds from the DishDetails collection
      const dishDetails = await DishInfo.find({ _id: { $in: dishIdsArray } }).lean();

      // Step 7: Fetch item info for dishes
      const itemInfo = await ItemDetails.find({ dishId: { $in: dishIdsArray } }).lean();

      // Step 8: Map dishId to dish details and include related items
      const dishInfoMap = dishDetails.reduce((acc, dish) => {
          const itemsForDish = itemInfo.filter(item => item.dishId.toString() === dish._id.toString());

          acc[dish._id] = {
              ...dish,
              items: itemsForDish, // Attach the items related to this dish
          };

          return acc;
      }, {});

      // Step 9: Send the response with consumersWithOrders and attached dishInfo
      return res.status(200).json({
          consumersWithOrders,
          dishInfoMap, // Dish info with attached items, where dishId is the key
      });

  } catch (error) {
      console.error('Error in getAdminConsumerInfo:', error);
      return res.status(500).json({ message: 'Internal server error' });
  }
};
