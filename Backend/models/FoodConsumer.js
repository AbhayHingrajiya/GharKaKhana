const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the schema for the 'foodConsumer' model
const foodConsumerSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true // Ensure the email is unique
  },
  password: {
    type: String,
    required: true
  }
});

// Create the model
const FoodConsumer = mongoose.model('FoodConsumer', foodConsumerSchema);

module.exports = FoodConsumer;
