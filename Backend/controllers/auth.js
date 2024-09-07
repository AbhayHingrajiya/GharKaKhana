import FoodConsumer from '../models/FoodConsumer.js'; 
import DeliveryBoy from '../models/deliveryBoy.js'; 
import FoodProvider from '../models/FoodProvider.js';
import { generateTokenAndSetCookie } from '../lib/generateToken.js'
import bcrypt from 'bcrypt';
import multer from 'multer';

// Set up multer storage (memory storage for direct buffer use)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

export const signUpFoodConsumer = async (req, res) => {
    const { name, email, phoneNumber, password } = req.body;
    const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);
  
    try {
      // Create a new instance of the foodConsumer model
      const foodConsumer = new FoodConsumer({
        name,
        email,
        phoneNumber,
        password: hashedPassword
      });
  
      // Save the foodConsumer to the database
      await foodConsumer.save();
      console.log('Consumer Added')
      
      generateTokenAndSetCookie(foodConsumer._id, res);
  
      // Send a response back to the client
      res.status(201).json({
        message: 'foodConsumer created successfully',
        foodConsumer: {
          id: foodConsumer._id,
          name: foodConsumer.name,
          email: foodConsumer.email,
          phoneNumber: foodConsumer.phoneNumber
        }
      });
    } catch (error) {
      // Handle errors, such as duplicate email or phone number
      res.status(400).json({
        message: 'Error creating foodConsumer',
        error: error.message
      });
    }
}; 

export const signUpFoodProvider = async (req, res) => {
    const { name, email, phoneNumber, password } = req.body;
    const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

    try {
    // Create a new instance of the foodProvider model
    const foodProvider = new FoodProvider({
        name,
        email,
        phoneNumber,
        password: hashedPassword
    });

    // Save the foodProvider to the database
    await foodProvider.save();

    generateTokenAndSetCookie(foodProvider._id, res);

    // Send a response back to the client
    res.status(201).json({
        message: 'foodProvider created successfully',
        foodProvider: {
        id: foodProvider._id,
        name: foodProvider.name,
        email: foodProvider.email,
        phoneNumber: foodProvider.phoneNumber
        }
    });
    } catch (error) {
    // Handle errors, such as duplicate email or phone number
    res.status(400).json({
        message: 'Error creating foodProvider',
        error: error.message
    });
    }
}; 

export const signUpDeliveryBoy = async (req, res) => {
  upload.single('licensePhoto')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: 'Error uploading file', error: err.message });
    }
    const { name, email, phoneNumber, licenseNumber, vehicleNumber, vehicleName, cityName, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    try {
      // Create a new instance of the DeliveryBoy model
      const deliveryBoy = new DeliveryBoy({
        name,
        email,
        phoneNumber,
        licenseNumber,
        licensePhoto: req.file.buffer,
        vehicleNumber,
        vehicleName,
        cityName,
        password: hashedPassword
      });

      // Save the deliveryBoy to the database
      await deliveryBoy.save();

      generateTokenAndSetCookie(deliveryBoy._id, res);

      // Send a response back to the client
      res.status(201).json({
        message: 'DeliveryBoy created successfully',
        deliveryBoy: {
          id: deliveryBoy._id,
          name: deliveryBoy.name,
          email: deliveryBoy.email,
          phoneNumber: deliveryBoy.phoneNumber,
          licenseNumber: deliveryBoy.licenseNumber,
          licensePhoto: deliveryBoy.licensePhoto,
          vehicleNumber: deliveryBoy.vehicleNumber,
          vehicleName: deliveryBoy.vehicleName,
          cityName: deliveryBoy.cityName
          // Do not send the password back in the response
        }
      });
    } catch (error) {
      // Handle errors, such as duplicate email or phone number
      res.status(400).json({
        message: 'Error creating DeliveryBoy',
        error: error.message
      });
    }
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
      const userTypes = [
          { type: 'foodConsumer', model: FoodConsumer },
          { type: 'deliveryBoy', model: DeliveryBoy },
          { type: 'foodProvider', model: FoodProvider }
      ];

      for (const userType of userTypes) {
          const user = await userType.model.findOne({ email: email });

          if (user) {
              const isPasswordCorrect = await bcrypt.compare(password, user.password);
              if (isPasswordCorrect) {
                  generateTokenAndSetCookie(user._id, res);
                  return res.status(200).json({
                      _id: user._id,
                      name: user.name,
                      email: user.email,
                      phoneNumber: user.phoneNumber,
                      type: userType.type
                  });
              } else {
                  return res.status(401).json({ message: 'Invalid password' });
              }
          }
      }

      // If no user is found after checking all models
      return res.status(404).json({ message: 'User not found' });

  } catch (error) {
      console.log("Error in login function: ", error.message);
      res.status(500).json({ message: 'Internal server error' });
  }
};
