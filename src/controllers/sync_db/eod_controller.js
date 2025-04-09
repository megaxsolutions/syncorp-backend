import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import { db } from '../../config/config.js'; // Import the database connection

import moment from 'moment-timezone';

// Function to get the current date and time in Asia/Manila and store it in the database
function storeCurrentDateTime(expirationAmount, expirationUnit) {
    // Get the current date and time in Asia/Manila timezone
    const currentDateTime = moment.tz("Asia/Manila");

    // Calculate the expiration date and time
    const expirationDateTime = currentDateTime.clone().add(expirationAmount, expirationUnit);

    // Format the expiration date
    const formattedExpirationDateTime = expirationDateTime.format('YYYY-MM-DD HH:mm:ss');

    // Return the formatted expiration date-time
    return formattedExpirationDateTime;
}


// Function to get the current date and time in Asia/Manila and store it in the database
function storeCurrentDate(expirationAmount, expirationUnit) {
    // Get the current date and time in Asia/Manila timezone
    const currentDateTime = moment.tz("Asia/Manila");

    // Calculate the expiration date and time
    const expirationDateTime = currentDateTime.clone().add(expirationAmount, expirationUnit);

    // Format the expiration date
    const formattedExpirationDateTime = expirationDateTime.format('YYYY-MM-DD');

    // Return the formatted expiration date-time
    return formattedExpirationDateTime;
}

export const create_eod = asyncHandler(async (req, res) => {
    const { emp_id, details, eod_date } = req.body;

    try {
        const sql = 'INSERT INTO eod (emp_ID, details, date, date_submitted) VALUES (?, ?, ?, ?)';

        const [insert_data_eod] = await db.query(sql, [emp_id, details, eod_date, storeCurrentDateTime(0, 'hours')]);


        // Return the merged results in the response
        return res.status(200).json({ success: 'EOD successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create eod.' });
    }
});


export const get_all_eod_supervisor = asyncHandler(async (req, res) => {
    const { supervisor_emp_id } = req.params; // Assuming cluster_id is passed as a URL parameter

    try {
        const sql = 'SELECT * FROM admin_login WHERE emp_ID = ?'; // Use a parameterized query

        const [data_admin_login] = await db.query(sql, [supervisor_emp_id]);

        if (data_admin_login.length === 0) {
            return res.status(404).json({ error: 'Supervisor not found.' });
        }

        const bucketArray = JSON.parse(data_admin_login[0]['bucket'] == null || data_admin_login[0]['bucket'] == "" || JSON.parse(data_admin_login[0]['bucket']).length == 0 ? "[0]" : data_admin_login[0]['bucket'] );
        const placeholders = bucketArray.map(() => '?').join(', ');

        const sql2 = `
        SELECT eod.id, eod.emp_ID,
            DATE_FORMAT(eod.date_submitted, '%Y-%m-%d %H:%i:%s') AS date_submitted,
            DATE_FORMAT(eod.date, '%Y-%m-%d') AS date, 
            eod.details
        FROM eod
        LEFT JOIN employee_profile ON eod.emp_ID = employee_profile.emp_ID
        WHERE employee_profile.clusterID IN (${placeholders})
        `;

        const [eod] = await db.query(sql2, bucketArray);

        // Return the merged results in the response
        return res.status(200).json({ data: eod });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});


export const update_eod = asyncHandler(async (req, res) => {
    const { details, eod_date } = req.body;
    const { eod_id } = req.params; // Assuming emp_id is passed as a URL parameter

    try {

        const sql = 'UPDATE eod SET details = ?, date = ? WHERE id = ?';
        const [update_data_breaks] = await db.query(sql, [details, eod_date, eod_id]);

        // Return the merged results in the response
        return res.status(200).json({ success: 'Bonus successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update bonus.' });
    }
});


export const get_all_eod = asyncHandler(async (req, res) => {
    try {
        const sql  = `SELECT * FROM eod`; // Use a parameterized query
                                  
        const [eod] = await db.query(sql);

        // Return the merged results in the response
        return res.status(200).json({ data: eod });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});


export const get_all_user_eod = asyncHandler(async (req, res) => {
    const { emp_id } = req.params; // Assuming emp_id is passed as a URL parameter

    try {
        const sql  = `SELECT * FROM eod WHERE emp_ID = ?`; // Use a parameterized query
                                  
        const [eod] = await db.query(sql, [emp_id]);

        // Return the merged results in the response
        return res.status(200).json({ data: eod });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});



export const delete_eod = asyncHandler(async (req, res) => {
    const { eod_id } = req.params; // Assuming emp_id is passed as a URL parameter

    try {
        const sql = 'DELETE FROM eod WHERE id = ?';
        const [result] = await db.query(sql, [eod_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'EOD not found.' });
        }

        return res.status(200).json({ success: 'EOD successfully deleted.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete eod.' });
    }
});
