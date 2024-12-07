import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import Navbar from '../navbar/Navbar';

const ProfilePage = () => {

    const initialProfileData = {
        name: 'John Doe',
        email: 'johndoe@example.com',
        phoneNumber: '123-456-7890',
        profilePic: '1.png',
    };

    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState(initialProfileData);
    const [tempProfileData, setTempProfileData] = useState(initialProfileData); // Temporary state for unsaved changes
    const [paymentData, setPaymentData] = useState([
        { dishName: 'Pasta', orderId: 'ORD123', date: '2024-12-01', total: 250, quantity: 2, status: 'Pending' },
        { dishName: 'Burger', orderId: 'ORD124', date: '2024-12-02', total: 150, quantity: 1, status: 'Completed' },
    ]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch user info
                const userRes = await axios.post('/api/getMe');
                setProfileData(userRes.data);
                setTempProfileData(userRes.data);

                // Fetch provider payment details
                const paymentRes = await axios.post('/api/getProviderPaymentDetails');
                setPaymentData(paymentRes.data);

            } catch (error) {
                console.error('Error fetching data:', error.message);
            }
        };

        fetchData();
    }, []);

    const handleEditToggle = () => {
        if (isEditing) {
            setTempProfileData(profileData); // Reset changes when canceling
        }
        setIsEditing(!isEditing);
    };

    const handleProfileChange = (e) => {
        setTempProfileData({
            ...tempProfileData,
            [e.target.name]: e.target.value,
        });
    };

    const handleProfilePicChange = (pic) => {
        setTempProfileData({
            ...tempProfileData,
            profilePic: pic,
        });
    };

    const handleSaveChanges = async () => {
        try {
            // Update the profile data in the frontend state
            setProfileData(tempProfileData);
            setIsEditing(false);

            // Send the updated data to the backend
            const res = await axios.post('/api/profileEdit', tempProfileData);

            // Optional: Provide feedback to the user based on the response
            if (res.status === 200) {
                console.log('Profile updated successfully!');
            } else {
                console.error('Something went wrong while updating the profile.');
            }
        } catch (err) {
            console.error('Error updating profile:', err);
        }
    };


    const handleCancelChanges = () => {
        setTempProfileData(profileData); // Revert changes
        setIsEditing(false);
    };

    return (
        <>
            <Navbar activeLink = 'profile' />
            <div className="max-w-4xl mx-auto p-4 pt-20">
                {/* Profile Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white p-6 rounded-lg shadow-lg mb-6"
                >
                    <div className="flex items-center mb-4">
                        <img
                             src={profileData.profilePic != 'default' ? `/src/assets/Profile picture/${profileData.profilePic}` : `/src/assets/Profile picture/1.png`} 
                            alt="Profile"
                            className="w-20 h-20 rounded-full object-cover mr-4"
                        />
                        <div>
                            <h2 className="text-2xl font-semibold">{profileData.name}</h2>
                            <p className="text-sm text-gray-600">{profileData.email}</p>
                            <p className="text-sm text-gray-600">{profileData.phoneNumber}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleEditToggle}
                        className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600"
                    >
                        {isEditing ? 'Cancel' : 'Edit Profile'}
                    </button>
                </motion.div>

                {/* Edit Profile Section */}
                {isEditing && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="bg-white p-6 rounded-lg shadow-lg"
                    >
                        <div className="mb-4">
                            <label className="block text-sm font-semibold">Name</label>
                            <input
                                type="text"
                                name="name"
                                value={tempProfileData.name}
                                onChange={handleProfileChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-semibold">Profile Picture</label>
                            <div className="grid grid-cols-5 gap-2">
                                {[...Array(20)].map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleProfilePicChange(`${index + 1}.png`)}
                                        className={`w-16 h-16 border-2 rounded-md ${tempProfileData.profilePic === `${index + 1}.png` ? 'border-blue-500' : 'border-gray-300'}`}
                                    >
                                        <img
                                            src={`/src/assets/Profile picture/${index + 1}.png`}
                                            alt={`Profile ${index + 1}`}
                                            className={`w-full h-full object-cover ${tempProfileData.profilePic === `${index + 1}.png` ? 'scale-110' : ''}`}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-between">
                            <button
                                onClick={handleSaveChanges}
                                className="px-6 py-2 bg-green-500 text-white rounded-md shadow-md hover:bg-green-600"
                            >
                                Save Changes
                            </button>
                            <button
                                onClick={handleCancelChanges}
                                className="px-6 py-2 bg-red-500 text-white rounded-md shadow-md hover:bg-red-600"
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Payment Table Section */}
                {profileData.type == 'foodProvider' && <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white p-6 rounded-lg shadow-lg mt-6"
                >
                    <h3 className="text-xl font-semibold mb-4">Payment Details</h3>
                    <table className="min-w-full table-auto">
                        <thead>
                            <tr className="border-b">
                                <th className="px-4 py-2 text-left">Dish Name</th>
                                <th className="px-4 py-2 text-left">Order ID</th>
                                <th className="px-4 py-2 text-left">Date</th>
                                <th className="px-4 py-2 text-left">Total Rs</th>
                                <th className="px-4 py-2 text-left">Quantity</th>
                                <th className="px-4 py-2 text-left">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paymentData.map((payment, index) => (
                                <tr key={index} className="border-b">
                                    <td className="px-4 py-2">{payment.dishName}</td>
                                    <td className="px-4 py-2">{payment.orderId}</td>
                                    <td className="px-4 py-2">{new Date(payment.date).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
                                    <td className="px-4 py-2">{payment.quantity * payment.dishPrice}</td>
                                    <td className="px-4 py-2">{payment.quantity}</td>
                                    <td className="px-4 py-2">
                                        <span
                                            className={`px-3 py-1 rounded-full text-sm ${payment.status === 'Completed' ? 'bg-green-200 text-green-600' : 'bg-yellow-200 text-yellow-600'
                                                }`}
                                        >
                                            {payment.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </motion.div>}
            </div>
        </>
    );
};

export default ProfilePage;
