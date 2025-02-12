import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import db from './../config/config.js'; // Import the database connection
import moment from 'moment-timezone';


export const create_admin_level = asyncHandler(async (req, res) => {
    const { admin_level } = req.body;

    try {
        const sql = 'INSERT INTO admin_level (level) VALUES (?)';
        const [insert_data_site] = await db.promise().query(sql, [admin_level]);
      
        // Return the merged results in the response
        return res.status(200).json({ success: 'Admin level successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create admin level.' });
    }
});


export const update_admin_level = asyncHandler(async (req, res) => {
    const { admin_level } = req.body;
    const { admin_level_id } = req.params; // Assuming department_id is passed as a URL parameter


    try {
        const sql = 'UPDATE admin_level SET level = ? WHERE id = ?';
        const [result] = await db.promise().query(sql, [admin_level, admin_level_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Admin level not found.' });
        }

        return res.status(200).json({ success: 'Admin level successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update admin level.' });
    }
});



export const delete_admin_level = asyncHandler(async (req, res) => {
    const { admin_level_id } = req.params; // Assuming department_id is passed as a URL parameter

    try {
        const sql = 'DELETE FROM admin_level WHERE id = ?';
        const [result] = await db.promise().query(sql, [admin_level_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Admin level not found.' });
        }

        return res.status(200).json({ success: 'Admin level successfully deleted.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete admin level.' });
    }
});

  
  