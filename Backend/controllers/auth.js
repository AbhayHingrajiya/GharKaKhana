import FoodConsumer from '../models/FoodConsumer.js'; 
import DeliveryBoy from '../models/DeliveryBoy.js'; 
import FoodProvider from '../models/FoodProvider.js';
import { generateTokenAndSetCookie } from '../lib/generateToken.js'
import bcrypt from 'bcrypt';
import multer from 'multer';
import nodemailer from 'nodemailer';

// Set up multer storage (memory storage for direct buffer use)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

export const signUpFoodConsumer = async (req, res) => {
    const { name, email, phoneNumber, password } = req.body;
    const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);
  
    try {
      // Create a new instance of the foodConsumer model
      const foodConsumer = new FoodConsumer({
        name,
        email,
        phoneNumber,
        password: hashedPassword
      });
  
      // Save the foodConsumer to the database
      await foodConsumer.save();
      console.log('Consumer Added')
      
      generateTokenAndSetCookie(foodConsumer._id, res);
  
      // Send a response back to the client
      res.status(201).json({
        message: 'foodConsumer created successfully',
        foodConsumer: {
          id: foodConsumer._id,
          name: foodConsumer.name,
          email: foodConsumer.email,
          phoneNumber: foodConsumer.phoneNumber
        }
      });
    } catch (error) {
      // Handle errors, such as duplicate email or phone number
      res.status(400).json({
        message: 'Error creating foodConsumer',
        error: error.message
      });
    }
}; 

export const signUpFoodProvider = async (req, res) => {
  const { 
    name, 
    email, 
    phoneNumber, 
    password, 
    aadhaarPhotoProvider, 
    aadhaarNumberProvider 
  } = req.body;

  try {
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new instance of the FoodProvider model
    const foodProvider = new FoodProvider({
      name,
      email,
      phoneNumber,
      password: hashedPassword,
      aadhaarPhoto: aadhaarPhotoProvider, // Ensure this is sent as Buffer or handle the conversion
      aadhaarNumber: aadhaarNumberProvider
    });

    // Save the foodProvider to the database
    await foodProvider.save();

    // Generate token and set cookie
    generateTokenAndSetCookie(foodProvider._id, res);

    // Send a success response
    res.status(201).json({
      message: 'Food Provider created successfully',
      foodProvider: {
        id: foodProvider._id,
        name: foodProvider.name,
        email: foodProvider.email,
        phoneNumber: foodProvider.phoneNumber,
        aadhaarNumber: foodProvider.aadhaarNumber,
      },
    });
  } catch (error) {
    // Handle errors such as duplicate email or Aadhaar number
    res.status(400).json({
      message: 'Error creating Food Provider',
      error: error.message,
    });
  }
};

export const signUpDeliveryBoy = async (req, res) => {
  upload.single('licensePhoto')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: 'Error uploading file', error: err.message });
    }
    const { name, email, phoneNumber, licenseNumber, vehicleNumber, vehicleName, cityName, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    try {
      // Create a new instance of the DeliveryBoy model
      const deliveryBoy = new DeliveryBoy({
        name,
        email,
        phoneNumber,
        licenseNumber,
        licensePhoto: req.file.buffer,
        vehicleNumber,
        vehicleName,
        cityName,
        password: hashedPassword
      });

      // Save the deliveryBoy to the database
      await deliveryBoy.save();

      generateTokenAndSetCookie(deliveryBoy._id, res);

      // Send a response back to the client
      res.status(201).json({
        message: 'DeliveryBoy created successfully',
        deliveryBoy: {
          id: deliveryBoy._id,
          name: deliveryBoy.name,
          email: deliveryBoy.email,
          phoneNumber: deliveryBoy.phoneNumber,
          licenseNumber: deliveryBoy.licenseNumber,
          licensePhoto: deliveryBoy.licensePhoto,
          vehicleNumber: deliveryBoy.vehicleNumber,
          vehicleName: deliveryBoy.vehicleName,
          cityName: deliveryBoy.cityName
          // Do not send the password back in the response
        }
      });
    } catch (error) {
      // Handle errors, such as duplicate email or phone number
      res.status(400).json({
        message: 'Error creating DeliveryBoy',
        error: error.message
      });
    }
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
      const userTypes = [
          { type: 'foodConsumer', model: FoodConsumer },
          { type: 'deliveryBoy', model: DeliveryBoy },
          { type: 'foodProvider', model: FoodProvider }
      ];

      for (const userType of userTypes) {
          const user = await userType.model.findOne({ email: email });

          if (user) {
              const isPasswordCorrect = await bcrypt.compare(password, user.password);
              if (isPasswordCorrect) {
                  generateTokenAndSetCookie(user._id, res);
                  return res.status(200).json({
                      _id: user._id,
                      name: user.name,
                      email: user.email,
                      phoneNumber: user.phoneNumber,
                      type: userType.type
                  });
              }
          }
      }

      // If no user is found after checking all models
      return res.status(404).json({ message: 'User not found' });

  } catch (error) {
      console.log("Error in login function: ", error.message);
      res.status(500).json({ message: 'Internal server error' });
  }
};

