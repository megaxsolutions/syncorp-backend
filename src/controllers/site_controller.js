import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import db from './../config/config.js'; // Import the database connection
import moment from 'moment-timezone';

export const create_site = asyncHandler(async (req, res) => {
    const { site_name } = req.body;

    try {
        const sql = 'INSERT INTO sites (siteName) VALUES (?)';
        const [insert_data_site] = await db.query(sql, [site_name]);
      
        // Return the merged results in the response
        return res.status(200).json({ success: 'Site successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create site.' });
    }
});

export const update_site = asyncHandler(async (req, res) => {
    const { site_name } = req.body;
    const { site_id } = req.params; // Assuming site_id is passed as a URL parameter

    try {
        const sql = 'UPDATE sites SET siteName = ? WHERE id = ?';
        const [result] = await db.query(sql, [site_name, site_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Site not found.' });
        }

        return res.status(200).json({ success: 'Site successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update site.' });
    }
});

export const delete_site = asyncHandler(async (req, res) => {
    const { site_id } = req.params; // Assuming site_id is passed as a URL parameter

    try {
        const sql  = 'SELECT * FROM employee_profile WHERE siteID = ?'; // Use a parameterized query
        const sql2 = 'SELECT * FROM departments WHERE siteID = ?'; // Use a parameterized query
        const sql3 = 'DELETE FROM sites WHERE id = ?';


        const [data_employee_profile] = await db.query(sql, [site_id]);
        const [data_departments] = await db.query(sql2, [site_id]);


        if(data_employee_profile.length >= 1) {
            return res.status(400).json({ error: `Cannot be deleted ${data_employee_profile.length == 1 ? `${ data_employee_profile.length } row has` : `${ data_employee_profile.length } rows have` } been affected.` });
        }

        if(data_departments.length >= 1) {
            return res.status(400).json({ error: `Cannot be deleted ${data_departments.length == 1 ? `${ data_departments.length } row has` : `${ data_departments.length } rows have` } been affected.` });
        }

        if(data_employee_profile.length == 0) {
            const [result] = await db.query(sql3, [site_id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Site not found.' });
            }

            return res.status(200).json({ success: 'Site successfully deleted.' });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete site.' });
    }
});