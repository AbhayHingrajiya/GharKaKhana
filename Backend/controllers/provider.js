import DishInfo from '../models/DishInfo.js';
import ItemDetails from '../models/itemDetails.js';
import DishStatus from '../models/DishStatus.js';
import OrderInfo from '../models/OrderInfo.js';
import mongoose from 'mongoose';

export const addDish = async (req, res) => {
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

    const providerId = req.userId;

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
};

export const cancelOrderProvider = async (req, res) => {
    const dishId = req.body.dishId;

    try {
      const dishStatus = await DishStatus.findOne({ dishId });

      if (dishStatus) {
        const availableQty = dishStatus.availableQuantity+dishStatus.cancelQuantity;
        console.log('available Q: '+dishStatus)

        const updatedDishStatus = await DishStatus.findOneAndUpdate(
          { dishId },
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
};

export const getAllDishInfoProvider = async (req, res) => {
  const providerId = req.userId;

  try {
    // Fetch available dishes
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

    // Fetch canceled dishes
    const cancelDish = await DishStatus.find({
      providerId: providerId,
      cancelQuantity: { $gt: 0 }
    }).select('dishId cancelQuantity');

    const cancelDishes = await Promise.all(
      cancelDish.map(async ({ dishId, cancelQuantity }) => {
        const dishInfo = await DishInfo.findOne({ _id: dishId });
        const itemInfo = await ItemDetails.find({ dishId: dishId });

        return { dishInfo, itemInfo, cancelQuantity };
      })
    );

    // Fetch pending dishes
    const pendingDish = await DishStatus.find({
      providerId: providerId,
      pendingQuantity: { $gt: 0 }
    }).select('dishId pendingQuantity readyForDelivery');

    const pendingDishes = await Promise.all(
      pendingDish.map(async ({ dishId, pendingQuantity, readyForDelivery }) => {
        const dishInfo = await DishInfo.findOne({ _id: dishId });
        const itemInfo = await ItemDetails.find({ dishId: dishId });

        return { dishInfo, itemInfo, pendingQuantity, readyForDelivery };
      })
    );

    // Fetch completed dishes
    const completeDish = await DishStatus.find({
      providerId: providerId,
      completeQuantity: { $gt: 0 }
    }).select('dishId completeQuantity');

    const completeDishes = await Promise.all(
      completeDish.map(async ({ dishId, completeQuantity }) => {
        const dishInfo = await DishInfo.findOne({ _id: dishId });
        const itemInfo = await ItemDetails.find({ dishId: dishId });

        return { dishInfo, itemInfo, completeQuantity };
      })
    );

    // Combine all results
    const response = {
      availableDishes,
      cancelDishes,
      pendingDishes,
      completeDishes
    };

    res.json(response);
  } catch (err) {
    console.error('Error fetching dish info at provider.js:', err);
    res.status(500).send('Internal Server Error');
  }
};

export const getOTPforDelivery = async (req, res) => {  
  const loginConfirmation = req.userId;

  if (!loginConfirmation) {
    return res.status(401).json({ message: "Unauthorized access in generateOTPforDelivery." });
  }

  const { dishId } = req.body;

  if (!dishId) {
    return res.status(400).json({ message: "Dish ID is required in generateOTPforDelivery." });
  }

  try {
    const orders = await OrderInfo.find(
      {
        status: { $in: ['pending', 'confirmed'] },
        [`dishInfo.${dishId}`]: { $exists: true },
        [`dishDelivery.${dishId}`]: false
      },
      {
        _id: 1,
        [`dishInfo`]: 1,
        [`otp.${dishId}`]: 1
      }
    ).exec();

    const result = await Promise.all(
      orders.map(async (order) => {
        let flagForDishStatus = true;
        const quantity = order.dishInfo ? order.dishInfo.get(dishId) : undefined;
        const otp = order.otp ? order.otp.get(dishId) : undefined;

        try {
          const dishIds = Array.from(order.dishInfo.keys());

          const dishStatuses = await Promise.all(
            dishIds.map(async (id) => {
              return await DishStatus.findOne({ dishId: id }, { readyForDelivery: 1 });
            })
          );

          for (const [index, dishStatus] of dishStatuses.entries()) {
            console.log(dishStatus.readyForDelivery)
            if (!dishStatus.readyForDelivery && dishIds[index] !== dishId) {
              flagForDishStatus = false;
              break;
            }
          }

          if (flagForDishStatus) {
            await OrderInfo.findOneAndUpdate(
              { _id: order._id },
              { status: 'confirmed' },
              { new: true }
            );
          }
        } catch (dishStatusError) {
          console.error(`Error checking dish status for order ${order._id}:`, dishStatusError);
          flagForDishStatus = false;
        }

        return {
          orderId: order._id,
          quantity,
          otp
        };
      })
    );

    if (result.length === 0) {
      return res.status(404).json({ message: "No pending orders found for the specified dish ID in generateOTPforDelivery." });
    }

    try {
      const updatedDishStatus = await DishStatus.findOneAndUpdate(
        { dishId: mongoose.Types.ObjectId.isValid(dishId) ? dishId : null },
        { readyForDelivery: true },
        { new: true }
      );

      if (!updatedDishStatus) {
        console.error("No DishStatus found with this dishId:", dishId);
      }
    } catch (updateError) {
      console.error("Error updating DishStatus for delivery readiness:", updateError);
    }

    return res.status(200).json({ orders: result });
    
  } catch (error) {
    console.error('Error generating OTP for delivery in generateOTPforDelivery:', error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const comfirmOrderDeliveryByProvider = async (req, res) => {
  const loginVarification = req.userId;

  if (!loginVarification) {
    return res.status(401).json({ message: "Unauthorized access" });
  }

  const { orderId, dishId, quantity } = req.body;

  try {
    const updateResult = await OrderInfo.findOneAndUpdate(
      { _id: orderId },
      { $set: { [`dishDelivery.${dishId}`]: true } },
      { new: true }
    );

    if (!updateResult) {
      return res.status(404).json({ message: "Order not found" });
    }

    const updatedDish = await DishStatus.findOneAndUpdate(
      { dishId },
      {
        $inc: {
          pendingQuantity: -quantity,
          completeQuantity: quantity
        }
      },
      { new: true }
    );

    if (!updatedDish) {
      return res.status(404).json({ message: "Dish not found" });
    }

    return res.status(200).json({ message: "Order and dish updated successfully", updateResult, updatedDish });
  } catch (error) {
    console.error("Error updating order and dish:", error);
    return res.status(500).json({ message: "Error updating order and dish" });
  }
};
