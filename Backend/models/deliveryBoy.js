import mongoose from 'mongoose';

const { Schema } = mongoose;

// Define the schema for the 'DeliveryBoy' model
const deliveryBoySchema = new Schema({
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
  licenseNumber: {
    type: String,
    required: true,
    trim: true, // Removes leading and trailing spaces
    unique: true // Ensure the license number is unique
  },
  licensePhoto: {
    type: Buffer, // Store the path or URL to the license photo
    required: true
  },
  vehicleNumber: {
    type: String,
    required: true,
    trim: true,
    unique: true // Ensure the vehicle number is unique
  },
  vehicleName: {
    type: String,
    required: true,
    trim: true
  },
  cityName: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: Boolean,
    default: false
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
  },
  password: {
    type: String,
    required: true,
    minlength: 6 // Ensures password has a minimum length of 6 characters
  }
});

// Create the model
const DeliveryBoy = mongoose.model('DeliveryBoy', deliveryBoySchema);

export default DeliveryBoy;
