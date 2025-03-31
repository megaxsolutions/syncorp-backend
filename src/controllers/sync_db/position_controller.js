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

export const create_position = asyncHandler(async (req, res) => {
    const { position_name } = req.body;

    try {
        const sql  = 'INSERT INTO positions (position) VALUES (?)';
        const sql2 = 'SELECT * FROM admin_login WHERE JSON_CONTAINS(user_level, ?)';
        const sql3 = 'INSERT INTO logs (details, datetime, user_level, emp_ID, is_read) VALUES (?, ?, ?, ?, ?)';


        const [insert_data_position] = await db.query(sql, [position_name]);
        const [data_admin_login] = await db.query(sql2, [JSON.stringify(1)]);

        const insert_logs_admin_level = await Promise.all(
            data_admin_login.map(async (admin_login) => {
                await db.query(sql3, ['New postion added: ' + position_name, storeCurrentDateTime(0, 'hours'), 1, admin_login.emp_ID, 0]);
                return admin_login.emp_ID;
            })
        );

      
        // Return the merged results in the response
        return res.status(200).json({ success: 'Position successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create position.' });
    }
});

export const update_position = asyncHandler(async (req, res) => {
    const { position_name } = req.body;
    const { position_id } = req.params; // Assuming position_id is passed as a URL parameter

    try {
        const sql  = 'SELECT * FROM positions WHERE id = ?';
        const sql2 = 'SELECT * FROM admin_login WHERE JSON_CONTAINS(user_level, ?)';
        const sql3 = 'INSERT INTO logs (details, datetime, user_level, emp_ID, is_read) VALUES (?, ?, ?, ?, ?)';
        const sql4 = 'UPDATE positions SET position = ? WHERE id = ?';

        const [data_admin_position] = await db.query(sql, [position_id]);
        const [data_admin_login] = await db.query(sql2, [JSON.stringify(1)]);

        if (data_admin_position.length === 0) {
            return res.status(404).json({ error: 'Position not found.' });
        }

        const insert_logs_admin_level = await Promise.all(
            data_admin_login.map(async (admin_login) => {
                await db.query(sql3, ['Position updated from: ' + data_admin_position[0]['position'] + ' to: ' + position_name, storeCurrentDateTime(0, 'hours'), 1, admin_login.emp_ID, 0]);
                return admin_login.emp_ID;
            })
        );

        const [result] = await db.query(sql4, [position_name, position_id]);

        return res.status(200).json({ success: 'Position successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update position.' });
    }
});

export const delete_position = asyncHandler(async (req, res) => {
    const { position_id } = req.params; // Assuming position_id is passed as a URL parameter

    try {
        const sql  = 'SELECT * FROM positions WHERE id = ?';
        const sql2 = 'SELECT * FROM admin_login WHERE JSON_CONTAINS(user_level, ?)';
        const sql3 = 'INSERT INTO logs (details, datetime, user_level, emp_ID, is_read) VALUES (?, ?, ?, ?, ?)';
        const sql4 = 'SELECT * FROM employee_profile_standing WHERE positionID = ?'; // Use a parameterized query
        const sql5 = 'DELETE FROM positions WHERE id = ?';

        const [data_position] = await db.query(sql, [position_id]);
        const [data_admin_login] = await db.query(sql2, [JSON.stringify(1)]);

        if (data_position.length === 0) {
            return res.status(404).json({ error: 'Position not found.' });
        }

        const [data_employee_profile_standing] = await db.query(sql4, [position_id]);

        if(data_employee_profile_standing.length >= 1) {
            return res.status(400).json({ error: `Cannot be deleted ${data_employee_profile_standing.length == 1 ? `${ data_employee_profile_standing.length } row has` : `${ data_employee_profile_standing.length } rows have` } been affected.` });
        }

        const insert_logs_admin_level = await Promise.all(
            data_admin_login.map(async (admin_login) => {
                await db.query(sql3, ['Position has been deleted: ' + data_position[0]['position'], storeCurrentDateTime(0, 'hours'), 1, admin_login.emp_ID, 0]);
                return admin_login.emp_ID;
            })
        );

        if(data_employee_profile_standing.length == 0) {
            const [result] = await db.query(sql5, [position_id]);

            return res.status(200).json({ success: 'Position successfully deleted.' });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete position.' });
    }
});