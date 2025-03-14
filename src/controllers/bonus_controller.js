import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import { db } from '../config/config.js'; // Import the database connection

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

export const create_bonus = asyncHandler(async (req, res) => {
    const { perf_bonus, client_funded,  supervisor_emp_id, emp_id } = req.body;

    try {
        const sql = 'INSERT INTO bonus (perf_bonus, client_funded, plotted_by, emp_ID) VALUES (?, ?, ?, ?)';

        const [insert_data_break] = await db.query(sql, [perf_bonus, client_funded, supervisor_emp_id, emp_id]);

    
        // Return the merged results in the response
        return res.status(200).json({ success: 'Bonus successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create bonus.' });
    }
});

export const update_bonus = asyncHandler(async (req, res) => {
    const { perf_bonus, client_funded,  supervisor_emp_id, emp_id } = req.body;
    const { bonus_id } = req.params; // Assuming emp_id is passed as a URL parameter

    try {

        const sql2 = 'UPDATE bonus SET perf_bonus = ?, client_funded = ?, plotted_by = ?, emp_ID = ? WHERE id = ?';
        const [update_data_breaks] = await db.query(sql2, [perf_bonus, client_funded, supervisor_emp_id, emp_id, bonus_id]);

        // Return the merged results in the response
        return res.status(200).json({ success: 'Bonus successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update bonus.' });
    }
});

export const update_approval_bonus = asyncHandler(async (req, res) => {
    const { status, supervisor_emp_id } = req.body;
    const { bonus_id } = req.params; // Assuming emp_id is passed as a URL parameter

    try {
        const sql = 'UPDATE bonus SET status = ?, approved_by = ?, datetime_approved = ? WHERE id = ?';
        const [update_data_bonus] = await db.query(sql, [status, supervisor_emp_id, storeCurrentDateTime(0, 'hours'), bonus_id]);

        // Return the merged results in the response
        return res.status(200).json({ success: 'Bonus approval successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update bonus.' });
    }
});

export const update_approval_bonus_admin = asyncHandler(async (req, res) => {
    const { status, supervisor_emp_id } = req.body;
    const { bonus_id } = req.params; // Assuming emp_id is passed as a URL parameter

    try {
        const sql = 'UPDATE bonus SET status2 = ?, approved_by2 = ?, datetime_approved2 = ? WHERE id = ?';
        const [update_data_bonus] = await db.query(sql, [status, supervisor_emp_id, storeCurrentDateTime(0, 'hours'), bonus_id]);

        // Return the merged results in the response
        return res.status(200).json({ success: 'Bonus approval successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update bonus.' });
    }
});

export const get_all_bonus = asyncHandler(async (req, res) => {
    try {
        const sql  = `SELECT id,
        perf_bonus, client_funded, plotted_by, 
        approved_by, approved_by2,
        DATE_FORMAT(datetime_approved, '%Y-%m-%d %H:%i:%s') AS datetime_approved,  
        DATE_FORMAT(datetime_approved2, '%Y-%m-%d %H:%i:%s') AS datetime_approved2,  
        emp_ID
        FROM bonus`; // Use a parameterized query
                                  
        const [bonus] = await db.query(sql);

        // Return the merged results in the response
        return res.status(200).json({ data: bonus });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});


export const get_all_bonus_supervisor = asyncHandler(async (req, res) => {
    const { supervisor_emp_id } = req.params; // Assuming cluster_id is passed as a URL parameter

    try {
        const sql = 'SELECT * FROM admin_login WHERE emp_ID = ?'; // Use a parameterized query

        const [data_admin_login] = await db.query(sql, [supervisor_emp_id]);

        if (data_admin_login.length === 0) {
            return res.status(404).json({ error: 'Supervisor not found.' });
        }

        const bucketArray = JSON.parse(data_admin_login[0]['bucket'] == null || data_admin_login[0]['bucket'] == "" || JSON.parse(data_admin_login[0]['bucket']).length == 0 ? "[0]" : data_admin_login[0]['bucket'] );
	    const placeholders = bucketArray.map(() => '?').join(', ');

        const sql2  = `SELECT bonus.id,
        bonus.perf_bonus, bonus.client_funded, bonus.plotted_by, 
        bonus.approved_by, bonus.approved_by2,
        DATE_FORMAT(bonus.datetime_approved, '%Y-%m-%d %H:%i:%s') AS datetime_approved,  
        DATE_FORMAT(bonus.datetime_approved2, '%Y-%m-%d %H:%i:%s') AS datetime_approved2,  
        bonus.emp_ID
        FROM bonus
        LEFT JOIN employee_profile ON bonus.emp_ID = employee_profile.emp_ID
        WHERE employee_profile.clusterID IN (${placeholders})
        `; // Use a parameterized query
                                  
        const [bonus] = await db.query(sql2, bucketArray);

        // Return the merged results in the response
        return res.status(200).json({ data: bonus });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});


export const delete_bonus = asyncHandler(async (req, res) => {
    const { bonus_id } = req.params; // Assuming holiday_id is passed as a URL parameter

    try {
        const sql = 'DELETE FROM bonus WHERE id = ?';
        const [result] = await db.query(sql, [bonus_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Bonus not found.' });
        }

        return res.status(200).json({ success: 'Bonus successfully deleted.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete bonus.' });
    }
});
