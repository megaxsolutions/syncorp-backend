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

export const get_all_incident_report_supervisor = asyncHandler(async (req, res) => {
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
        SELECT incident_report.id, incident_report.emp_ID,
        incident_report.details
        DATE_FORMAT(incident_report.submitted_datetime, '%Y-%m-%d %H:%i:%s') AS submitted_datetime
        FROM incident_report
        LEFT JOIN employee_profile ON incident_report.emp_ID = employee_profile.emp_ID
        WHERE employee_profile.clusterID IN (${placeholders})
        `;

        //const sql2 = `SELECT * FROM employee_profile WHERE clusterID IN (${placeholders})`;

        const [incident_report] = await db.query(sql2, bucketArray);

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




