import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import db from '../config/config.js'; // Import the database connection
import moment from 'moment-timezone';
import dotenv from 'dotenv';

import { jwtDecode} from "jwt-decode";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET; // Replace with your own secret key

function tz_date(dateString) {
    const date = new Date(dateString);

    // Format the date to "YYYY-MM-DD" in Asia/Manila time zone
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone: 'Asia/Manila'
    };

    const formattedDate = new Intl.DateTimeFormat('en-CA', options).format(date).replace(/\//g, '-');
    return formattedDate; // Output: "2001-06-11"
}

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
    const { emp_id, password, user_level } = req.body;

    try {
        const sql = `SELECT id_generator.id,
        employee_profile.fName, employee_profile.mName, employee_profile.lName, employee_profile.bDate,
        employee_profile.date_hired, employee_profile.departmentID, employee_profile.clusterID,
        employee_profile.siteID, employee_profile.email, employee_profile.phone, employee_profile.address,
        employee_profile.emergency_contact_person, employee_profile.emergency_contact_number,
        employee_profile.employee_level, employee_profile_benefits.sss, employee_profile_benefits.pagibig,
        employee_profile_benefits.philhealth, employee_profile_benefits.tin, employee_profile_benefits.basic_pay,
        employee_profile_benefits.healthcare, employee_profile_standing.employee_status, employee_profile_standing.date_added,
        employee_profile_standing.datetime_updated, employee_profile_standing.positionID
        FROM id_generator  
        LEFT JOIN employee_profile ON id_generator.id = employee_profile.emp_ID 
        LEFT JOIN employee_profile_benefits ON employee_profile.emp_ID = employee_profile_benefits.emp_ID 
        LEFT JOIN employee_profile_standing ON employee_profile.emp_ID = employee_profile_standing.emp_ID 
        WHERE employee_profile.emp_ID = ?`;

        const sql2  = 'SELECT * FROM admin_login WHERE emp_ID = ?'; // Use a parameterized query
        const sql3  = 'INSERT INTO admin_login (emp_ID, password, expiry_date, user_level) VALUES (?, ?, ?, ?)';
        const [user] = await db.promise().query(sql, [emp_id]);

        if (user.length == 0) {
            return res.status(404).json({ error: 'Not found.' });
        } 

        const [admin_login] = await db.promise().query(sql2, [emp_id]);

        if (admin_login.length == 0) {
           // hashConverterMD5(dateConverter(tz_date(user[0]['bDate'])));
            const [insert_data_admin_login] = await db.promise().query(sql3, [emp_id, hashConverterMD5(password), storeCurrentDate(3, 'months'), user_level]);    
        } else {
            return res.status(409).json({ error: 'Admin already exists.' });
        }

        return res.status(200).json({ success: 'Account successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create admin entry' });
    }
});



export const login_admin = asyncHandler(async (req, res) => {
    const { emp_ID, password } = req.body;

    try {
        const hash = hashConverterMD5(password);
      //  const sql  = 'SELECT * FROM admin_login WHERE emp_ID = ?'; // Use a parameterized query

        const sql = `SELECT admin_login.emp_ID, admin_login.password, admin_login.login_attempts, 
        admin_login.expiry_date, admin_login.user_level, 
        employee_profile.fName, employee_profile.mName, employee_profile.lName, employee_profile.bDate,
        employee_profile.date_hired, employee_profile.departmentID, employee_profile.clusterID,
        employee_profile.siteID, employee_profile.email, employee_profile.phone, employee_profile.address,
        employee_profile.emergency_contact_person, employee_profile.emergency_contact_number,
        employee_profile.employee_level, employee_profile_benefits.sss, employee_profile_benefits.pagibig,
        employee_profile_benefits.philhealth, employee_profile_benefits.tin, employee_profile_benefits.basic_pay,
        employee_profile_benefits.healthcare, employee_profile_standing.employee_status, employee_profile_standing.date_added,
        employee_profile_standing.datetime_updated, employee_profile_standing.positionID
        FROM admin_login  
        LEFT JOIN employee_profile ON admin_login.emp_ID = employee_profile.emp_ID 
        LEFT JOIN employee_profile_benefits ON employee_profile.emp_ID = employee_profile_benefits.emp_ID 
        LEFT JOIN employee_profile_standing ON employee_profile.emp_ID = employee_profile_standing.emp_ID 
        WHERE admin_login.emp_ID = ?`;


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
                expiresIn: '7d' // Token expiration time
            });

            const hashToken = hashConverterMD5(token);
            const [data_token] = await db.promise().query(sql2, [emp_ID, token, storeCurrentDate(1, 'hours')]);
            const [data_admin_login] = await db.promise().query(sql3, [0, emp_ID]);

            return res.status(200).json({ data: token, emp_id: login[0]['emp_ID'] });
        }

        const [data_admin_login] = await db.promise().query(sql3, [login[0]['login_attempts'] + 1, emp_ID]);

        return res.status(400).json({ error: 'Failed to login wrong password.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to login ' });
    }
});



