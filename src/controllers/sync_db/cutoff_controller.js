import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import { db } from '../../config/config.js'; // Import the database connection

import moment from 'moment-timezone';

export const get_latest_cutoff = asyncHandler(async (req, res) => {

    try {
        const sql = 'SELECT * FROM cutoff ORDER BY id DESC LIMIT 1';
        
        const [cutoff] = await db.query(sql);

        if (cutoff.length === 0) {
            return res.status(404).json({ error: 'No cutoff found.' });
        }
      
        // Return the merged results in the response
        return res.status(200).json({ data: cutoff[0] });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get data.' });
    }
});

export const create_cutoff = asyncHandler(async (req, res) => {
    const { start_date, end_date } = req.body;

    try {
        const sql = 'INSERT INTO cutoff (startDate, endDate, status) VALUES (?, ?)';
        const [insert_data_site] = await db.query(sql, [start_date, end_date]);
      
        // Return the merged results in the response
        return res.status(200).json({ success: 'Cutoff successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create cutoff.' });
    }
});

export const update_cutoff = asyncHandler(async (req, res) => {
    const { start_date, end_date, status } = req.body;
    const { cutoff_id } = req.params; // Assuming cutoff_id is passed as a URL parameter

    try {
        const sql = 'UPDATE cutoff SET startDate = ?, endDate = ?, status = ? WHERE id = ?';
        const [result] = await db.query(sql, [start_date, end_date, status, cutoff_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Cutoff not found.' });
        }

        return res.status(200).json({ success: 'Cutoff successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update cutoff.' });
    }
});

export const delete_cutoff = asyncHandler(async (req, res) => {
    const { cutoff_id } = req.params; // Assuming cutoff_id is passed as a URL parameter

    try {
        const sql = 'DELETE FROM cutoff WHERE id = ?';
        const [result] = await db.query(sql, [cutoff_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Cutoff not found.' });
        }

        return res.status(200).json({ success: 'Cutoff successfully deleted.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete cutoff.' });
    }
});