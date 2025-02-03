import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import db from './../config/config.js'; // Import the database connection
import moment from 'moment-timezone';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET; // Replace with your own secret key


function hashPassword(password) {
    return crypto.createHash('md5').update(String(password)).digest('hex');
}


// Function to get the current date and time in Asia/Manila and store it in the database
function storeCurrentDateTime(expirationAmount, expirationUnit) {
    // Get the current date and time in Asia/Manila timezone
    const currentDateTime = moment.tz("Asia/Manila");

    // Calculate the expiration date and time
    const expirationDateTime = currentDateTime.clone().add(expirationAmount, expirationUnit);

    // Format the current date and expiration date
    const formattedCurrentDateTime = currentDateTime.format('YYYY-MM-DD HH:mm:ss');
    const formattedExpirationDateTime = expirationDateTime.format('YYYY-MM-DD HH:mm:ss');

    // Return both current and expiration date-time
    return formattedExpirationDateTime;
    // return {
    //     currentDateTime: formattedCurrentDateTime,
    //     expirationDateTime: formattedExpirationDateTime
    // };
}


export const create_user = asyncHandler(async (req, res) => {
    const { emp_ID, password, login_attempts } = req.body;

    try {
        const hash = hashPassword(password);
        const sql = 'INSERT INTO login (emp_ID, password, login_attempts, expiry_date) VALUES (?, ?, ?, ?)';

        await db.promise().query(sql, [emp_ID, hash, login_attempts, storeCurrentDateTime(1, 'weeks')]);
        return res.status(200).json({ success: 'Account successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create user entry' });
    }
});



export const login_user = asyncHandler(async (req, res) => {
    const { emp_ID, password } = req.body;

    try {
        const hash = hashPassword(password);
        const sql = 'SELECT * FROM login WHERE emp_ID = ? && password = ?'; // Use a parameterized query
        const sql2 = 'INSERT INTO tokens (emp_ID, token, expiry_datetime) VALUES (?, ?, ?)';
        const [login] = await db.promise().query(sql, [emp_ID, hash]);
             // Generate a JWT token
        const token = jwt.sign({ login }, JWT_SECRET, {
            expiresIn: '1h' // Token expiration time
        });

        const [token_data] = await db.promise().query(sql2, [emp_ID, token, storeCurrentDateTime(1, 'hours')]);

        return res.status(200).json({ data: token });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to login ' });
    }
});

export const get_all_user = asyncHandler(async (req, res) => {
    try {
        const sql = 'SELECT * FROM login'; // Use a parameterized query
        const [users] = await db.promise().query(sql);

        return res.status(200).json({ data: users });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all user.' });
    }
});
  
  