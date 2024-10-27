import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import connectMongoDB from './db/connectMongoDB.js'; // Import the MongoDB connection function
import { fetchUserIdMiddleware } from './middleware/fetchUserIdMiddleware.js';
import { signUpFoodConsumer, signUpFoodProvider, signUpDeliveryBoy, login, signOut } from "./controllers/auth.js";
import { getUserId } from './lib/generateToken.js';
import { getMe } from './controllers/common.js';
import { addDish, getAllDishInfoProvider,  cancelOrderProvider, generateOTPfordelivery } from './controllers/provider.js';
import { getAdminProviderInfo, getAdminConsumerInfo } from './controllers/admin.js'
import { consumerGetDishInfo, getConsumerAddress, addNewAddress, addNewOrder, getPendingOrdersConsumer, cancelOrderConsumer } from './controllers/consumer.js'

dotenv.config(); // Load environment variables

const app = express();
app.use(cookieParser());
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Your frontend port
    methods: ['GET', 'POST'],
    credentials: true, // Required if your frontend sends cookies
  },
});

// Middleware
app.use(express.json());

//auth.js
app.post('/api/signUpFoodConsumer', signUpFoodConsumer);
app.post('/api/signUpFoodProvider', signUpFoodProvider);
app.post('/api/signUpDeliveryBoy', signUpDeliveryBoy);
app.post('/api/login', login);
app.post('/api/signOut', signOut);

//generateToken.js
app.post('/api/getUserId', getUserId);
app.post('/api/getMe', getMe);

//provider.js
app.post('/api/addDish', fetchUserIdMiddleware, addDish);
app.post('/api/cancelOrderProvider', cancelOrderProvider);
app.post('/api/getProviderId', getUserId);
app.post('/api/getAllDishInfoProvider', fetchUserIdMiddleware, getAllDishInfoProvider);
app.post('/api/generateOTPfordelivery', fetchUserIdMiddleware, generateOTPfordelivery);

//consumer.js
app.post('/api/consumerGetDishInfo', consumerGetDishInfo);
app.post('/api/getConsumerAddress', fetchUserIdMiddleware, getConsumerAddress);
app.post('/api/addNewAddress', fetchUserIdMiddleware, addNewAddress);
app.post('/api/addNewOrder', fetchUserIdMiddleware, addNewOrder);
app.post('/api/getPendingOrdersConsumer', fetchUserIdMiddleware, getPendingOrdersConsumer);
app.post('/api/cancelOrderConsumer', fetchUserIdMiddleware, cancelOrderConsumer);

//admin.js 
app.post('/api/getAdminProviderInfo',getAdminProviderInfo);
app.post('/api/getAdminConsumerInfo',getAdminConsumerInfo);

// Socket.IO Connection Handler
io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`);

  // Example: Provider joining a room with their providerId
  socket.on('joinProviderRoom', (providerId) => {
    socket.join(providerId); // The provider joins their specific room
    console.log(`Provider ${providerId} joined room`);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

export { io };

io.listen(4000);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectMongoDB();
});

