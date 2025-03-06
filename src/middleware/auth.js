import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET; // Replace with your own secret key



function hashConverterMD5(password) {
    return crypto.createHash('md5').update(String(password)).digest('hex');
}


export const authenticateToken = (req, res, next) => {
    // const token = req.headers['authorization']?.split(' ')[1]; // Get token from Authorization header
   // const token = req.headers['Authorization'];
    //const token = hashConverterMD5(req.headers['x-jwt-token']);
   // const token  = req.headers['x-jwt-token'];
    const api_key  = req.headers['x-api-key'];
    const token    = req.headers['x-jwt-token'];
    const emp_id   = req.headers['x-emp-id'];

    // if (!token || !api_key) {
    //     return res.sendStatus(400); // Bad Request
    // }

    if (!token) {
        return res.sendStatus(400); // Bad Request
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403); // Forbidden
        }    
  
        if(user.login[0]['emp_ID'] != emp_id) {
            return res.sendStatus(401); // Unauthorized
        }
    
        req.user = user; // Save user info in request
        next(); // Proceed to the next middleware or route handler
    });
};
