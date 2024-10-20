import mongoose from 'mongoose';

const { Schema } = mongoose;

// Define the schema for the 'FoodConsumer' model
const foodConsumerSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true // Removes leading and trailing spaces
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ensure the email is unique
    lowercase: true, // Converts email to lowercase before saving
    trim: true, // Removes leading and trailing spaces
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'] // Validates email format
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true, // Ensure the phone number is unique
    trim: true, // Removes leading and trailing spaces
    match: [/^\d{10}$/, 'Please enter a valid 10-digit phone number'] // Validates a 10-digit phone number format
  },
  address: {
    type: [String],
    default: []
  },
  password: {
    type: String,
    required: true,
    minlength: 6 // Ensures password has a minimum length of 6 characters
  }
});

// Create the model
const FoodConsumer = mongoose.model('FoodConsumer', foodConsumerSchema);

export default FoodConsumer;
