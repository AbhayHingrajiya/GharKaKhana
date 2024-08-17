import FoodConsumer from '../models/FoodConsumer.js'; 
import DeliveryBoy from '../models/deliveryBoy.js'; 
import FoodProvider from '../models/FoodProvider.js'; 

export const signUpFoodConsumer = async (req, res) => {
    const { name, email, phoneNumber, password } = req.body;
  
    try {
      // Create a new instance of the foodConsumer model
      const foodConsumer = new FoodConsumer({
        name,
        email,
        phoneNumber,
        password
      });
  
      // Save the foodConsumer to the database
      await foodConsumer.save();
  
      // Send a response back to the client
      res.status(201).json({
        message: 'foodConsumer created successfully',
        foodConsumer: {
          id: foodConsumer._id,
          name: foodConsumer.name,
          email: foodConsumer.email,
          phoneNumber: foodConsumer.phoneNumber
          // Do not send the password back in the response
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

    try {
    // Create a new instance of the foodProvider model
    const foodProvider = new FoodProvider({
        name,
        email,
        phoneNumber,
        password
    });

    // Save the foodProvider to the database
    await foodProvider.save();

    // Send a response back to the client
    res.status(201).json({
        message: 'foodProvider created successfully',
        foodProvider: {
        id: foodProvider._id,
        name: foodProvider.name,
        email: foodProvider.email,
        phoneNumber: foodProvider.phoneNumber
        // Do not send the password back in the response
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
  const { name, email, phoneNumber, licenseNumber, licensePhoto, vehicleNumber, vehicleName, password } = req.body;

  try {
    // Create a new instance of the DeliveryBoy model
    const deliveryBoy = new DeliveryBoy({
      name,
      email,
      phoneNumber,
      licenseNumber,
      licensePhoto,
      vehicleNumber,
      vehicleName,
      password
    });

    // Save the deliveryBoy to the database
    await deliveryBoy.save();

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
        vehicleName: deliveryBoy.vehicleName
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
};
