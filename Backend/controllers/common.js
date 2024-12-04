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