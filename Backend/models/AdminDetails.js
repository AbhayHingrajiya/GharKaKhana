import mongoose from 'mongoose';

const AdminDetailsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    match: [/^[6-9]\d{9}$/, 'Enter a valid phone number'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      'Enter a valid email address',
    ],
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
  verifyProviders: {
    type: Array,
    default: []
  },
  verifyDeliveryBoy: {
    type: Array,
    default: []
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
  },
  city: {
    type: String,
    required: [true, 'City name is required'],
  },
  responsibleAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    // ref: 'AdminDetails', // Reference to the same AdminDetails model
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const AdminDetails = mongoose.model('AdminDetails', AdminDetailsSchema);

export default AdminDetails;
