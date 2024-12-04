import FoodProvider from '../models/FoodProvider.js';
import FoodConsumer from '../models/FoodConsumer.js';
import DishInfo from '../models/DishInfo.js';
import ItemDetails from '../models/itemDetails.js';
import DishStatus from '../models/DishStatus.js';
import OrderInfo from '../models/OrderInfo.js';
import DeliveryBoy from '../models/DeliveryBoy.js';
import AdminDetails from '../models/AdminDetails.js';
import multer from 'multer';
import bcrypt from 'bcrypt';

// Set up multer storage (memory storage for direct buffer use)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

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

export const getAdminDeliveryBoyInfo = async (req, res) => {
  try {
      // Fetch all delivery boys
      const deliveryBoys = await DeliveryBoy.find({}).lean();

      // Fetch all orders and map them to their respective delivery boys
      const orders = await OrderInfo.find({}).populate('consumerId', 'name').lean();

      const result = deliveryBoys.map((deliveryBoy) => {
          // Filter orders assigned to the current delivery boy
          const deliveryBoyOrders = orders
              .filter((order) => order.deliveryBoyId?.toString() === deliveryBoy._id.toString())
              .map((order) => ({
                  _id: order._id,
                  orderName: `Order ${order._id}`,
                  consumerAddress: order.consumerAddress,
                  dishIds: Object.keys(order.dishInfo || {}), // Convert Map to object and get keys
                  cancelDishIds: order.cancelDishes.map((dishId) => dishId.toString()),
                  deliveryDate: order.completeDeliveryDate
                      ? order.completeDeliveryDate.toISOString().split('T')[0]
                      : 'Pending',
                  status: order.status,
              }));

          return {
              deliveryBoyInfo: {
                  _id: deliveryBoy._id,
                  name: deliveryBoy.name,
                  email: deliveryBoy.email,
                  phoneNumber: deliveryBoy.phoneNumber,
                  vehicleName: deliveryBoy.vehicleName,
                  vehicleNumber: deliveryBoy.vehicleNumber,
                  licenseNumber: deliveryBoy.licenseNumber,
                  cityName: deliveryBoy.cityName,
              },
              orders: deliveryBoyOrders,
          };
      });

      // Send the response
      res.status(200).json(result);
  } catch (error) {
      console.error('Error fetching delivery boy info:', error);
      res.status(500).json({ error: 'Failed to fetch delivery boy info' });
  }
};

export const getAllPendingVerificationRequests = async (req, res) => {
  const adminId = req.userId;

  try {
    const admin = await AdminDetails.findById(adminId, { city: 1 });
    const cityName = admin.city

    // Fetch pending providers and delivery boys matching the cityName
    const [providers, deliveryBoys] = await Promise.all([
      FoodProvider.find({ cityName, varify: false }).select(
        '_id name email phoneNumber aadhaarPhoto aadhaarNumber'
      ),
      DeliveryBoy.find({ cityName, varify: false }).select(
        '_id name email phoneNumber licenseNumber licensePhoto vehicleName vehicleNumber cityName'
      ),
    ]);

    const formattedProviders = providers.map((provider) => ({
      _id: provider._id,
      name: provider.name,
      email: provider.email,
      phoneNumber: provider.phoneNumber,
      type: 'provider',
      aadharCardNumber: provider.aadhaarNumber,
      aadhaarCardPhoto: provider.aadhaarPhoto
        ? `data:image/jpeg;base64,${provider.aadhaarPhoto.toString('base64')}`
        : null, // Handle cases where there is no photo
    }));

    const formattedDeliveryBoys = deliveryBoys.map((deliveryBoy) => ({
      _id: deliveryBoy._id,
      name: deliveryBoy.name,
      email: deliveryBoy.email,
      phoneNumber: deliveryBoy.phoneNumber,
      type: 'deliveryBoy',
      licenseNumber: deliveryBoy.licenseNumber,
      vehicleName: deliveryBoy.vehicleName,
      vehicleNumber: deliveryBoy.vehicleNumber,
      cityName: deliveryBoy.cityName,
      licensePhoto: deliveryBoy.licensePhoto
      ? `data:image/jpeg;base64,${deliveryBoy.licensePhoto.toString('base64')}`
      : null, // Handle cases where there is no photo
    }));

    // Combine the results
    const combinedResults = [...formattedProviders, ...formattedDeliveryBoys];

    // Send the response
    res.status(200).json(combinedResults);
  } catch (error) {
    console.error('Error fetching pending verification requests:', error);
    res.status(500).json({ message: 'Failed to fetch pending verification requests' });
  }
};

export const addNewAdmin = async (req, res) => {
  // Middleware to handle file upload
  upload.single('aadhaarPhoto')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        message: 'Error uploading Aadhaar photo',
        error: err.message,
      });
    }

    const {
      name,
      phoneNumber,
      email,
      aadhaarNumber,
      password,
      city,
    } = req.body;

    const adminId = req.userId

    try {
      // Validate required fields
      if (
        !name ||
        !phoneNumber ||
        !email ||
        !aadhaarNumber ||
        !password ||
        !city ||
        !req.file // Ensure Aadhaar photo is uploaded
      ) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      // Check if the admin already exists
      const existingAdmin = await AdminDetails.findOne({
        $or: [{ email }, { phoneNumber }, { aadhaarNumber }],
      });
      if (existingAdmin) {
        return res.status(400).json({
          message: 'Admin with this email, phone number, or Aadhaar already exists',
        });
      }

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create a new AdminDetails instance
      const newAdmin = new AdminDetails({
        name,
        phoneNumber,
        email,
        aadhaarPhoto: req.file.buffer, // Store the photo as bytes
        aadhaarNumber,
        password: hashedPassword, // Store the hashed password
        city,
        responsibleAdmin: adminId,
      });

      // Save the new admin to the database
      await newAdmin.save();

      // Respond with success
      res.status(201).json({
        message: 'Admin added successfully',
        admin: {
          id: newAdmin._id,
          name: newAdmin.name,
          email: newAdmin.email,
          phoneNumber: newAdmin.phoneNumber,
          city: newAdmin.city,
          responsibleAdmin: newAdmin.responsibleAdmin,
        },
      });
    } catch (error) {
      // Handle errors
      res.status(500).json({
        message: 'An error occurred while adding the admin',
        error: error.message,
      });
    }
  });
};

export const checkAdminLoginStatus = async (req, res) => {
  try {
    const adminId = req.userId;

    // Find the admin by ID
    const admin = await AdminDetails.findById(adminId);
    if (!admin) {
      return res.status(404).json({ isLoggedIn: false, message: 'Admin not found' });
    }

    // Respond with success
    res.status(200).json({
      isLoggedIn: true,
      message: 'Admin is logged in',
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (error) {
    // Handle errors like token expiration or invalid token
    res.status(401).json({
      isLoggedIn: false,
      message: 'Invalid or expired token',
      error: error.message,
    });
  }
};

export const getAllAdminInfo = async (req, res) => {
  const checkForLogin = req.userId;
  
  if (!checkForLogin) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // Fetch the admin data from the database
    const admins = await AdminDetails.find();

    // Map the admin data to the desired format
    const adminData = admins.map((admin) => ({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      phoneNumber: admin.phoneNumber,
      cityName: admin.city,
      responsibleAdmin: admin.responsibleAdmin,
      verifiedProviderEmails: admin.verifyProviders, 
      verifiedDeliveryBoyEmails: admin.verifyDeliveryBoy,
    }));

    // Send the formatted data as the response
    res.status(200).json(adminData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
