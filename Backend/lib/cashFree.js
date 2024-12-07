import { Cashfree } from 'cashfree-pg'
import FoodConsumer from '../models/FoodConsumer.js';
import {v4 as uuidv4} from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

Cashfree.XClientId = process.env.CASHFREE_ID;
Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY;
Cashfree.XEnvironment = Cashfree.Environment.SANDBOX;

export const getSessionId = async (req, res) => {
    try {
        // Extract required data
        const { totalAmount } = req.body;
        const consumerId = req.userId;

        if (!totalAmount || !consumerId) {
            return res.status(400).json({ success: false, message: "Invalid request data." });
        }

        // Fetch consumer details from the database
        const consumer = await FoodConsumer.findById(consumerId).select('name email phoneNumber');

        if (!consumer) {
            return res.status(404).json({ success: false, message: "Consumer not found." });
        }

        const { name, email, phoneNumber } = consumer;

        // Prepare Cashfree order request
        const request = {
            order_amount: parseFloat(totalAmount.toFixed(2)),
            order_currency: 'INR',
            order_id: uuidv4(),
            customer_details: {
                customer_id: consumerId,
                customer_name: name,
                customer_email: email,
                customer_phone: phoneNumber,
            },
        };

        // Call Cashfree to create an order
        const result = await Cashfree.PGCreateOrder("2023-08-01", request);

        // Respond with the session details
        res.json({
            success: true,
            order_id: request.order_id,
            session_id: result.data.payment_session_id,
        });

    } catch (error) {
        console.error("Error processing payment:", error.response ? error.response.data : error);
        res.status(500).json({
            success: false,
            message: "Payment processing failed.",
            error: error.response ? error.response.data : error.message,
        });
    }
};

export const verifyPayment = async (req, res) => {
    const { transactionId } = req.body;

    try {
        // Fetch payment details using Cashfree's SDK
        const response = await Cashfree.PGOrderFetchPayment("2023-08-01", transactionId);

        // Handle successful response
        if (response && response.data) {
            return res.status(200).json({
                success: true,
                message: "Payment verification successful.",
                paymentDetails: response.data,
            });
        } else {
            // Handle unexpected response format
            return res.status(500).json({
                success: false,
                message: "Unexpected response from payment gateway.",
            });
        }
    } catch (error) {
        // Log error and return a user-friendly message
        console.error("Error during payment verification:", error.response?.data || error);

        return res.status(500).json({
            success: false,
            message: error.response?.data?.message || "An error occurred while verifying the payment. Please try again.",
        });
    }
};