import FoodConsumer from '../models/FoodConsumer.js';
import OrderInfo from '../models/OrderInfo.js';
import DishInfo from '../models/DishInfo.js';
import DeliveryBoy from '../models/DeliveryBoy.js'
import ItemDetails from '../models/itemDetails.js';
import DishStatus from '../models/DishStatus.js';
import PaymentDetails from '../models/PaymentDetails.js';
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
    const orders = await OrderInfo.find({ 
      deliveryBoyId,
      status: 'proceedToDelivery' // Check if the status is 'proceedToDelivery'
    })
      .populate('consumerId')  
      .populate('deliveryBoyId') 
      .populate('dishInfo.providerId');

    if (!orders || orders.length === 0) {
      // return res.status(404).json({ message: 'No orders found for the given delivery boy' });
    }

    // Prepare the result by processing each order
    const orderDetailsList = await Promise.all(orders.map(async (orderInfo) => {
      const consumer = orderInfo.consumerId;
      const deliveryBoy = orderInfo.deliveryBoyId;
      const address = orderInfo.consumerAddress;

      // Extract dish IDs from dishInfo Map
      const dishIds = Array.from(orderInfo.dishInfo.keys());

      // Ensure all dishIds are valid ObjectIds before querying
      const validDishIds = dishIds.filter(dishId => mongoose.Types.ObjectId.isValid(dishId));

      if (validDishIds.length === 0) {
        return res.status(404).json({ message: 'No valid dish IDs found' });
      }

      // Fetch dishes for the valid dishIds with populated provider details
      const dishes = await DishInfo.find({ '_id': { $in: validDishIds } }).populate('providerId');

      // Prepare canceled dishes and OTP map
      const canceledDishes = orderInfo.cancelDishes || [];
      const otpMap = orderInfo.otp || {};

      const dishDetails = dishes
        .filter(dish => !canceledDishes.includes(dish._id.toString())) // Exclude canceled dishes
        .map(dish => ({
          dishId: dish._id,
          name: dish.dishName,
          provider: {
            name: dish.providerId?.name || 'N/A', // Ensure safe access in case providerId is null
            phone: dish.providerId?.phoneNumber || 'N/A',
            address: `${dish.address || 'N/A'}, ${dish.cityName || 'N/A'}, ${dish.pincode || 'N/A'}`,
          },
          otp: otpMap.get(dish._id.toString()) || '', // Add OTP for the dish
        }));

      const timeRemaining = Math.max(0, Math.floor((new Date(orderInfo.expectedDeliveryDate) - new Date()) / 1000));

      return {
        orderDetails: {
          orderId: orderInfo._id,
          paymentMethod: orderInfo.paymentMethod,
          totalPrice: orderInfo.totalPrice
        },
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

const storeDishDetails = async (order) => {
  const parts = order.consumerAddress.split(','); // Split the string by commas
  const cityName = parts[parts.length - 2]?.trim();

  // Iterate through the Map of dishInfo in the order
  for (let [dishId, quantity] of order.dishInfo) {
    try {
      // Query the DishInfo model for each dishId
      const dish = await DishInfo.findById(dishId).select('dishName dishPrice providerId');

      if (dish) {
        // Create a new PaymentDetails document and save it to the database
        const paymentDetail = new PaymentDetails({
          orderId: order._id,
          dishId,
          dishName: dish.dishName,
          dishPrice: dish.dishPrice,
          providerId: dish.providerId,
          quantity,
          cityName
        });

        await paymentDetail.save();
        console.log(`Payment detail saved for dishId: ${dishId}`);
      } else {
        console.log(`Dish not found for dishId: ${dishId}`);
      }
    } catch (err) {
      console.error(`Error storing dish details for dishId ${dishId}:`, err);
    }
  }
};

export const completeDelivery = async (req, res) => {
  try {
    const deliveryBoyId = req.userId; // Extract delivery boy ID from token
    const { orderId } = req.body; // Get order ID from request body

    // Ensure required data is provided
    if (!deliveryBoyId || !orderId) {
      return res.status(400).json({ message: 'Missing required data' });
    }

    // Find the order in the database
    const order = await OrderInfo.findOne({ 
      _id: orderId, 
      'deliveryBoyId': deliveryBoyId // Ensure this order is assigned to the current delivery boy
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found or not assigned to this delivery boy' });
    }

    // Update the status of the order
    const updatedOrder = await OrderInfo.findOneAndUpdate(
      { 
        _id: orderId, 
        'deliveryBoyId': deliveryBoyId 
      },
      { $set: { 'status': 'delivered' } }, // Update the specific dish's status
      { new: true }
    );
    // const updatedOrder = true;

    storeDishDetails(order)

    if (updatedOrder) {
      return res.status(200).json({ message: 'Delivery completed successfully', order: updatedOrder });
    } else {
      return res.status(500).json({ message: 'Failed to update order status' });
    }
  } catch (error) {
    console.error('Error completing delivery:', error);
    res.status(500).json({ message: 'An error occurred while completing the delivery' });
  }
};

export const deliveryBoyGetAllCompleteOrders = async (req, res) => {
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
    const orders = await OrderInfo.find({ 
      deliveryBoyId,
      status: 'delivered' // Check if the status is 'proceedToDelivery'
    })
      .populate('consumerId')  
      .populate('deliveryBoyId') 
      .populate('dishInfo.providerId');

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'No orders found for the given delivery boy' });
    }

    // Prepare the result by processing each order
    const orderDetailsList = await Promise.all(orders.map(async (orderInfo) => {
      const consumer = orderInfo.consumerId;
      const deliveryBoy = orderInfo.deliveryBoyId;
      const address = orderInfo.consumerAddress;

      // Extract dish IDs from dishInfo Map
      const dishIds = Array.from(orderInfo.dishInfo.keys());

      // Ensure all dishIds are valid ObjectIds before querying
      const validDishIds = dishIds.filter(dishId => mongoose.Types.ObjectId.isValid(dishId));

      if (validDishIds.length === 0) {
        return res.status(404).json({ message: 'No valid dish IDs found' });
      }

      // Fetch dishes for the valid dishIds with populated provider details
      const dishes = await DishInfo.find({ '_id': { $in: validDishIds } }).populate('providerId');

      // Prepare canceled dishes and OTP map
      const canceledDishes = orderInfo.cancelDishes || [];
      const otpMap = orderInfo.otp || {};

      const dishDetails = dishes
        .filter(dish => !canceledDishes.includes(dish._id.toString())) // Exclude canceled dishes
        .map(dish => ({
          dishId: dish._id,
          name: dish.dishName,
          provider: {
            name: dish.providerId?.name || 'N/A', // Ensure safe access in case providerId is null
            phone: dish.providerId?.phoneNumber || 'N/A',
            address: `${dish.address || 'N/A'}, ${dish.cityName || 'N/A'}, ${dish.pincode || 'N/A'}`,
          },
          otp: otpMap.get(dish._id.toString()) || '', // Add OTP for the dish
        }));

      const timeRemaining = Math.max(0, Math.floor((new Date(orderInfo.expectedDeliveryDate) - new Date()) / 1000));

      return {
        orderDetails: {
          orderId: orderInfo._id,
          paymentMethod: orderInfo.paymentMethod,
          totalPrice: orderInfo.totalPrice
        },
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

export const verifyDeliveryBoy = async (req, res) => {
  const deliveryBoyId = req.userId; // Ensure you're using req.userId, not req.useId

  try {
    // Find the DeliveryBoy document by the provided ID
    const deliveryBoy = await DeliveryBoy.findById(deliveryBoyId);

    if (!deliveryBoy) {
      return res.status(404).json({ error: 'Delivery boy not found' });
    }

    // Check the verification status and admin comment
    const { varify, adminComment } = deliveryBoy;

    res.status(200).json({
      varify, // true or false
      adminComment // Admin's comment if any
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while verifying the delivery boy' });
  }
};

export const deactiveDeliveryBoy = async (req, res) => {
  const deliveryBoyId = req.userId;

  try {
    // Update the status of the delivery boy to active (status: true)
    const updatedDeliveryBoy = await DeliveryBoy.findByIdAndUpdate(
      deliveryBoyId,
      { status: false }, // Setting status to false to deactivate
      { new: true } // Return the updated document
    );

    if (!updatedDeliveryBoy) {
      return res.status(404).json({ message: 'Delivery boy not found.' });
    }

    res.status(200).json({
      message: 'Delivery boy status updated successfully.',
      deliveryBoy: updatedDeliveryBoy,
    });
  } catch (error) {
    console.error('Error updating delivery boy status:', error);
    res.status(500).json({ message: 'Failed to update delivery boy status.' });
  }
};
