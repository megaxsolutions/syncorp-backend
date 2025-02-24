import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import db from './../config/config.js'; // Import the database connection
import moment from 'moment-timezone';

export const create_position = asyncHandler(async (req, res) => {
    const { position_name } = req.body;

    try {
        const sql = 'INSERT INTO positions (position) VALUES (?)';
        const [insert_data_position] = await db.query(sql, [position_name]);
      
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
        const sql = 'UPDATE positions SET position = ? WHERE id = ?';
        const [result] = await db.query(sql, [position_name, position_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Position not found.' });
        }

        return res.status(200).json({ success: 'Position successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update position.' });
    }
});

export const delete_position = asyncHandler(async (req, res) => {
    const { position_id } = req.params; // Assuming position_id is passed as a URL parameter

    try {
        const sql = 'DELETE FROM positions WHERE id = ?';
        const [result] = await db.query(sql, [position_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Position not found.' });
        }

        return res.status(200).json({ success: 'Position successfully deleted.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete position.' });
    }
});