import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import { db } from '../config/config.js'; // Import the database connection

import moment from 'moment-timezone';

export const create_leave_type = asyncHandler(async (req, res) => {
    const { leave_type } = req.body;

    try {
        const sql = 'INSERT INTO leave_type (type) VALUES (?)';
        const sql2 = 'SELECT * FROM admin_login WHERE JSON_CONTAINS(user_level, ?)';
        const sql3 = 'INSERT INTO logs (details, datetime, user_level, emp_ID, is_read) VALUES (?, ?, ?, ?, ?)';

        const [insert_data_leave_type] = await db.query(sql, [leave_type]);
        const [data_admin_login] = await db.query(sql2, [JSON.stringify(1)]);
   
        const insert_logs_admin_level = await Promise.all(
            data_admin_login.map(async (admin_login) => {
                await db.query(sql3, ['New leave type added: ' + leave_type, storeCurrentDateTime(0, 'hours'), 1, admin_login.emp_ID, 0]);
                return admin_login.emp_ID;
            })
        );

      
        // Return the merged results in the response
        return res.status(200).json({ success: 'Leave type successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create leave type.' });
    }
});

export const update_leave_type = asyncHandler(async (req, res) => {
    const { leave_type } = req.body;
    const { leave_type_id } = req.params; // Assuming leave_type_id is passed as a URL parameter

    try {
        const sql  = 'SELECT * FROM leave_type WHERE id = ?';
        const sql2 = 'SELECT * FROM admin_login WHERE JSON_CONTAINS(user_level, ?)';
        const sql3 = 'INSERT INTO logs (details, datetime, user_level, emp_ID, is_read) VALUES (?, ?, ?, ?, ?)';
        const sql4 = 'UPDATE leave_type SET type = ? WHERE id = ?';

        const [data_leave_type] = await db.query(sql, [leave_type_id]);
        const [data_admin_login] = await db.query(sql2, [JSON.stringify(1)]);

        if (data_leave_type.length === 0) {
            return res.status(404).json({ error: 'Leave type not found.' });
        }

        const insert_logs_admin_level = await Promise.all(
            data_admin_login.map(async (admin_login) => {
                await db.query(sql3, ['Leave type updated from: ' + data_leave_type[0]['type'] + ' to: ' + leave_type, storeCurrentDateTime(0, 'hours'), 1, admin_login.emp_ID, 0]);
                return admin_login.emp_ID;
            })
        );

        const [update_data_leave_type] = await db.query(sql4, [leave_type, leave_type_id]);
      
        // Return the merged results in the response
        return res.status(200).json({ success: 'Leave type successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update leave type.' });
    }
});

export const get_all_leave_type = asyncHandler(async (req, res) => {
    try {
        const sql = 'SELECT * FROM leave_type'; // Use a parameterized query

        const [leave_type] = await db.query(sql);

        // Return the merged results in the response
        return res.status(200).json({ data: leave_type });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});

export const delete_leave_type = asyncHandler(async (req, res) => {
    const { leave_type_id } = req.params; // Assuming leave_type_id is passed as a URL parameter

    try {
        const sql = 'SELECT * FROM leave_request WHERE leave_type = ?'; // Use a parameterized query
        const sql2 = 'DELETE FROM leave_type WHERE id = ?';

        const [data_leave_request] = await db.query(sql, [leave_type_id]);

        if(data_leave_request.length >= 1) {
            return res.status(400).json({ error: `Cannot be deleted ${data_leave_request.length == 1 ? `${ data_leave_request.length } row has` : `${ data_leave_request.length } rows have` } been affected.` });
        }

        if(data_leave_request.length == 0) {
            const [result] = await db.query(sql2, [leave_type_id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Leave type not found.' });
            }

            return res.status(200).json({ success: 'Leave type successfully deleted.' });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete leave type.' });
    }
});