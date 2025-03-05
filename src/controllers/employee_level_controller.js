import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import { db } from '../config/config.js'; // Import the database connection

import moment from 'moment-timezone';

export const create_employee_level = asyncHandler(async (req, res) => {
    const { e_level } = req.body;

    try {
        const sql = 'INSERT INTO employee_levels (e_level) VALUES (?)';
        const [insert_data_site] = await db.query(sql, [e_level]);
      
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
        const sql = 'UPDATE employee_levels SET e_level = ? WHERE id = ?';
        const [result] = await db.query(sql, [e_level, e_level_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Employee level not found.' });
        }

        return res.status(200).json({ success: 'Employee level successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update employee level.' });
    }
});

export const delete_employee_level = asyncHandler(async (req, res) => {
    const { e_level_id } = req.params; // Assuming e_level_id is passed as a URL parameter

    try {
        const sql = 'SELECT * FROM employee_profile WHERE employee_level = ?'; // Use a parameterized query
        const sql2 = 'DELETE FROM employee_levels WHERE id = ?';

        const [data_employee_profile] = await db.query(sql, [e_level_id]);

        if(data_employee_profile.length >= 1) {
            return res.status(400).json({ error: `Cannot be deleted ${data_employee_profile.length == 1 ? `${ data_employee_profile.length } row has` : `${ data_employee_profile.length } rows have` } been affected.` });
        }

        if(data_employee_profile_standing.length == 0) {
            const [result] = await db.query(sql2, [e_level_id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Employee level not found.' });
            }

            return res.status(200).json({ success: 'Employee level successfully deleted.' });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete employee level.' });
    }
});