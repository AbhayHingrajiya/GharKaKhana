import mongoose from 'mongoose';

const { Schema } = mongoose;

const dishInfoSchema = new Schema({
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoodProvider',
    required: true
  },
  dishName: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  cityName: {
    type: String,
    required: true
  },
  pincode: {
    type: String,
    required: true
  },
  dishPrice: {
    type: Number,
    required: true
  },
  dishQuantity: {
    type: Number,
    required: true
  },
  orderTill: {
    type: String,
    required: true
  },
  deliveryTill: {
    type: String,
    required: true
  },
  repeat: {
    type: [String],
    required: true
  },
  status: {
    type: String,
    default: 'Create'
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const DishInfo = mongoose.model('DishInfo', dishInfoSchema);

export default DishInfo;
