import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import db from '../config/config.js'; // Import the database connection
import moment from 'moment-timezone';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET; // Replace with your own secret key


function dateConverter(dateString) {
    // Check if the input is valid (length of 8)
    if (dateString.length !== 8) {
        throw new Error('Invalid date format. Expected format is mmddyyyy.');
    }

    // Extract month, day, and year from the input string
    const month = dateString.substring(0, 2); // First two characters
    const day = dateString.substring(2, 4);   // Next two characters
    const year = dateString.substring(4, 8);  // Last four characters

    // Format the date in yyyy-mm-dd
    return `${year}-${month}-${day}`;
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


export const create_employee = asyncHandler(async (req, res) => {
    const { birthdate, fname, mname, lname, date_hired, department_id, 
         cluster_id, site_id, email, phone, address, 
         emergency_contact_person, emergency_contact_number, sss, 
         pagibig, philhealth, tin, basic_pay, employee_status, 
         positionID  } = req.body;

    try {
        const birthdateRegex = /^(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])\d{4}$/;

        // Check if birthdate matches the regex
        if (!birthdateRegex.test(birthdate)) {
            return res.status(400).json({ message: 'Invalid birthdate format. Please use mmddyyyy.' });
        } else {
            const hash = hashConverterMD5(birthdate);

            const sql  = 'INSERT INTO id_generator (datetime_created) VALUES (?)';
            const sql2 = 'INSERT INTO login (emp_ID, password, expiry_date) VALUES (?, ?, ?)';
            const sql3 = 'INSERT INTO employee_profile (emp_ID, fName, mName, lName, bDate, date_hired, departmentID, clusterID, siteID, email, phone, address, emergency_contact_person, emergency_contact_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
            const sql4 = 'INSERT INTO employee_profile_benefits (emp_ID, sss, pagibig, philhealth, tin, basic_pay) VALUES (?, ?, ?, ?, ?, ?)';
            const sql5 = 'INSERT INTO employee_profile_standing (emp_ID, employee_status, positionID) VALUES (?, ?, ?)';


            const [insert_data_id_generator] = await db.promise().query(sql, [storeCurrentDateTime(0, 'hours')]);
            const [insert_data_login] = await db.promise().query(sql2, [insert_data_id_generator['insertId'], hash, storeCurrentDateTime(3, 'months')]);
            const [insert_data_employee_profile] = await db.promise().query(sql3, [insert_data_id_generator['insertId'], fname, mname, lname, dateConverter(birthdate), date_hired, department_id, cluster_id, site_id, email, phone, address, emergency_contact_person, emergency_contact_number]);
            const [insert_data_employee_profile_benefits] = await db.promise().query(sql4, [insert_data_id_generator['insertId'], sss, pagibig, philhealth, tin, basic_pay]);
            const [insert_data_employee_profile_standing] = await db.promise().query(sql5, [insert_data_id_generator['insertId'], employee_status, positionID]);
        }

        return res.status(200).json({ success: 'Account successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create user entry' });
    }
});



export const login_employee = asyncHandler(async (req, res) => {
    const { emp_ID, password } = req.body;

    try {
        const hash = hashConverterMD5(password);
        const sql = 'SELECT * FROM login WHERE emp_ID = ? && password = ?'; // Use a parameterized query
        const sql2 = 'INSERT INTO tokens (emp_ID, token, expiry_datetime) VALUES (?, ?, ?)';
        const [login] = await db.promise().query(sql, [emp_ID, hash]);
             // Generate a JWT token
        const token = jwt.sign({ login }, JWT_SECRET, {
            expiresIn: '1h' // Token expiration time
        });

        const hashToken = hashConverterMD5(token);
        const [token_data] = await db.promise().query(sql2, [emp_ID, hashToken, storeCurrentDateTime(1, 'hours')]);

        return res.status(200).json({ data: hashToken });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to login ' });
    }
});

export const get_all_employee = asyncHandler(async (req, res) => {
    try {
        const sql = 'SELECT * FROM login'; // Use a parameterized query
        const [users] = await db.promise().query(sql);

        return res.status(200).json({ data: users });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all user.' });
    }
});
  
  