import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (userId, res) => {
    const token = jwt.sign({userId}, process.env.JWT_SECRET,{
         expiresIn: '15d' 
        });
    res.cookie("jwt", token,{
        maxAge: 15 * 24 * 60 * 60 * 1000,
        httpOnly: true,//preventing xss attack
        sameSite: "strict",//CSRF attack
    });
};

export const getUserId = async (req, res) => {
    const token = req.cookies.jwt; // Get the token from cookies
  
    if (!token) {
        return res.status(401).json({ message: 'No token provided, authorization denied' });
    }
  
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify and decode the token
        req.userId = decoded.userId; // Attach the userId to the request object
        return res.status(200).json({userId: req.userId});
    } catch (err) {
        return res.status(401).json({ message: 'Token is not valid' });
    }
};