export const signOut = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "sign out successfully" });
  } catch (error) {
    console.log("Error in signout function: ", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Helper function to generate a 6-digit OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000);

export const forgotPasswordSendOtp = async (req, res) => {
  try {
    const { userEmail, role } = req.body;

    // Validate request body
    if (!userEmail || !role) {
      return res.status(400).json({ message: 'Email and role are required' });
    }

    console.log(role)
    // Ensure role is valid
    const validRoles = ['consumer', 'provider', 'delivery boy'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role provided' });
    }

    // Find the user based on the role
    let findUser;
    if (role === 'consumer') {
      findUser = await FoodConsumer.findOne({ email: userEmail });
    } else if (role === 'provider') {
      findUser = await FoodProvider.findOne({ email: userEmail });
    } else if (role === 'delivery Boy') {
      findUser = await DeliveryBoy.findOne({ email: userEmail });
    }

    // If user does not exist
    if (!findUser) {
      return res.status(404).json({ message: 'User not found for the given email and role' });
    }

    // Generate OTP
    const otp = generateOtp();

    // Save OTP to the user's record (optional, for later verification)
    findUser.otp = otp;
    findUser.otpExpires = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes
    await findUser.save();

    // Set up the transporter
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Set up the email content
    const mailOptions = {
      from: `"Ghar Ka Khana" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: 'Reset Your Password - Ghar Ka Khana',
      text: `Hello ${role}, your OTP for resetting your password is ${otp}. Please do not share this OTP with anyone. It is valid for 10 minutes.`,
      html: `
        <h1>Reset Password</h1>
        <p>Dear ${role},</p>
        <p>Your OTP for resetting your password is:</p>
        <h2 style="color: #2c3e50;">${otp}</h2>
        <p>Please use this OTP to reset your password. It is valid for 10 minutes. Do not share this OTP with anyone.</p>
        <br/>
        <p>Regards,</p>
        <p><strong>Ghar Ka Khana Team</strong></p>
      `,
    };

    generateTokenAndSetCookie(userEmail, res);

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ message: 'Failed to send email', error });
      } else {
        console.log('Email sent:', info.response);
        return res.status(200).json({ message: 'OTP sent successfully', otp }); // Include OTP for testing only; remove in production
      }
    });
  } catch (error) {
    console.error('Error in forgotPasswordSendOtp:', error);
    return res.status(500).json({ message: 'An error occurred', error });
  }
};

export const resetPassword = async (req, res) => {
  const emailId = req.userId; // Assuming this comes from authentication middleware
  const { newPassword, role } = req.body;

  if (!emailId || !newPassword || !role) {
    return res.status(400).json({ message: 'Email ID, role, and new password are required.' });
  }

  try {
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    let userModel;
    if (role === 'consumer') {
      userModel = FoodConsumer;
    } else if (role === 'provider') {
      userModel = FoodProvider;
    } else if (role === 'delivery boy') {
      userModel = DeliveryBoy;
    } else {
      return res.status(400).json({ message: 'Invalid role specified.' });
    }

    // Update the user's password
    const updatedUser = await userModel.findOneAndUpdate(
      { email: emailId },
      { password: hashedPassword },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ message: 'Password reset successfully.' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Internal server error. Please try again later.' });
  }
};
