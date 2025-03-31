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

export const create_employee_level = asyncHandler(async (req, res) => {
    const { e_level } = req.body;

    try {
        const sql  = 'INSERT INTO employee_levels (e_level) VALUES (?)';
        const sql2 = 'SELECT * FROM admin_login WHERE JSON_CONTAINS(user_level, ?)';
        const sql3 = 'INSERT INTO logs (details, datetime, user_level, emp_ID, is_read) VALUES (?, ?, ?, ?, ?)';

        const [insert_data_site] = await db.query(sql, [e_level]);
        const [data_admin_login] = await db.query(sql2, [JSON.stringify(1)]);

        const insert_logs_admin_level = await Promise.all(
            data_admin_login.map(async (admin_login) => {
                await db.query(sql3, ['New employee level added: ' + e_level, storeCurrentDateTime(0, 'hours'), 1, admin_login.emp_ID, 0]);
                return admin_login.emp_ID;
            })
        );
   
      
        // Return the merged results in the response
        return res.status(200).json({ success: 'Employee level successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create employee level.' });
    }
});

export const update_employee_level = asyncHandler(async (req, res) => {
    const { e_level } = req.body;
    const { e_level_id } = req.params; // Assuming e_level_id is passed as a URL parameter

    try {
        const sql  = 'SELECT * FROM employee_levels WHERE id = ?';
        const sql2 = 'SELECT * FROM admin_login WHERE JSON_CONTAINS(user_level, ?)';
        const sql3 = 'INSERT INTO logs (details, datetime, user_level, emp_ID, is_read) VALUES (?, ?, ?, ?, ?)';
        const sql4 = 'UPDATE employee_levels SET e_level = ? WHERE id = ?';


        const [data_employee_level] = await db.query(sql, [e_level_id]);
        const [data_admin_login] = await db.query(sql2, [JSON.stringify(1)]);

        if (data_employee_level.length === 0) {
            return res.status(404).json({ error: 'Employee level not found.' });
        }

        
        const insert_logs_admin_level = await Promise.all(
            data_admin_login.map(async (admin_login) => {
                await db.query(sql3, ['Employee level updated from: ' + data_employee_level[0]['e_level'] + ' to: ' + e_level, storeCurrentDateTime(0, 'hours'), 1, admin_login.emp_ID, 0]);
                return admin_login.emp_ID;
            })
        );

        const [result] = await db.query(sql4, [e_level, e_level_id]);

        return res.status(200).json({ success: 'Employee level successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update employee level.' });
    }
});

export const delete_employee_level = asyncHandler(async (req, res) => {
    const { e_level_id } = req.params; // Assuming e_level_id is passed as a URL parameter

    try {
        const sql  = 'SELECT * FROM employee_levels WHERE id = ?';
        const sql2 = 'SELECT * FROM admin_login WHERE JSON_CONTAINS(user_level, ?)';
        const sql3 = 'INSERT INTO logs (details, datetime, user_level, emp_ID, is_read) VALUES (?, ?, ?, ?, ?)';
        const sql4 = 'SELECT * FROM employee_profile WHERE employee_level = ?'; // Use a parameterized query
        const sql5 = 'DELETE FROM employee_levels WHERE id = ?';


        const [data_employee_level] = await db.query(sql, [e_level_id]);
        const [select_data_admin_login] = await db.query(sql2, [JSON.stringify(1)]);

        if (data_employee_level.length === 0) {
            return res.status(404).json({ error: 'Employee level not found.' });
        }

        const [data_employee_profile] = await db.query(sql4, [e_level_id]);

        if(data_employee_profile.length >= 1) {
            return res.status(400).json({ error: `Cannot be deleted ${data_employee_profile.length == 1 ? `${ data_employee_profile.length } row has` : `${ data_employee_profile.length } rows have` } been affected.` });
        }

        const insert_logs_admin_level = await Promise.all(
            select_data_admin_login.map(async (admin_login) => {
                await db.query(sql3, ['Employee level has been deleted: ' + data_employee_level[0]['e_level'], storeCurrentDateTime(0, 'hours'), 1, admin_login.emp_ID, 0]);
                return admin_login.emp_ID;
            })
        );

        if(data_employee_profile_standing.length == 0) {
            const [result] = await db.query(sql5, [e_level_id]);

            return res.status(200).json({ success: 'Employee level successfully deleted.' });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete employee level.' });
    }
});