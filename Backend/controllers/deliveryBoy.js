import FoodConsumer from '../models/FoodConsumer.js';
import OrderInfo from '../models/OrderInfo.js';
import DishInfo from '../models/DishInfo.js';
import DeliveryBoy from '../models/DeliveryBoy.js'
import ItemDetails from '../models/itemDetails.js';
import DishStatus from '../models/DishStatus.js';
import { io } from '../index.js';
import FoodProvider from '../models/FoodProvider.js';
import mongoose from 'mongoose';

export const activeDeliveryBoy = async (req, res) => {
  try {
    const deliveryBoyId = req.userId;
    // Update the status of the delivery boy to active (status: true)
    const updatedDeliveryBoy = await DeliveryBoy.findByIdAndUpdate(
      deliveryBoyId,
      { status: true },
      { new: true }
    );

    if (!updatedDeliveryBoy) {
      return res.status(404).json({ message: 'Delivery boy not found' });
    }

    // Fetch all orders for the specific delivery boy
    const orders = await OrderInfo.find({ deliveryBoyId })
      .populate('consumerId')  
      .populate('deliveryBoyId') 
      .populate('dishInfo.providerId'); // Populate providerId within dishInfo

      console.log(orders)
    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'No orders found for the given delivery boy' });
    }

    // Prepare the result by processing each order
    const orderDetailsList = await Promise.all(orders.map(async (orderInfo) => {
      const consumer = orderInfo.consumerId;
      const deliveryBoy = orderInfo.deliveryBoyId;
      const address = orderInfo.consumerAddress;

      console.log(orderInfo.dishInfo)
      // Extract dish IDs from dishInfo Map
      const dishIds = Array.from(orderInfo.dishInfo.keys());
      console.log(dishIds)

      // Ensure all dishIds are valid ObjectIds before querying
      const validDishIds = dishIds.filter(dishId => mongoose.Types.ObjectId.isValid(dishId));

      if (validDishIds.length === 0) {
        return res.status(404).json({ message: 'No valid dish IDs found' });
      }

      // Fetch dishes for the valid dishIds
      const dishes = await DishInfo.find({ '_id': { $in: validDishIds } });

      // Prepare canceled dishes and OTP map
      const canceledDishes = orderInfo.cancelDishes || [];
      const otpMap = orderInfo.otp || {};

      const dishDetails = dishes
        .filter(dish => !canceledDishes.includes(dish._id.toString())) 
        .map(dish => ({
          dishId: dish._id,
          name: dish.dishName,
          provider: {
            name: dish.providerId.name,
            phone: dish.providerId.phoneNumber,
            address: `${dish.providerId.address}, ${dish.providerId.city}, ${dish.providerId.pincode}`,
          },
          otp: otpMap[dish._id.toString()] || '',
        }));

      const timeRemaining = Math.max(0, Math.floor((new Date(orderInfo.expectedDeliveryDate) - new Date()) / 1000));

      return {
        orderId: orderInfo._id,
        consumer: {
          name: consumer.name,
          phone: consumer.phoneNumber,
          address,
        },
        dishes: dishDetails,
        deliveryBoyId: deliveryBoy._id,
        timeRemaining, // Dynamically calculated
      };
    }));

    return res.status(200).json({
      message: 'Delivery boy status updated and order details fetched',
      deliveryBoyId,
      orders: orderDetailsList,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};



export const acceptedOrderByDeliveryBoy = async (req, res) => {
  const deliveryBoyId = req.userId;
  const orderId = req.body.orderId;

  try {
    // Check if deliveryBoyId and orderId are provided
    if (!deliveryBoyId) {
      return res.status(400).json({ message: "Delivery Boy ID is missing" });
    }
    if (!orderId) {
      return res.status(400).json({ message: "Order ID is missing" });
    }

    // Find and update the order
    const updatedOrder = await OrderInfo.findByIdAndUpdate(
      orderId,
      {
        $set: {
          deliveryBoyId: deliveryBoyId,
          status: 'proceedToDelivery',
        },
      },
      { new: true } // Return the updated document
    );

    // Check if the order was found and updated
    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Respond with success message and updated order
    res.status(200).json({
      message: "Order accepted successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error accepting order:", error);
    res.status(500).json({
      message: "An error occurred while accepting the order",
      error: error.message,
    });
  }
};
