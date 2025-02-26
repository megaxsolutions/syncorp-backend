import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import db from './../config/config.js'; // Import the database connection
import moment from 'moment-timezone';

export const create_leave_type = asyncHandler(async (req, res) => {
    const { leave_type } = req.body;

    try {
        const sql = 'INSERT INTO leave_type (type) VALUES (?)';
        const [insert_data_leave_type] = await db.query(sql, [leave_type]);
      
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
        const sql = 'UPDATE leave_type SET type = ? WHERE id = ?';
        const [update_data_leave_type] = await db.query(sql, [leave_type, leave_type_id]);
      
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