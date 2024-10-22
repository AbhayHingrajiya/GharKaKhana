import axios from 'axios';

// Middleware to get user ID and attach to request
export const fetchUserIdMiddleware = async (req, res, next) => {
  try {
    const response = await axios.post('http://localhost:3000/api/getUserId', {}, {
      headers: {
        Cookie: req.headers.cookie // Forward the cookies to the axios request
      }
    });

    if (response.status === 200) {
      // Attach the userId to the request object for further use
      req.userId = response.data.userId;
      next(); // Continue to the next middleware/route handler
    } else {
      console.error("Error in fetching userId");
      return res.status(500).json({ message: "Error in fetching userId" });
    }
  } catch (err) {
    console.error('Error in fetchUserIdMiddleware: ' + err);
    return res.status(500).json({ message: 'Error in fetching userId' });
  }
};