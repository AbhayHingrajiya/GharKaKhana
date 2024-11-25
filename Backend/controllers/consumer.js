import FoodConsumer from '../models/FoodConsumer.js';
import OrderInfo from '../models/OrderInfo.js';
import DishInfo from '../models/DishInfo.js';
import ItemDetails from '../models/itemDetails.js';
import DishStatus from '../models/DishStatus.js';
import { io } from '../index.js';
import FoodProvider from '../models/FoodProvider.js';
import mongoose from 'mongoose';

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

export const getConsumerAddress = async (req, res) => {

  try{
    const consumerId = req.userId;

    const consumer = await FoodConsumer.findById(consumerId, { address: 1 });

    return res.status(200).json(consumer.address);

  }catch(err){
      console.error('Error at getConsumerAddress at backend: '+err);
      return res.status(404).json({ message: 'Error at getConsumerAddress at backend' });
  }
};

export const addNewAddress = async (req, res) => {

  try{
    const consumerId = req.userId;
    const address = req.body.fullAddress;

    await FoodConsumer.findByIdAndUpdate(
      consumerId,
      { $push: { address: address } }
    );

    console.log('new addresss added')

    return res.status(200).json({ message: 'New address added' });

  }catch(err){
      console.error('Error at addNewAddress at backend: '+err);
      return res.status(404).json({ message: 'Error at addNewAddress at backend' });
  }
};

export const addNewOrder = async (req, res) => {
  try {
    const consumerId = req.userId;
    const { orderInfo, paymentMethod, selectedAddress, totalAmount, gst, deliveryCharge, deliveryDate } = req.body;
    
    const dishInfoMap = new Map();
    const otp = new Map();
    const dishDelivery = new Map()
    const dishesToUpdate = [];
    
    for (const item of orderInfo) {
      const dishId = item.dish._id;
      const quantityOrdered = item.quantity;
      
      const dish = await DishStatus.findOne({ dishId: item.dish._id });
      
      if (!dish || dish.availableQuantity < quantityOrdered) {
        return res.status(400).json({ message: `Insufficient quantity for dish: ${dishId}` });
      }

      dishesToUpdate.push({ dish, quantityOrdered });
      dishInfoMap.set(dishId, (dishInfoMap.get(dishId) || 0) + quantityOrdered);

      const randomNumber = Math.floor(1000 + Math.random() * 9000);
      otp.set(dishId, randomNumber);
      dishDelivery.set(dishId, false);
    }

    for (const { dish, quantityOrdered } of dishesToUpdate) {
      const dishInfo = await DishInfo.findById(dish.dishId).populate('providerId');
      if (!dishInfo) {
        return res.status(404).json({ message: `DishInfo not found for dishId: ${dish.dishId}` });
      }

      dish.availableQuantity -= quantityOrdered;
      dish.pendingQuantity = (dish.pendingQuantity || 0) + quantityOrdered;

      await dish.save();
      io.to(String(dishInfo.providerId._id)).emit('newOrder', { dishId: dish.dishId, quantity: quantityOrdered });
    }

    const newOrder = new OrderInfo({
      consumerId,
      dishInfo: Object.fromEntries(dishInfoMap),
      paymentMethod,
      consumerAddress: selectedAddress,
      status: 'pending',
      dishPrice: totalAmount,
      gstPrice: gst,
      deliveryPrice: deliveryCharge,
      totalPrice: totalAmount + gst + deliveryCharge,
      otp: Object.fromEntries(otp),
      dishDelivery: Object.fromEntries(dishDelivery),
      ...(deliveryDate != null && { deliveryDate })
    });

    await newOrder.save();

     ((deliveryDate) => {
      const jobTime = deliveryDate 
        ? new Date(new Date(deliveryDate).getTime())
        : new Date(Date.now() + 60 * 60 * 1000); // fallback if deliveryDate is null
      
      const delay = jobTime.getTime() - Date.now();
    
      if (delay > 0) {
        setTimeout(() => {
          // Code to execute before delivery time
          console.log(`Running task scheduled for delivery on: ${deliveryDate}`);
          // Add additional logic here
        }, delay);
        console.log(`Job scheduled to run at: ${jobTime}`);
      } else {
        console.log("Scheduled time is in the past. Job will not run.");
      }
    })(deliveryDate)

    return res.status(201).json({ message: 'New order added', orderId: newOrder._id });

  } catch (err) {
    console.error('Error at addNewOrder at backend: ' + err);
    return res.status(500).json({ message: 'Error at addNewOrder at backend' });
  }
};

