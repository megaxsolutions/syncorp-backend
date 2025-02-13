import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import db from './../config/config.js'; // Import the database connection
import mailer from './../utils/mailer.js'; // Import the database connection
import moment from 'moment-timezone';

function hashConverterMD5(password) {
    return crypto.createHash('md5').update(String(password)).digest('hex');
}


function convertToUTC(dateString) {
    // Parse the input date string in Asia/Manila timezone
    const manilaDateTime = moment.tz(dateString, "Asia/Manila");

    // Convert to UTC
    const utcDateTime = manilaDateTime.clone().utc();

    // Format the date in ISO 8601 format
    const formattedUtcDateTime = utcDateTime.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');

    return formattedUtcDateTime;
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

    return formattedExpirationDateTime;
}

export const otp_recovery = asyncHandler(async (req, res) => {
    const { emp_ID } = req.body;

    const sql  = 'SELECT * FROM employee_profile WHERE emp_ID = ?'; // Use a parameterized query
    const sql2 = 'INSERT INTO otp (code, emp_ID, date_time) VALUES (?, ?, ?)';
    const randomNumber = Math.floor(100000 + Math.random() * 900000);

    const [employee_profile] = await db.promise().query(sql, [emp_ID]);

    if(employee_profile.length == 0) {
        return res.status(404).json({ error: 'User not found.' });
    }

    const [insert_data_site] = await db.promise().query(sql2, [randomNumber, emp_ID, storeCurrentDateTime(10, 'minutes')]);

    mailer(employee_profile[0]['email'], "SYNERGIST", randomNumber);

    return res.status(200).json({ success: 'OTP has been successfully sent.' });
});

function formatTime(date) {
    const options = {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true, // Use 12-hour format
        timeZone: 'Asia/Manila' // Adjust to your desired time zone
    };
    return new Intl.DateTimeFormat('en-US', options).format(date);
}
  
export const otp_verification = asyncHandler(async (req, res) => {
    const { otp_code } = req.body;
    const { emp_id } = req.params; // Assuming department_id is passed as a URL parameter

    try {
        const sql = 'SELECT * FROM otp WHERE emp_ID = ? ORDER BY id DESC LIMIT 1';

        const [otp] = await db.promise().query(sql, [emp_id]);
            
        if(otp.length == 0) {
            return res.status(404).json({ error: 'User not found.' });
        }


        const date1 = new Date(convertToUTC(storeCurrentDateTime(0, 'months')));
        const date2 = new Date(otp[0]['date_time']);
        const time1 = formatTime(date1);
        const time2 = formatTime(date2);
        
        return res.status(200).json({ data1: otp[0]['date_time'], date1: date1, date2: date2, time1: time1, time2: time2 });

        // if(time1 > time2) {
        //     return res.status(400).json({ error: 'Your OTP has expired. Please request a new one.' });
        // }

        if(otp_code != otp[0]['code']) {
            return res.status(400).json({ error: 'Invalid OTP. Please try again.' });
        }

        return res.status(200).json({ success: 'OTP is correct. Operation successful.' });    
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update admin.' });
    }
});



export const account_recovery = asyncHandler(async (req, res) => {
    const { password } = req.body;
    const { emp_id, type } = req.params; // Assuming department_id is passed as a URL parameter

    try {
        const hash_password = hashConverterMD5(password);

        const sql  = 'UPDATE login SET password = ? WHERE emp_ID = ?';
        const sql2 = 'UPDATE admin_login SET password = ? WHERE emp_ID = ?';


        if(type == 1) {
            const [update_login] = await db.promise().query(sql, [hash_password, emp_id]);

            if (update_login.affectedRows === 0) {
                return res.status(404).json({ error: 'Employee not found.' });
            }
            return res.status(200).json({ success: 'Employee password successfully updated.' });
        }

        if(type == 2) {
            const [update_admin_login] = await db.promise().query(sql2, [hash_password, emp_id]);

            if (update_admin_login.affectedRows === 0) {
                return res.status(404).json({ error: 'Admin not found.' });
            }
            return res.status(200).json({ success: 'Admin password successfully updated.' });

        }
     
        return res.status(404).json({ error: 'Type not found.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update password.' });
    }
});
