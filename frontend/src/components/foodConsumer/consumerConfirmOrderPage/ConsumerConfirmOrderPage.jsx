import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import {load} from '@cashfreepayments/cashfree-js';

const ConsumerConfirmOrderPage = ({moveToConsumerConfirmOrderPageChangeFun, deliveryDates, orderInfo}) => {

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(addresses[0]);
  const [addingAddress, setAddingAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [transactionId, setTransactionId] = useState(null)
  const cashfreeRef  = useRef(null);

  const totalAmount = orderInfo.reduce((total, item) => total + item.dish.dishPrice * item.quantity, 0);
  let gst = (totalAmount * 0.18).toFixed(2);
  const deliveryCharge = 50;

  const handleAddressChange = (address) => {
    setSelectedAddress(address);
  };

  const handlePaymentChange = (method) => {
    setPaymentMethod(method);
  };

  useEffect(() => {
    // Scroll to top
    window.scrollTo({
      top: 0,
    });

    // Initialize the Cashfree SDK
    const initializeSDK = async () => {
      try {
        cashfreeRef.current = await load({
          mode: 'sandbox', // Correctly use 'sandbox' or 'production'
        });
      } catch (error) {
        console.error('Error initializing Cashfree SDK:', error);
      }
    };

    // Initialize Cashfree SDK
    initializeSDK();

    // Fetch consumer address
    (async () => {
      try {
        const res = await axios.post('/api/getConsumerAddress');
        if (res.status === 200) {
          setAddresses(res.data);
        } else {
          console.error("Can't get response in getConsumerAddress");
        }
      } catch (err) {
        console.error('Error fetching addresses: ', err);
      }
    })();
  }, []);

  const addNewAddress = async () => {
    try{
      const address = document.getElementById('newAddress').value;
      const cityName = document.getElementById('newCityname').value;
      const pincode = document.getElementById('newPincode').value;
      const fullAddress = address + ', ' + cityName + ', ' + pincode;
      const res = await axios.post('/api/addNewAddress', {fullAddress});
      if(res.status == 200){
        setAddresses((addr) => [
          ...addr,
          fullAddress
        ]);
        setAddingAddress(false);
      }else{
        console.error('Error in get res in addNewAddress at frontend side')
      }
    }catch (error){
      console.error('Error in addNewAddress in fronend side: '+error);
    }
  };

  const getSessionId = async (totalAmount) => {
    try {
        const response = await axios.post('/api/getSessionId', { totalAmount });

        // Set transaction ID from the response
        setTransactionId(response.data.order_id);

        // Return the session ID
        return response.data.session_id;
    } catch (error) {
        console.error('Error fetching session ID:', error.response ? error.response.data : error.message);
        throw new Error('Failed to fetch session ID.');
    }
  };


  const verifyPayment = async ( TI ) => {
    try {
        // Await API response
        const res = await axios.post('/api/verifyPayment', { transactionId: TI });

        // Check response validity
        if (res.data && res.data.success) {
            alert('Payment Successful');
        } else {
            console.warn('Payment verification failed:', res.data);
            alert('Payment verification failed. Please contact support.');
        }
    } catch (error) {
        // Log and handle errors
        console.error('Error during payment verification:', error);
        alert('An error occurred while verifying your payment. Please try again later.');
    }
  };


  const confirmPlaceOrder = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    // Parse GST safely
    const parsedGst = parseFloat(gst);

    // Calculate delivery date
    const deliveryDate =
        Object.keys(deliveryDates).length === 0
            ? null // Handle empty set
            : new Date(
                  Math.max(...Object.values(deliveryDates).map(dateString => new Date(dateString)))
              );

    let flagForCheckPaymentStatus = true;

    // Handle online payment
    if (paymentMethod === 'online') {
        try {
            const sessionId = await getSessionId(totalAmount+parsedGst+deliveryCharge); // Get session ID for payment
            const checkoutOptions = {
                paymentSessionId: sessionId,
                redirectTarget: '_modal',
            };
            await cashfreeRef.current.checkout(checkoutOptions); // Initialize payment

            // Call verification API
            if(transactionId) await verifyPayment(transactionId);
            flagForCheckPaymentStatus = true;
        } catch (error) {
            flagForCheckPaymentStatus = false;
            console.error('Error during online payment process:', error);
            alert('Failed to process online payment. Please try again.');
            return; // Exit to avoid proceeding without successful payment
        }
    }

    if (!flagForCheckPaymentStatus) return;

    // Add the new order
    try {
        const response = await axios.post('/api/addNewOrder', {
            orderInfo,
            paymentMethod,
            selectedAddress,
            totalAmount,
            gst: parsedGst,
            deliveryCharge,
            deliveryDate,
            transactionId
        });

        if (response.status === 201) {
            alert('Order placed successfully!');
        } else {
            console.error('Unexpected error in addNewOrder response');
            alert('Something went wrong while placing your order.');
        }
    } catch (error) {
        if (error.response && error.response.status === 400) {
            alert('Unfortunately, we do not have enough quantity available to fulfill your order.');
        } else {
            console.error('Error in addNewOrder request:', error);
            alert('An error occurred while placing the order. Please try again later.');
        }

        // Handle payment refunds for online payments
        if (paymentMethod === 'online' && flagForCheckPaymentStatus) {
            try {
                const refundResponse = await axios.post('/api/refundPayment');
                if (refundResponse.status === 200) {
                    alert("Don't worry! You will receive your payment shortly.");
                } else {
                    console.warn('Refund request failed but no critical error reported.');
                }
            } catch (refundError) {
                console.error('Error during refund process:', refundError);
                alert('We encountered an issue while processing your refund. Please contact support.');
            }
        }
    }
    window.location.reload();
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
                checked={selectedAddress == address}
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
              <div className="flex gap-4 w-full">
                
                {/* Address Column */}
                <motion.div 
                  whileHover={{ scale: 1.02 }} 
                  className="w-2/3"
                >
                  <textarea
                    id='newAddress'
                    placeholder="Enter new address"
                    className="w-full border border-gray-300 rounded-md h-[100px] p-2"
                  />

                </motion.div>

                {/* Pincode and City Name Column */}
                <motion.div 
                  whileHover={{ scale: 1.02 }} 
                  className="w-1/3 space-y-4"
                >
                  <input
                    type="text"
                    id='newCityname'
                    placeholder="Enter city name"
                    className="w-full border border-gray-300 rounded-md p-2"
                  />
                  <input
                    type="text"
                    id='newPincode'
                    placeholder="Enter pincode"
                    className="w-full border border-gray-300 rounded-md p-2"
                  />
                </motion.div>

              </div>

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
            onClick={confirmPlaceOrder}
        >
            Place Order
        </motion.button>
        </div>

    </div>
  );
};

export default ConsumerConfirmOrderPage;
