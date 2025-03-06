import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import { db } from '../config/config.js'; // Import the database connection

import moment from 'moment-timezone';

// Function to get the current date and time in Asia/Manila
function storeCurrentDateTime(expirationAmount, expirationUnit) {
    const currentDateTime = moment.tz("Asia/Manila");
    const expirationDateTime = currentDateTime.clone().add(expirationAmount, expirationUnit);
    return expirationDateTime.format('YYYY-MM-DD HH:mm:ss');
}

export const create_overtime_type = asyncHandler(async (req, res) => {
    const { overtime_type } = req.body;

    try {
        const sql  = 'INSERT INTO overtime_type (type) VALUES (?)';
        const sql2 = 'SELECT * FROM admin_login WHERE JSON_CONTAINS(user_level, ?)';
        const sql3 = 'INSERT INTO logs (details, datetime, user_level, emp_ID, is_read) VALUES (?, ?, ?, ?, ?)';

        const [insert_data_overtime_type] = await db.query(sql, [overtime_type]);
        const [data_admin_login] = await db.query(sql2, [JSON.stringify(1)]);

        const insert_logs_admin_level = await Promise.all(
            data_admin_login.map(async (admin_login) => {
                await db.query(sql3, ['New overtime type added: ' + overtime_type, storeCurrentDateTime(0, 'hours'), 1, admin_login.emp_ID, 0]);
                return admin_login.emp_ID;
            })
        );

   
      
        return res.status(200).json({ success: 'Overtime type successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create overtime type.' });
    }
});

export const update_overtime_type = asyncHandler(async (req, res) => {
    const { overtime_type } = req.body;
    const { overtime_type_id } = req.params; // Assuming overtime_type_id is passed as a URL parameter

    try {
        const sql  = 'SELECT * FROM overtime_type WHERE id = ?';
        const sql2 = 'SELECT * FROM admin_login WHERE JSON_CONTAINS(user_level, ?)';
        const sql3 = 'INSERT INTO logs (details, datetime, user_level, emp_ID, is_read) VALUES (?, ?, ?, ?, ?)';
        const sql4 = 'UPDATE overtime_type SET type = ? WHERE id = ?';

        const [data_overtime_type] = await db.query(sql, [overtime_type_id]);
        const [data_admin_login] = await db.query(sql2, [JSON.stringify(1)]);

        if (data_overtime_type.length === 0) {
            return res.status(404).json({ error: 'Overtime type not found.' });
        }

        const insert_logs_admin_level = await Promise.all(
            data_admin_login.map(async (admin_login) => {
                await db.query(sql3, ['Overtime type updated from: ' + data_overtime_type[0]['type'] + ' to: ' + overtime_type, storeCurrentDateTime(0, 'hours'), 1, admin_login.emp_ID, 0]);
                return admin_login.emp_ID;
            })
        );

        const [update_data_overtime_type] = await db.query(sql4, [overtime_type, overtime_type_id]);
      
        return res.status(200).json({ success: 'Overtime type successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update overtime type.' });
    }
});

export const get_all_overtime_type = asyncHandler(async (req, res) => {
    try {
        const sql = 'SELECT * FROM overtime_type'; // Use a parameterized query

        const [overtime_type] = await db.query(sql);

        return res.status(200).json({ data: overtime_type });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});

export const delete_overtime_type = asyncHandler(async (req, res) => {
    const { overtime_type_id } = req.params; // Assuming overtime_type_id is passed as a URL parameter
    
    try {
        const sql  = 'SELECT * FROM overtime_request WHERE ot_type = ?'; // Use a parameterized query
        const sql2 = 'DELETE FROM overtime_type WHERE id = ?';

        const [data_overtime_request] = await db.query(sql, [overtime_type_id]);

        if(data_overtime_request.length >= 1) {
            return res.status(400).json({ error: `Cannot be deleted ${data_overtime_request.length == 1 ? `${ data_overtime_request.length } row has` : `${ data_overtime_request.length } rows have` } been affected.` });
        }

        if(data_overtime_request.length == 0) {
            const [result] = await db.query(sql2, [overtime_type_id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Overtime type not found.' });
            }

            return res.status(200).json({ success: 'Overtime type successfully deleted.' });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete overtime type.' });
    }
});