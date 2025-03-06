import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import { db } from '../config/config.js'; // Import the database connection

import moment from 'moment-timezone';

export const create_department = asyncHandler(async (req, res) => {
    const { department_name, site_id } = req.body;

    try {
        const sql = 'INSERT INTO departments (departmentName, siteID) VALUES (?, ?)';
        const [insert_data_department] = await db.query(sql, [department_name, site_id]);
      
        // Return the merged results in the response
        return res.status(200).json({ success: 'Department successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create department.' });
    }
});

export const update_department = asyncHandler(async (req, res) => {
    const { department_name, site_id } = req.body;
    const { department_id } = req.params; // Assuming department_id is passed as a URL parameter

    try {
        const sql = 'UPDATE departments SET departmentName = ?, siteID = ? WHERE id = ?';
        const [result] = await db.query(sql, [department_name, site_id, department_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Department not found.' });
        }

        return res.status(200).json({ success: 'Department successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update department.' });
    }
});

export const delete_department = asyncHandler(async (req, res) => {
    const { department_id } = req.params; // Assuming department_id is passed as a URL parameter

    try {

        const sql = 'SELECT * FROM employee_profile WHERE departmentID = ?'; // Use a parameterized query
        const sql2 = 'DELETE FROM departments WHERE id = ?';

        const [data_employee_profile] = await db.query(sql, [department_id]);


        if(data_employee_profile.length >= 1) {
            return res.status(400).json({ error: `Cannot be deleted ${data_employee_profile.length == 1 ? `${ data_employee_profile.length } row has` : `${ data_employee_profile.length } rows have` } been affected.` });
        }

        if(data_employee_profile.length == 0) {
            const [result] = await db.query(sql2, [department_id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Department not found.' });
            }

            return res.status(200).json({ success: 'Department successfully deleted.' });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete department.' });
    }
});