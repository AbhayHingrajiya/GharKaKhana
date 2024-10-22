import mongoose from 'mongoose';
import FoodConsumer from '../models/FoodConsumer.js';
import OrderInfo from '../models/OrderInfo.js';
import DishInfo from '../models/DishInfo.js';
import ItemDetails from '../models/itemDetails.js';
import DishStatus from '../models/DishStatus.js';
import { io } from '../index.js';

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
    const { orderInfo, paymentMethod, selectedAddress, totalAmount, gst, deliveryCharge } = req.body;
    
    const dishInfoMap = new Map();
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
      totalPrice: totalAmount + gst + deliveryCharge
    });

    await newOrder.save();

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
      status: 'pending'
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
          itemDetails: itemDetails
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

