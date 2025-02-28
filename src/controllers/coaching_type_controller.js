import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import db from './../config/config.js'; // Import the database connection
import moment from 'moment-timezone';

export const create_coaching_type = asyncHandler(async (req, res) => {
    const { coaching_type } = req.body;

    try {
        const sql = 'INSERT INTO coaching_types (coaching_type) VALUES (?)';
        const [insert_data_coaching_types] = await db.query(sql, [coaching_type]);
      
        // Return the merged results in the response
        return res.status(200).json({ success: 'Coaching type successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create coaching type.' });
    }
});

export const update_coaching_type = asyncHandler(async (req, res) => {
    const { coaching_type } = req.body;
    const { coaching_type_id } = req.params; // Assuming cluster_id is passed as a URL parameter

    try {
        const sql = 'UPDATE coaching_types SET coaching_type = ? WHERE id = ?';
        const [result] = await db.query(sql, [coaching_type, coaching_type_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Coaching type not found.' });
        }

        return res.status(200).json({ success: 'Coaching type successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update coaching type.' });
    }
});

export const delete_coaching_type = asyncHandler(async (req, res) => {
    const { coaching_type_id } = req.params; // Assuming cluster_id is passed as a URL parameter

    try {
        const sql  = 'SELECT * FROM coaching WHERE coaching_type = ?'; // Use a parameterized query
        const sql2 = 'DELETE FROM coaching_types WHERE id = ?';



        const [data_coaching] = await db.query(sql, [coaching_type_id]);

        if(data_coaching.length >= 1) {
            return res.status(400).json({ error: `Cannot be deleted ${data_coaching.length == 1 ? `${ data_coaching.length } row has` : `${ data_coaching.length } rows have` } been affected.` });
        }


        if(data_coaching.length == 0) {
            const [result] = await db.query(sql2, [coaching_type_id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Cluster not found.' });
            }

            return res.status(200).json({ success: 'Cluster successfully deleted.' });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete cluster.' });
    }
});


export const get_all_coaching_type = asyncHandler(async (req, res) => {
    try {
        const sql  = 'SELECT * FROM coaching_types'; // Use a parameterized query

        const [coaching_types] = await db.query(sql);

        // Return the merged results in the response
        return res.status(200).json({ data: coaching_types });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});