import mongoose from 'mongoose';

const DishStatusSchema = new mongoose.Schema({
  dishId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DishInfo',
    required: true
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoodProvider',
    required: true
  },
  availableQuantity: {
    type: Number,
    default: 0
  },
  pendingQuantity: {
    type: Number,
    default: 0
  },
  completeQuantity: {
    type: Number,
    default: 0
  },
  cancelQuantity: {
    type: Number,
    default: 0
  }
});

const DishStatus = mongoose.model('DishStatus', DishStatusSchema);

export default DishStatus;
