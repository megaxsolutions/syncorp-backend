import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import { db } from '../config/config.js'; // Import the database connection

import moment from 'moment-timezone';

export const create_cluster = asyncHandler(async (req, res) => {
    const { clustert_name, departmentID, site_id } = req.body;

    try {
        const sql = 'INSERT INTO clusters (clusterName, departmentID, siteID) VALUES (?, ?, ?)';
        const [insert_data_cluster] = await db.query(sql, [clustert_name, departmentID, site_id]);
      
        // Return the merged results in the response
        return res.status(200).json({ success: 'Cluster successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create cluster.' });
    }
});

export const update_cluster = asyncHandler(async (req, res) => {
    const { clustert_name, departmentID, site_id } = req.body;
    const { cluster_id } = req.params; // Assuming cluster_id is passed as a URL parameter

    try {
        const sql = 'UPDATE clusters SET clusterName = ?, departmentID = ?, siteID = ? WHERE id = ?';
        const [result] = await db.query(sql, [clustert_name, departmentID, site_id, cluster_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Cluster not found.' });
        }

        return res.status(200).json({ success: 'Cluster successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update cluster.' });
    }
});

export const delete_cluster = asyncHandler(async (req, res) => {
    const { cluster_id } = req.params; // Assuming cluster_id is passed as a URL parameter

    try {
        const sql  = 'SELECT * FROM employee_profile WHERE clusterID = ?'; // Use a parameterized query
        const sql2 = 'DELETE FROM clusters WHERE id = ?';



        const [data_employee_profile] = await db.query(sql, [cluster_id]);

        if(data_employee_profile.length >= 1) {
            return res.status(400).json({ error: `Cannot be deleted ${data_employee_profile.length == 1 ? `${ data_employee_profile.length } row has` : `${ data_employee_profile.length } rows have` } been affected.` });
        }


        if(data_employee_profile.length == 0) {
            const [result] = await db.query(sql2, [cluster_id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Cluster not found.' });
            }

            return res.status(200).json({ success: 'Cluster successfully deleted.' });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete cluster.' });
    }
});