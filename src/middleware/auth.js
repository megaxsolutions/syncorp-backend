import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

//const JWT_SECRET = process.env.JWT_SECRET; // Replace with your own secret key
const JWT_SECRET = 'test'; // Replace with your own secret key


export const authenticateToken = (req, res, next) => {
    // const token = req.headers['authorization']?.split(' ')[1]; // Get token from Authorization header
   // const token = req.headers['Authorization'];
    const token = req.headers['x-jwt-token']; // Use the new header name

    //console.log('data:' + token);
    if (!token) {
        return res.sendStatus(401); // Unauthorized
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403); // Forbidden
        }
        req.user = user; // Save user info in request
        next(); // Proceed to the next middleware or route handler
    });
};