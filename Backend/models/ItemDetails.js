import mongoose from 'mongoose';

const { Schema } = mongoose;

// Define the schema for the 'itemDetails' model
const itemDetailsSchema = new Schema({
  dishId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'DishInfo'
  },
  itemName: {
    type: String,
    required: true,
    trim: true
  },
  itemQuantity: {
    type: String,
  },
  itemFlavor: {
    type: String,
    trim: true
  }
});

// Create the model
const ItemDetails = mongoose.model('ItemDetails', itemDetailsSchema);

export default ItemDetails;
