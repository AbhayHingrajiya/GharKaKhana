import express from 'express';
import dotenv from 'dotenv';
import connectMongoDB from './db/connectMongoDB.js'; // Import the MongoDB connection function

dotenv.config(); // Load environment variables

const app = express();

// Connect to MongoDB


// Middleware
app.use(express.json());

// Define your routes here
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectMongo    DB();
});
