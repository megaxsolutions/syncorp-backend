import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import { db } from '../../config/config.js'; // Import the database connection

import moment from 'moment-timezone';



function storeCurrentDateTime(expirationAmount, expirationUnit) {
    // Get the current date and time in Asia/Manila timezone
    const currentDateTime = moment.tz("Asia/Manila");

    // Calculate the expiration date and time
    const expirationDateTime = currentDateTime.clone().add(expirationAmount, expirationUnit);

    // Format the current date and expiration date
    const formattedExpirationDateTime = expirationDateTime.format('YYYY-MM-DD HH:mm:ss');

    // Return both current and expiration date-time
    return formattedExpirationDateTime;
}

export const create_incident_report = asyncHandler(async (req, res) => {
    const { emp_id, details } = req.params; // Assuming emp_id is passed as a URL parameter
        
    try {
        const sql = 'INSERT INTO incident_report (emp_ID, details, submitted_datetime) VALUES (?, ?, ?)';
        const [insert_data_holiday] = await db.query(sql, [emp_id, details, storeCurrentDateTime(0, 'hours') ]);
                
        
        // Return the merged results in the response
        return res.status(200).json({ data: incident_report });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});

export const get_all_user_incident_report = asyncHandler(async (req, res) => {
    const { emp_id } = req.params; // Assuming emp_id is passed as a URL parameter

    try {
        const sql  = 'SELECT * FROM incident_report WHERE emp_ID = ?'; // Use a parameterized query

        const [incident_report] = await db.query(sql, [emp_id]);

        // Return the merged results in the response
        return res.status(200).json({ data: incident_report });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});

export const get_all_incident_report = asyncHandler(async (req, res) => {
    try {
        const sql  = 'SELECT * FROM incident_report'; // Use a parameterized query

        const [incident_report] = await db.query(sql);

        // Return the merged results in the response
        return res.status(200).json({ data: incident_report });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});


export const update_incident_report = asyncHandler(async (req, res) => {
    const { emp_id, details } = req.params; // Assuming emp_id is passed as a URL parameter
    const { incident_report_id } = req.params; // Assuming holiday_id is passed as a URL parameter

    try {
        const sql = 'UPDATE incident_report SET emp_ID = ?, details = ?WHERE id = ?';        
        const [result] = await db.query(sql, [emp_id, details, incident_report_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Incident report not found.' });
        }

        return res.status(200).json({ success: 'Incident report successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update incident report.' });
    }
});
 

export const delete_incident_report = asyncHandler(async (req, res) => {
    const { incident_report_id } = req.params; // Assuming holiday_id is passed as a URL parameter

    try {
        const sql = 'DELETE FROM incident_report WHERE id = ?';
        const [result] = await db.query(sql, [incident_report_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Incident report not found.' });
        }

        return res.status(200).json({ success: 'Incident report successfully deleted.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete incident report.' });
    }
});




