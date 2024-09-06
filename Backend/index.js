import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectMongoDB from './db/connectMongoDB.js'; // Import the MongoDB connection function
import { signUpFoodConsumer, signUpFoodProvider, signUpDeliveryBoy, login } from "./controllers/auth.js";

dotenv.config(); // Load environment variables

const app = express();
app.use(cors());
// Connect to MongoDB


// Middleware
app.use(express.json());

// Define your routes here
app.get('/', (req, res) => {
  res.send('API is running...');
});

app.post('/api/signUpFoodConsumer', signUpFoodConsumer);
app.post('/api/signUpFoodProvider', signUpFoodProvider);
app.post('/api/signUpDeliveryBoy', signUpDeliveryBoy);
app.post('/api/login', login);


// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectMongoDB();
});
