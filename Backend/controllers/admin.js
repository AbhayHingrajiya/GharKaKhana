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
        // Step 1: Fetch all consumers
        const consumers = await FoodConsumer.find();

        // Step 2: Initialize an array to hold consumer info with their orders
        const consumersWithOrders = await Promise.all(consumers.map(async (consumer) => {
            // Step 3: Fetch orders for each consumer
            const orders = await OrderInfo.find({ consumerId: consumer._id }); // Assuming there is a field 'consumerId' in OrderInfo

            // Step 4: Map orders to include dish info
            const mappedOrders = await Promise.all(orders.map(async (order) => {
                const dishesArray = Object.entries(order.dishInfo).map(([dishId, quantity]) => {
                    return { dishId, quantity };
                });

                return {
                    orderDetails: order,
                    dishes: dishesArray,
                };
            }));

            return {
                consumerDetails: consumer,
                orders: mappedOrders,
            };
        }));

        // Step 5: Send the response
        console.log('=============');
        console.log(consumersWithOrders)
        return res.status(200).json(consumersWithOrders);
    } catch (error) {
        console.error('Error in getAdminConsumerInfo:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
