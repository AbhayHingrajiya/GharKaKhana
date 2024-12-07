import mongoose from 'mongoose';

const { Schema } = mongoose;

// Define the schema for the 'PaymentDetails' model
const paymentDetailsSchema = new Schema({
  dishId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DishInfo',
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OrderInfo',
    required: true
  },
  dishName: {
    type: String
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  dishPrice: {
    type: Number,
    required: true, // Total amount for the order
    min: [0, 'Total must be a positive number'] // Ensures the total is positive
  },
  quantity: {
    type: Number,
    required: true, // Quantity of the dish ordered
    min: [1, 'Quantity must be at least 1'] // Ensures quantity is at least 1
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'Completed', 'Failed'], // Only allows these statuses
    default: 'Pending' // Default status is 'Pending'
  },
  cityName: {
    type: String,
    required: true,
    trim: true
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoodProvider',
    required: true
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

// Create the model
const PaymentDetails = mongoose.model('PaymentDetails', paymentDetailsSchema);

export default PaymentDetails;
