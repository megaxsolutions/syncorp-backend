import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import db from '../config/config.js'; // Import the database connection
import moment from 'moment-timezone';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET; // Replace with your own secret key


function storeCurrentDate(expirationAmount, expirationUnit) {
    // Get the current date and time in Asia/Manila timezone
    const currentDateTime = moment.tz("Asia/Manila");

    // Calculate the expiration date and time
    const expirationDateTime = currentDateTime.clone().add(expirationAmount, expirationUnit);

    // Format the current date and expiration date
    const formattedCurrentDateTime = currentDateTime.format('YYYY-MM-DD');
    const formattedExpirationDateTime = expirationDateTime.format('YYYY-MM-DD');

    // Return both current and expiration date-time
    return formattedExpirationDateTime;
    // return {
    //     currentDateTime: formattedCurrentDateTime,
    //     expirationDateTime: formattedExpirationDateTime
    // };
}


function dateConverter(date) {
    const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (!dateFormatRegex.test(date)) {
        throw new Error('Invalid date format. Please use "YYYY-MM-DD".');
    }

    const [year, month, day] = date.split('-');
    return `${month}${day}${year}`;
}


function hashConverterMD5(password) {
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


export const create_admin = asyncHandler(async (req, res) => {
    const { password } = req.body;

    try {
        const hash_password = hashConverterMD5(password);
        
        const sql  = 'INSERT INTO id_generator (datetime_created) VALUES (?)';
        const sql2 = 'INSERT INTO admin_login (emp_ID, password, expiry_date) VALUES (?, ?, ?)';



        const [insert_data_id_generator] = await db.promise().query(sql, [storeCurrentDateTime(0, 'hours')]);
        const [insert_data_admin_login] = await db.promise().query(sql2, [insert_data_id_generator['insertId'], hash_password, storeCurrentDate(3, 'months')]);


        return res.status(200).json({ success: 'Account successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create admin entry' });
    }
});



export const login_admin = asyncHandler(async (req, res) => {
    const { emp_ID, password } = req.body;

    try {
        const hash = hashConverterMD5(password);
        const sql  = 'SELECT * FROM admin_login WHERE emp_ID = ?'; // Use a parameterized query
        const sql2 = 'INSERT INTO tokens (emp_ID, token, expiry_datetime) VALUES (?, ?, ?)';
        const sql3 = 'UPDATE admin_login SET login_attempts = ? WHERE emp_ID = ?';

        const [login] = await db.promise().query(sql, [emp_ID]);

        const dateObject = new Date(login[0]['expiry_date']);
        const expiryDate = dateObject.toISOString().split('T')[0];

        if(storeCurrentDate(0, 'months') > expiryDate) {
            return res.status(400).json({ error: 'Your account has expired. Please contact the administrator for assistance.' });        
        }

        if(login[0]['login_attempts'] == 5) {
            return res.status(400).json({ error: 'Please contact the admin.' });
        }

        if(login[0]['password'] == hash) {
            // Generate a JWT token
            const token = jwt.sign({ login }, JWT_SECRET, {
                expiresIn: '1h' // Token expiration time
            });

            const hashToken = hashConverterMD5(token);
            const [data_token] = await db.promise().query(sql2, [emp_ID, token, storeCurrentDateTime(1, 'hours')]);
            const [data_admin_login] = await db.promise().query(sql3, [0, emp_ID]);

            return res.status(200).json({ data: token, emp_id: login[0]['emp_ID'] });
        }

        const [data_admin_login] = await db.promise().query(sql3, [login[0]['login_attempts'] + 1, emp_ID]);

        return res.status(400).json({ error: 'Failed to login wrong password.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to login ' });
    }
});

export const update_admin_login = asyncHandler(async (req, res) => {
    const { login_attempts, expiry_date, password } = req.body;
    const { emp_id } = req.params; // Assuming department_id is passed as a URL parameter

    try {
        const hash_password = hashConverterMD5(password);
        //storeCurrentDateTime(expirationAmount, expirationUnit);

        const sql  = 'UPDATE admin_login SET login_attempts = ?, expiry_date = ? WHERE emp_ID = ?';
        const sql2 = 'UPDATE admin_login SET login_attempts = ?, password = ?, expiry_date = ? WHERE emp_ID = ?';

        const expirydateRegex = /^\d+\s+(hours|months|years)$/; // For "1 hours", "1 months", or "1 years"
        const match = expiry_date.match(expirydateRegex);

        // Check if birthdate matches the regex
        if (!expirydateRegex.test(expiry_date)) {
            return res.status(400).json({ message: 'Invalid expiry date format. Please use "<number> hours", "<number> months", or "<number> years".' });
        }

        if(!password) {
            const [update_login_no_password] = await db.promise().query(sql, [login_attempts, storeCurrentDateTime(match[1], match[2]), emp_id]);
            if (update_login_no_password.affectedRows === 0) {
                return res.status(404).json({ error: 'Admin not found.' });
            }
        } else {
            const [update_login_password] = await db.promise().query(sql2, [login_attempts, hash_password, storeCurrentDateTime(match[1], match[2]), emp_id]);
            
            if (update_login_password.affectedRows === 0) {
                return res.status(404).json({ error: 'Admin not found.' });
            }
        }

        return res.status(200).json({ success: 'Admin successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update admin.' });
    }
});


export const get_all_admin = asyncHandler(async (req, res) => {
    try {
        const sql = 'SELECT * FROM admin_login'; // Use a parameterized query
        const [users] = await db.promise().query(sql);

        return res.status(200).json({ data: users });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all user.' });
    }
});
  
  