import mongoose from 'mongoose';

const { Schema } = mongoose;

// Define the schema for the 'FoodProvider' model
const foodProviderSchema = new Schema({
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
  cityName: {
    type: String,
    required: true,
    trim: true
  },
  aadhaarPhoto: {
    type: Buffer, // Store photo as binary data (bytes)
    required: [true, 'Aadhaar photo is required'],
  },
  aadhaarNumber: {
    type: String,
    required: [true, 'Aadhaar number is required'],
    unique: true,
    match: [/^\d{12}$/, 'Enter a valid 12-digit Aadhaar number'],
  },
  password: {
    type: String,
    required: true,
    minlength: 6 // Ensures password has a minimum length of 6 characters
  },
  varify: {
    type: Boolean,
    default: false
  },
  adminComment: {
    type: String,
    default: 'No admin comments'
  },
  profilePic: {
    type: String,
    default: 'default'
  },
  negativeScore: {
    type: Number,
    default: 0
  },
  blockStatus: {
    type: Boolean,
    default: false
  }
});

// Create the model
const FoodProvider = mongoose.model('FoodProvider', foodProviderSchema);

export default FoodProvider;
