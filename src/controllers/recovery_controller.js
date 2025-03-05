import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import { db } from '../config/config.js'; // Import the database connection

import mailer from './../utils/mailer.js'; // Import the mailer utility
import moment from 'moment-timezone';




function hashConverterMD5(password) {
    return crypto.createHash('md5').update(String(password)).digest('hex');
}

function formatDateTo12HourTime(isoDateString) {
    const date = new Date(isoDateString);
    
    // Get hours, minutes, and seconds
    let hours = date.getUTCHours(); // Use getUTCHours() if the date is in UTC
    const minutes = date.getUTCMinutes();
    const seconds = date.getUTCSeconds();
    
    // Determine AM or PM suffix
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    // Convert to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    
    // Format minutes and seconds to be two digits
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    const formattedSeconds = seconds < 10 ? '0' + seconds : seconds;
    
    // Return the formatted time
    return `${hours}:${formattedMinutes}:${formattedSeconds} ${ampm}`;
}

function convertToUTC(dateString) {
    // Parse the input date string in Asia/Manila timezone
    const manilaDateTime = moment.tz(dateString, "Asia/Manila");

    // Convert to UTC
    const utcDateTime = manilaDateTime.clone().utc();

    // Format the date in ISO 8601 format
    const formattedUtcDateTime = utcDateTime.format('YYYY-MM-DDTHH:mm:ss');

    return formattedUtcDateTime;
}

// Function to get the current date and time in Asia/Manila
function storeCurrentDateTime(expirationAmount, expirationUnit) {
    const currentDateTime = moment.tz("Asia/Manila");
    const expirationDateTime = currentDateTime.clone().add(expirationAmount, expirationUnit);
    return expirationDateTime.format('YYYY-MM-DD HH:mm:ss');
}

export const otp_recovery = asyncHandler(async (req, res) => {
    const { emp_ID } = req.body;

    const sql = 'SELECT * FROM employee_profile WHERE emp_ID = ?'; // Use a parameterized query
    const sql2 = 'INSERT INTO otp (code, emp_ID, date_time) VALUES (?, ?, ?)';
    const randomNumber = Math.floor(100000 + Math.random() * 900000);

    const [employee_profile] = await db.query(sql, [emp_ID]);

    if (employee_profile.length === 0) {
        return res.status(404).json({ error: 'User  not found.' });
    }

    await db.query(sql2, [randomNumber, emp_ID, storeCurrentDateTime(3, 'minutes')]);

    mailer(employee_profile[0]['email'], "SYNERGIST", randomNumber);

    return res.status(200).json({ success: 'OTP has been successfully sent.' });
});

export const otp_verification = asyncHandler(async (req, res) => {
    const { otp_code } = req.body;
    const { emp_id } = req.params; // Assuming emp_id is passed as a URL parameter

    try {
        const sql = `SELECT id, code, emp_ID,
        DATE_FORMAT(date_time, '%Y-%m-%d %H:%i:%s') AS date_time
        FROM otp WHERE emp_ID = ? ORDER BY id DESC LIMIT 1`;

        const [otp] = await db.query(sql, [emp_id]);
            
        if (otp.length === 0) {
            return res.status(404).json({ error: 'User  not found.' });
        }

        if (storeCurrentDateTime(0, 'months') > otp[0]['date_time']) {
            return res.status(400).json({ error: 'Your OTP has expired. Please request a new one.' });
        }

        if (otp_code !== otp[0]['code']) {
            return res.status(400).json({ error: 'Invalid OTP. Please try again.' });
        }

        return res.status(200).json({ success: 'OTP is correct. Operation successful.' });    
    } catch (error) {
        return res.status(500).json({ error: 'Failed to verify OTP.' });
    }
});

export const account_recovery = asyncHandler(async (req, res) => {
    const { password } = req.body;
    const { emp_id, type } = req.params; // Assuming emp_id and type are passed as URL parameters

    try {
        const hash_password = hashConverterMD5(password);

        const sql = 'UPDATE login SET password = ? WHERE emp_ID = ?';
        const sql2 = 'UPDATE admin_login SET password = ? WHERE emp_ID = ?';

        if (type == 1) {
            const [update_login] = await db.query(sql, [hash_password, emp_id]);

            if (update_login.affectedRows === 0) {
                return res.status(404).json({ error: 'Employee not found.' });
            }
            return res.status(200).json({ success: 'Employee password successfully updated.' });
        }

        if (type == 2) {
            const [update_admin_login] = await db.query(sql2, [hash_password, emp_id]);

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