export const getPendingOrdersConsumer = async (req, res) => {
  try {
    const consumerId = req.userId;
    const orders = await OrderInfo.find({
      consumerId: consumerId,
      status: { $in: ['pending', 'confirmed'] }
    });

    const updatedDishInfo = new Map(); // Temporary holder for updated dishInfo

    for (let order of orders) {

      // Check if dishInfo is a Map
      if (!(order.dishInfo instanceof Map)) {
        order.dishInfo = new Map(Object.entries(order.dishInfo));
      }

      for (let [dishId, quantity] of order.dishInfo) {

        // Fetch dish details from DishModule
        const dishDetails = await DishInfo.findById(dishId);
        if (!dishDetails) {
          continue;
        }

        // Fetch related item details from ItemInfo
        const itemDetails = await ItemDetails.find({ dishId: dishId });
        
        if (!itemDetails || itemDetails.length === 0) {
          console.log(`No item details found for dishId: ${dishId}`);
        }

        // Attach the details to the updatedDishInfo map
        updatedDishInfo.set(dishId, {
          dishDetails: dishDetails,
          itemDetails: itemDetails,
        });
      }
    }

    // Convert updatedDishInfo Map to an object for easier JSON serialization
    const updatedDishInfoObject = Object.fromEntries(updatedDishInfo);

    // Send both orders and updatedDishInfo to the client
    res.json({ orders, updatedDishInfo: updatedDishInfoObject });
    
  } catch (error) {
    console.error('Error fetching or processing orders in getPendingOrdersConsumer at backend side:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const cancelOrderConsumer = async (req, res) => {
  const consumerId = req.userId; // Get consumer ID from the request
  const { orderId, dishDetails } = req.body; // Destructure orderId and dishDetails from request body

  if (!consumerId) {
    return res.status(400).json({ error: 'Consumer ID is missing.' });
  }

  try {
    let flag = true;

    // Loop through each dishDetail to update quantities
    for (const { dishId, quantity } of dishDetails) {
      try {
        // Fetch the current DishStatus for the dishId
        const dishStatus = await DishStatus.findOne({ dishId });

        if (!dishStatus) {
          return res.status(404).json({ error: `Dish not found: ${dishId}` });
        }

        if (!dishStatus.readyForDelivery) {
          // Decrease quantity from pendingQuantity
          dishStatus.pendingQuantity = Math.max((dishStatus.pendingQuantity || 0) - quantity, 0);
          
          // Add quantity to cancelQuantity
          dishStatus.cancelQuantity = (dishStatus.cancelQuantity || 0) + quantity;

          // Save the updated status
          await dishStatus.save();
          await OrderInfo.findByIdAndUpdate(
            orderId,
            { $push: { cancelDishes: dishId } },
            { new: true }
          );

          const providerIdforDish = await DishInfo.findOne({ _id: new mongoose.Types.ObjectId(dishId) }).select('providerId');

          if (!providerIdforDish) {
            return res.status(404).json({ error: `Provider not found for dish: ${dishId}` });
          }

          const updatedProvider = await FoodProvider.findByIdAndUpdate(
            providerIdforDish.providerId,
            {
              $inc: { negativeScore: 10 }, // Increment negativeScore by 10
            },
            { new: true } // Return the updated document
          );

          if (updatedProvider.negativeScore > 100) {
            // If negativeScore exceeds 100, update blockStatus to true
            await FoodProvider.findByIdAndUpdate(
              providerIdforDish.providerId,
              { blockStatus: true }, // Set blockStatus to true
              { new: true }
            );
          }
        } else {
          flag = false;
        }
      } catch (error) {
        console.error(`Error processing dish with id ${dishId}:`, error);
        // Continue processing other dishes even if an error occurs
        flag = false;
      }
    }

    // Update the order status based on flag
    const updatedOrder = await OrderInfo.updateOne(
      { _id: orderId, consumerId: consumerId },
      { $set: { status: flag ? 'canceled' : 'confirmed' } }
    );

    if (updatedOrder.modifiedCount === 0) {
      return res.status(404).json({ error: 'Order not found or already processed.' });
    }

    // Respond with success
    res.status(200).json({ orderStatus: flag ? 'canceled' : 'confirmed' });

  } catch (error) {
    console.error('Error canceling order:', error);
    res.status(500).json({ error: 'Error canceling order.' });
  }
};