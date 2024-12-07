import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClimbingBoxLoader } from "react-spinners";
import axios from 'axios';

const AdminDetails = () => {
    const [expandedAdminId, setExpandedAdminId] = useState(null);
    const [cityNameFilter, setCityNameFilter] = useState('');
    const [emailFilter, setEmailFilter] = useState('');
    const [idFilter, setIdFilter] = useState('');
    const [adminData, setAdminData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const res = await axios.post('/api/getAllAdminInfo');
                setAdminData(res.data);  // Set the data to state
                setLoading(false);  // Stop loading once data is fetched
            } catch (err) {
                console.error('Failed to load admin data:', err);  // Handle error
                setLoading(false);  // Stop loading even in case of error
            }
        };

        fetchAdminData();  // Call the async function
    }, []);
   
    const filteredAdmins = adminData.filter((admin) => {
        const cityNameMatch = cityNameFilter === '' || admin.cityName.toLowerCase().includes(cityNameFilter.toLowerCase());
        const emailMatch = emailFilter === '' || admin.email.toLowerCase().includes(emailFilter.toLowerCase());
        const idMatch = idFilter === '' || admin._id.toLowerCase().includes(idFilter.toLowerCase());

        return cityNameMatch && emailMatch && idMatch;
    });

    const toggleAdminExpansion = (adminId) => {
        setExpandedAdminId((prevId) => (prevId === adminId ? null : adminId));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen overflow-hidden">
                <ClimbingBoxLoader color={'#123abc'} />
            </div>
        );
    }

    return (
        <div className="flex-1 p-8">
            <h1 className="text-3xl font-bold mb-8">Admin Details</h1>

            {/* Filter Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                <input
                    type="text"
                    placeholder="Filter by City Name"
                    value={cityNameFilter}
                    onChange={(e) => setCityNameFilter(e.target.value)}
                    className="border p-2 rounded w-full"
                />
                <input
                    type="email"
                    placeholder="Filter by Email"
                    value={emailFilter}
                    onChange={(e) => setEmailFilter(e.target.value)}
                    className="border p-2 rounded w-full"
                />
                <input
                    type="text"
                    placeholder="Filter by Admin ID"
                    value={idFilter}
                    onChange={(e) => setIdFilter(e.target.value)}
                    className="border p-2 rounded w-full"
                />
            </div>

            {filteredAdmins.length === 0 && (
                <p className="text-center text-gray-500">No admins found matching the filters</p>
            )}

            {filteredAdmins.map((admin) => (
                <motion.div
                    key={admin._id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white shadow-lg p-4 rounded-lg mt-4"
                >
                    {/* Admin Info */}
                    <motion.div
                        className="cursor-pointer"
                        onClick={() => toggleAdminExpansion(admin._id)}
                        whileHover={{ scale: 1.02 }}
                    >
                        <h2 className="text-2xl font-bold">{admin.name}</h2>
                        <p className="text-gray-600">Email: {admin.email}</p>
                        <p className="text-gray-600">Phone: {admin.phoneNumber}</p>
                        <p className="text-gray-600">City: {admin.cityName}</p>
                        <p className="text-gray-600">Responsible For: {admin.responsibleAdmin}</p>
                    </motion.div>

                    {/* Expanded Admin Details */}
                    <AnimatePresence>
                        {expandedAdminId === admin._id && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 overflow-hidden"
                            >
                                <p className="text-lg font-semibold">Verified Provider Emails:</p>
                                <ul className="list-disc ml-6 mt-2">
                                    {admin.verifiedProviderEmails.map((email, index) => (
                                        <li key={index} className="text-gray-600">{email}</li>
                                    ))}
                                </ul>

                                <p className="text-lg font-semibold mt-4">Verified Delivery Boy Emails:</p>
                                <ul className="list-disc ml-6 mt-2">
                                    {admin.verifiedDeliveryBoyEmails.map((email, index) => (
                                        <li key={index} className="text-gray-600">{email}</li>
                                    ))}
                                </ul>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            ))}
        </div>
    );
};

export default AdminDetails;
