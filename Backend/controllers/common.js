import FoodConsumer from '../models/FoodConsumer.js'; 
import DeliveryBoy from '../models/DeliveryBoy.js'; 
import FoodProvider from '../models/FoodProvider.js';
import AdminDetails from '../models/AdminDetails.js';
import axios from 'axios';

export const getMe = async (req, res) => {
    try{
        const response = await axios.post('http://localhost:3000/api/getUserId', {}, {
            headers: {
                Cookie: req.headers.cookie // Forward the cookies to the axios request
            }
        });
        if(response.status == 200){
            const userId = response.data.userId;
            const userTypes = [
                { type: 'foodConsumer', model: FoodConsumer },
                { type: 'deliveryBoy', model: DeliveryBoy },
                { type: 'foodProvider', model: FoodProvider },
                { type: 'admin', model: AdminDetails }
            ];
      
            for (const userType of userTypes) {
                const user = await userType.model.findOne({ _id: userId });
      
                if (user) {
                    return res.status(200).json({
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        phoneNumber: user.phoneNumber,
                        profilePic: user.profilePic,
                        type: userType.type
                    });
                }
            }
        }else{
            return res.status(401).json({ message: 'Error in getMe: Can not get user id' });
        }
    }catch(error){
        return res.status(401).json({ message: 'Error in getMe: Token is not valid' });
    }
};

export const profileEdit = async (req, res) => {
    try {
      const userId = req.userId;
      const updatedProfileData = req.body; // The updated profile data sent from the frontend
  
      // Determine the user model based on the type
      let userModel;
      if (updatedProfileData.type === 'foodConsumer') {
        userModel = FoodConsumer;
      } else if (updatedProfileData.type === 'deliveryBoy') {
        userModel = DeliveryBoy;
      } else if (updatedProfileData.type === 'foodProvider') {
        userModel = FoodProvider;
      } else {
        return res.status(400).json({ message: 'Invalid user type provided' });
      }
  
      // Update the user's profile in the database
      const updatedUser = await userModel.findByIdAndUpdate(
        userId,
        updatedProfileData,
        { new: true, runValidators: true } // Return the updated document and validate the input
      );
  
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
    } catch (err) {
      console.error('Error updating profile:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  