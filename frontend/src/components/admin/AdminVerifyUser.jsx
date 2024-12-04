import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../../assets/logoBlack.png';
import axios from 'axios'

const AdminVerifyUser = () => {
    const [comment, setComment] = useState('');
    const [expandedUserId, setExpandedUserId] = useState(null);
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');
    const [pendingUsers, setPendingUsers] = useState([]);
    const [ roleAndNumber, setRoleAndNumber ] = useState({role: '',number: ''})

    useEffect(() => {
        const fetchPendingVerificationRequests = async () => {
          try {
            const res = await axios.post('/api/getAllPendingVerificationRequests');
            console.log(res.data)
            setPendingUsers(res.data); // Assuming the response contains the pending users' data
          } catch (err) {
            console.error('Failed to fetch pending verification requests', err);
          }
        };
    
        fetchPendingVerificationRequests();
      }, []);

    const toggleUserExpansion = (id) => {
        setExpandedUserId((prevId) => (prevId === id ? null : id));
    };

    const handleAction = (id, action) => {
        console.log(`Action: ${action}`);
        console.log(`User ID: ${id}`);
        console.log(`Comment: ${comment}`);
        alert(`${action === 'verifyUser' ? 'Verified' : 'Blocked'} user with ID: ${id}`);
        setComment(''); // Clear comment field
    };

    const openImageModal = (imageUrl, number, role) => {
        setSelectedImage(imageUrl);
        setShowImageModal(true);
        setRoleAndNumber({role: role,number: number})
    };

    const closeImageModal = () => {
        setShowImageModal(false);
        setSelectedImage('');
        setRoleAndNumber({role: '',number: ''})
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-8">Pending Verification Requests</h1>
            {pendingUsers.length === 0 ? (
                <p className="text-gray-600 text-lg">No pending verification requests at the moment.</p>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {pendingUsers.map((user) => (
                        <motion.div
                            key={user._id}
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            className="bg-white shadow-lg p-4 rounded-lg"
                        >
                            {/* User Info */}
                            <motion.div
                                className="cursor-pointer"
                                onClick={() => toggleUserExpansion(user._id)}
                                whileHover={{ scale: 1.02 }}
                            >
                                <h2 className="text-xl font-bold">
                                    {user.name} ({user.type === 'provider' ? 'Provider' : 'Delivery Boy'})
                                </h2>
                                <p className="text-gray-600">Email: {user.email}</p>
                                <p className="text-gray-600">Phone: {user.phoneNumber}</p>
                            </motion.div>

                            {/* Expanded User Details */}
                            <AnimatePresence>
                                {expandedUserId === user._id && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden mt-4"
                                    >
                                        <p className="text-gray-600">ID: {user._id}</p>
                                        {user.type === 'provider' && (
                                            <div>
                                            <p className="text-gray-600">Aadhar Card Number: {user.aadharCardNumber}</p>
                                                <p className="text-gray-600">Aadhar Card:</p>
                                                <img
                                                    src={user.aadhaarCardPhoto}
                                                    alt="Adhar Card"
                                                    className="w-48 h-auto border rounded mt-2 cursor-pointer"
                                                    onClick={() => openImageModal(user.aadhaarCardPhoto,user.aadharCardNumber,'provider')}
                                                />
                                            </div>
                                        )}
                                        {user.type === 'deliveryBoy' && (
                                            <div>
                                                <p className="text-gray-600">License Number: {user.licenseNumber}</p>
                                                <p className="text-gray-600">Vehicle Name: {user.vehicleName}</p>
                                                <p className="text-gray-600">Vehicle Number: {user.vehicleNumber}</p>
                                                <p className="text-gray-600">City: {user.cityName}</p>
                                                <p className="text-gray-600">License Photo:</p>
                                                <img
                                                    src={user.licensePhoto}
                                                    alt="License Photo"
                                                    className="w-48 h-auto border rounded mt-2 cursor-pointer"
                                                    onClick={() => openImageModal(user.licensePhoto,user.vehicleNumber,'delivery')}
                                                />
                                            </div>
                                        )}

                                        {/* Comment Input */}
                                        <textarea
                                            placeholder="Add a comment (optional)"
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            className="w-full border mt-4 p-2 rounded"
                                        ></textarea>

                                        {/* Action Buttons */}
                                        <div className="flex gap-4 mt-4">
                                            <button
                                                onClick={() => handleAction(user._id, 'verifyUser')}
                                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                            >
                                                Verify User
                                            </button>
                                            <button
                                                onClick={() => handleAction(user._id, 'blockUser')}
                                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                            >
                                                Block User
                                            </button>
                                            <button
                                                onClick={() => handleAction(user._id, 'sendComment')}
                                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                            >
                                                Send Comment
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Image Modal */}
            {showImageModal && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full"
                    >
                        <img 
                            src={selectedImage} 
                            alt="Aadhaar Card" 
                            className="w-[600px] h-[400px] object-cover rounded border border-gray-300 shadow-md mb-4" 
                        />
                        <div className="text-center">
                            <p className="text-lg font-semibold text-gray-700 mb-2">{(roleAndNumber.role == 'provider') ? 'Aadhaar Card Number' : 'Vehicle Number' }</p>
                            <p className="text-xl font-bold text-gray-900">{roleAndNumber.number}</p>
                        </div>
                        <button
                            onClick={closeImageModal}
                            className="mt-4 bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 w-full"
                        >
                            Close
                        </button>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default AdminVerifyUser;
