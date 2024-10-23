import mongoose from 'mongoose';
const { Schema } = mongoose;

// Define the schema for 'OrderInfo'
const orderInfoSchema = new Schema({
  consumerId: {
    type: Schema.Types.ObjectId,
    ref: 'FoodConsumer',
    required: true
  },
  dishInfo: {
    type: Map, // Map object to store dishId and quantity
    of: Number, // dishId as key and quantity as value
    required: true
  },
  paymentMethod: {
    type: String,
    required: true
  },
  consumerAddress: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'delivered', 'canceled'], // Possible order statuses
    default: 'pending',
    required: true
  },
  dishPrice: {
    type: Number,
    required: true
  },
  gstPrice: {
    type: Number,
    required: true
  },
  deliveryPrice: {
    type: Number,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  deliveryDate: {
    type: Date,
    default: () => new Date(Date.now() + 1 * 60 * 60 * 1000)
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const OrderInfo = mongoose.model('OrderInfo', orderInfoSchema);

export default OrderInfo;
