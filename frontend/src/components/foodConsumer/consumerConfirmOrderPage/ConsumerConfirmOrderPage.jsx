import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ConsumerConfirmOrderPage = ({moveToConsumerConfirmOrderPageChangeFun, orderInfo}) => {

  const defaultAddresses = [
    "123, MG Road, Bangalore - 560001",
    "Flat 45B, Whitefield, Bangalore - 560066",
    "Plot 18, Electronic City, Bangalore - 560100",
  ];

  const [addresses, setAddresses] = useState(defaultAddresses);
  const [selectedAddress, setSelectedAddress] = useState(addresses[0]);
  const [newAddress, setNewAddress] = useState('');
  const [addingAddress, setAddingAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');

  const totalAmount = orderInfo.reduce((total, item) => total + item.dish.dishPrice * item.quantity, 0);
  const gst = (totalAmount * 0.18).toFixed(2);
  const deliveryCharge = 50;

  const handleAddressChange = (address) => {
    setSelectedAddress(address);
  };

  const handlePaymentChange = (method) => {
    setPaymentMethod(method);
  };

  useEffect( () => {
    window.scrollTo({
        top: 0
    });
  }, [])

  const addNewAddress = () => {
    if (newAddress.trim()) {
      setAddresses([...addresses, newAddress]);
      setSelectedAddress(newAddress);
      setNewAddress('');
      setAddingAddress(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Dish Info Section */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white shadow-lg rounded-lg p-4 mb-4">
        <h2 className="text-xl font-semibold mb-4">Dish Details</h2>
        {orderInfo.map(({ dish, itemInfo, quantity }) => (
          <motion.div
            key={dish._id}
            className="flex justify-between p-2 border-b hover:bg-gray-100 transition duration-200"
          >
            <div>
              <span className="block font-bold">{dish.dishName}</span>
              {itemInfo.map((item) => (
                <div key={item._id} className="text-sm text-gray-500">
                  {item.itemName} - {item.itemQuantity} {item.itemFlavor && `(${item.itemFlavor})`}
                </div>
              ))}
            </div>
            <div className="flex items-center">
              <span>{quantity} x ₹{dish.dishPrice}</span>
              <span className="ml-6">₹{quantity * dish.dishPrice}</span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Address Selection Section */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white shadow-lg rounded-lg p-4 mb-4">
        <h2 className="text-xl font-semibold mb-4">Select Address</h2>
        <div className="flex flex-col space-y-2">
          {addresses.map((address, index) => (
            <motion.label
              key={index}
              whileHover={{ scale: 1.02 }}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="radio"
                name="address"
                value={address}
                checked={selectedAddress === address}
                onChange={() => handleAddressChange(address)}
                className="cursor-pointer"
              />
              <span className="hover:text-green-600 transition duration-200">{address}</span>
            </motion.label>
          ))}
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="mt-2 text-blue-600 hover:underline"
            onClick={() => setAddingAddress(!addingAddress)}
          >
            {addingAddress ? "Cancel" : "Add New Address"}
          </motion.button>

          {/* New Address Input */}
          {addingAddress && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2">
              <input
                type="text"
                placeholder="Enter new address"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="mt-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200"
                onClick={addNewAddress}
              >
                Save Address
              </motion.button>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Payment Option Section */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white shadow-lg rounded-lg p-4 mb-4">
        <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
        <div className="flex flex-col space-y-2">
          <motion.label className="flex items-center space-x-2">
            <input
              type="radio"
              name="payment"
              value="cod"
              checked={paymentMethod === 'cod'}
              onChange={() => handlePaymentChange('cod')}
              className="cursor-pointer"
            />
            <span>Cash on Delivery (COD)</span>
          </motion.label>
          <motion.label className="flex items-center space-x-2">
            <input
              type="radio"
              name="payment"
              value="online"
              checked={paymentMethod === 'online'}
              onChange={() => handlePaymentChange('online')}
              className="cursor-pointer"
            />
            <span>Online Payment</span>
          </motion.label>
        </div>
      </motion.div>

      {/* Total Charges Section */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white shadow-lg rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">Total Charges</h2>
        <div className="flex justify-between mb-2">
          <span>Dish Total</span>
          <span>₹{totalAmount}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span>GST (18%)</span>
          <span>₹{gst}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span>Delivery Charge</span>
          <span>₹{deliveryCharge}</span>
        </div>
        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>₹{totalAmount + parseFloat(gst) + deliveryCharge}</span>
        </div>
      </motion.div>
    
        {/* Buttons Section */}
        <div className="flex justify-between mt-4">
        {/* Back Button */}
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition duration-200"
            onClick={moveToConsumerConfirmOrderPageChangeFun}
        >
            Back
        </motion.button>

        {/* Place Order Button */}
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition duration-200"
        >
            Place Order
        </motion.button>
        </div>

    </div>
  );
};

export default ConsumerConfirmOrderPage;
