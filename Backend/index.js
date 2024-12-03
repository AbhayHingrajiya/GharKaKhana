import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import connectMongoDB from './db/connectMongoDB.js'; 
import { fetchUserIdMiddleware } from './middleware/fetchUserIdMiddleware.js';
import { signUpFoodConsumer, signUpFoodProvider, signUpDeliveryBoy, login, signOut, forgotPasswordSendOtp, resetPassword } from "./controllers/auth.js";
import { getUserId } from './lib/generateToken.js';
import { getMe } from './controllers/common.js';
import { addDish, getAllDishInfoProvider,  cancelOrderProvider, getOTPforDelivery, comfirmOrderDeliveryByProvider } from './controllers/provider.js';
import { getAdminProviderInfo, getAdminConsumerInfo } from './controllers/admin.js'
import { consumerGetDishInfo, getConsumerAddress, addNewAddress, addNewOrder, getPendingOrdersConsumer, cancelOrderConsumer, denyOrderByDeliveryBoy } from './controllers/consumer.js'
import { activeDeliveryBoy, acceptedOrderByDeliveryBoy } from './controllers/deliveryBoy.js'

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
app.post('/api/forgotPasswordSendOtp', forgotPasswordSendOtp);
app.post('/api/resetPassword', fetchUserIdMiddleware, resetPassword);

//generateToken.js
app.post('/api/getUserId', getUserId);
app.post('/api/getMe', getMe);
app.post('/api/getProviderId', getUserId);

//provider.js
app.post('/api/addDish', fetchUserIdMiddleware, addDish);
app.post('/api/cancelOrderProvider', cancelOrderProvider);
app.post('/api/getAllDishInfoProvider', fetchUserIdMiddleware, getAllDishInfoProvider);
app.post('/api/getOTPforDelivery', fetchUserIdMiddleware, getOTPforDelivery);
app.post('/api/comfirmOrderDeliveryByProvider', fetchUserIdMiddleware, comfirmOrderDeliveryByProvider);

//consumer.js
app.post('/api/consumerGetDishInfo', consumerGetDishInfo);
app.post('/api/getConsumerAddress', fetchUserIdMiddleware, getConsumerAddress);
app.post('/api/addNewAddress', fetchUserIdMiddleware, addNewAddress);
app.post('/api/addNewOrder', fetchUserIdMiddleware, addNewOrder);
app.post('/api/getPendingOrdersConsumer', fetchUserIdMiddleware, getPendingOrdersConsumer);
app.post('/api/cancelOrderConsumer', fetchUserIdMiddleware, cancelOrderConsumer);
app.post('/api/denyOrderByDeliveryBoy', fetchUserIdMiddleware, denyOrderByDeliveryBoy);

//deliveryBoy.js
app.post('/api/activeDeliveryBoy', fetchUserIdMiddleware, activeDeliveryBoy);
app.post('/api/acceptedOrderByDeliveryBoy', fetchUserIdMiddleware, acceptedOrderByDeliveryBoy);

//admin.js 
app.post('/api/getAdminProviderInfo',getAdminProviderInfo);
app.post('/api/getAdminConsumerInfo',getAdminConsumerInfo);

// Socket.IO Connection Handler
io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`);

  socket.on('joinProviderRoom', (providerId) => {
    socket.join(providerId); // The provider joins their specific room
    console.log(`Provider ${providerId} joined room`);
  });

  socket.on('joinDeliveryBoyRoom', (deliveryBoyId) => {
    socket.join(deliveryBoyId); // The delivery boy joins their specific room
    console.log(`Delivery Boy ${deliveryBoyId} joined room`);
  });

  // Handle when the delivery boy leaves the room
  socket.on('leaveDeliveryBoyRoom', (deliveryBoyId) => {
    socket.leave(deliveryBoyId); // Remove the delivery boy from the room
    console.log(`Delivery Boy ${deliveryBoyId} left the room`);
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