export const update_admin_expiration = asyncHandler(async (req, res) => {
    const { expiry_date } = req.body;
    const { emp_id } = req.params; // Assuming department_id is passed as a URL parameter

    try {
        const sql  = 'UPDATE admin_login SET expiry_date = ? WHERE emp_ID = ?';

        const expirydateRegex = /^\d+\s+(hours|months|years)$/; // For "1 hours", "1 months", or "1 years"
        const match = expiry_date.match(expirydateRegex);

        // Check if birthdate matches the regex
        if (!expirydateRegex.test(expiry_date)) {
            return res.status(400).json({ message: 'Invalid expiry date format. Please use "<number> hours", "<number> months", or "<number> years".' });
        }

        const [update_admin_expiration ] = await db.promise().query(sql, [storeCurrentDate(match[1], match[2]), emp_id]);
            
        if (update_admin_expiration.affectedRows === 0) {
            return res.status(404).json({ error: 'Admin not found.' });
        }
        

        return res.status(200).json({ success: 'Admin successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update admin.' });
    }
});


export const update_admin_login = asyncHandler(async (req, res) => {
    const { login_attempts, password, user_level } = req.body;
    const { emp_id } = req.params; // Assuming department_id is passed as a URL parameter

    try {
        const hash_password = hashConverterMD5(password);

        const sql  = 'UPDATE admin_login SET login_attempts = ?, user_level = ? WHERE emp_ID = ?';
        const sql2 = 'UPDATE admin_login SET login_attempts = ?, password = ?, user_level = ? WHERE emp_ID = ?';

 

        if(!password) {
            const [update_login_no_password] = await db.promise().query(sql, [login_attempts, emp_id, user_level]);
            if (update_login_no_password.affectedRows === 0) {
                return res.status(404).json({ error: 'Admin not found.' });
            }
        } else {
            const [update_login_password] = await db.promise().query(sql2, [login_attempts, hash_password, emp_id, user_level]);
            
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
        const sql = `SELECT admin_login.emp_ID, admin_login.password, admin_login.login_attempts, 
        admin_login.expiry_date, admin_login.user_level, 
        employee_profile.fName, employee_profile.mName, employee_profile.lName, employee_profile.bDate,
        employee_profile.date_hired, employee_profile.departmentID, employee_profile.clusterID,
        employee_profile.siteID, employee_profile.email, employee_profile.phone, employee_profile.address,
        employee_profile.emergency_contact_person, employee_profile.emergency_contact_number,
        employee_profile.employee_level, employee_profile_benefits.sss, employee_profile_benefits.pagibig,
        employee_profile_benefits.philhealth, employee_profile_benefits.tin, employee_profile_benefits.basic_pay,
        employee_profile_benefits.healthcare, employee_profile_standing.employee_status, employee_profile_standing.date_added,
        employee_profile_standing.datetime_updated, employee_profile_standing.positionID
        FROM admin_login LEFT JOIN employee_profile ON admin_login.emp_ID = employee_profile.emp_ID 
        LEFT JOIN employee_profile_benefits ON employee_profile.emp_ID = employee_profile_benefits.emp_ID 
        LEFT JOIN employee_profile_standing ON employee_profile.emp_ID = employee_profile_standing.emp_ID`;

        const [users] = await db.promise().query(sql);

        return res.status(200).json({ data: users });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all user.' });
    }
});
  
  