import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import { db } from '../../config/config.js'; // Import the database connection

import moment from 'moment-timezone';

function storeCurrentDateTime(expirationAmount, expirationUnit) {
    // Get the current date and time in Asia/Manila timezone
    const currentDateTime = moment.tz("Asia/Manila");

    // Calculate the expiration date and time
    const expirationDateTime = currentDateTime.clone().add(expirationAmount, expirationUnit);

    // Format the current date and expiration date
    const formattedExpirationDateTime = expirationDateTime.format('YYYY-MM-DD HH:mm:ss');

    // Return both current and expiration date-time
    return formattedExpirationDateTime;
 
}

export const create_cluster = asyncHandler(async (req, res) => {
    const { clustert_name, departmentID, site_id } = req.body;

    try {

        const sql  = 'SELECT * FROM departments WHERE id = ?';
        const sql2 = 'SELECT * FROM sites WHERE id = ?';
        const sql3 = 'INSERT INTO clusters (clusterName, departmentID, siteID) VALUES (?, ?, ?)';
        const sql4 = 'SELECT * FROM admin_login WHERE JSON_CONTAINS(user_level, ?)';
        const sql5 = 'INSERT INTO logs (details, datetime, user_level, emp_ID, is_read) VALUES (?, ?, ?, ?, ?)';

        const [data_department] = await db.query(sql, [departmentID]);
        const [data_site] = await db.query(sql2, [site_id]);
  
    
        if (data_department.length === 0) {
            return res.status(404).json({ error: 'Department not found.' });
        }

        if (data_site.length === 0) {
            return res.status(404).json({ error: 'Site not found.' });
        }

              
        const [insert_data_cluster] = await db.query(sql3, [clustert_name, departmentID, site_id]);
        const [data_admin_login] = await db.query(sql4, [JSON.stringify(1)]);

        const insert_logs_admin_level = await Promise.all(
            data_admin_login.map(async (admin_login) => {
                await db.query(sql5, ['New cluster added: ' + clustert_name + ' - ' + data_site[0]['siteName'] + ' - ' + data_department[0]['departmentName'], storeCurrentDateTime(0, 'hours'), 1, admin_login.emp_ID, 0]);
                return admin_login.emp_ID;
            })
        );

      
        // Return the merged results in the response
        return res.status(200).json({ success: 'Cluster successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create cluster.', data : error });
    }
});

export const update_cluster = asyncHandler(async (req, res) => {
    const { clustert_name, departmentID, site_id } = req.body;
    const { cluster_id } = req.params; // Assuming cluster_id is passed as a URL parameter

    try {

        const sql  = 'SELECT * FROM clusters WHERE id = ?';
        const sql2 = 'SELECT * FROM departments WHERE id = ?';
        const sql3 = 'SELECT * FROM sites WHERE id = ?';
        const sql4 = 'SELECT * FROM departments WHERE id = ?';
        const sql5 = 'SELECT * FROM sites WHERE id = ?';
        const sql6 = 'SELECT * FROM admin_login WHERE JSON_CONTAINS(user_level, ?)';
        const sql7 = 'INSERT INTO logs (details, datetime, user_level, emp_ID, is_read) VALUES (?, ?, ?, ?, ?)';
        const sql8 = 'UPDATE clusters SET clusterName = ?, departmentID = ?, siteID = ? WHERE id = ?';

        const [data_cluster] = await db.query(sql, [cluster_id]);
        const [data_department] = await db.query(sql2, [data_cluster[0]['departmentID']]);
        const [data_site] = await db.query(sql3, [data_cluster[0]['siteID']]);
        const [data_department_2] = await db.query(sql4, [departmentID]);
        const [data_site_2] = await db.query(sql5, [site_id]);
        const [data_admin_login] = await db.query(sql6, [JSON.stringify(1)]);

        if (data_department_2.length === 0) {
            return res.status(404).json({ error: 'Department not found.' });
        }

        if (data_site_2.length === 0) {
            return res.status(404).json({ error: 'Site not found.' });
        }

        const insert_logs_admin_level = await Promise.all(
            data_admin_login.map(async (admin_login) => {
                await db.query(sql7, ['Cluster updated from: ' 
                + data_cluster[0]['clusterName'] + ' - ' + data_site[0]['siteName'] +  ' - ' + data_department[0]['departmentName'] + ' to: ' 
                + clustert_name + ' - ' + data_site_2[0]['siteName'] + ' - ' + data_department_2[0]['departmentName'], storeCurrentDateTime(0, 'hours'), 1, admin_login.emp_ID, 0]);

                return admin_login.emp_ID;
            })
        );




        const [result] = await db.query(sql8, [clustert_name, departmentID, site_id, cluster_id]);

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
        const sql  = 'SELECT * FROM clusters WHERE id = ?';
        const sql2 = 'SELECT * FROM departments WHERE id = ?';
        const sql3 = 'SELECT * FROM sites WHERE id = ?';
        const sql4 = 'SELECT * FROM admin_login WHERE JSON_CONTAINS(user_level, ?)';
        const sql5 = 'INSERT INTO logs (details, datetime, user_level, emp_ID, is_read) VALUES (?, ?, ?, ?, ?)';
        const sql6 = 'SELECT * FROM employee_profile WHERE clusterID = ?'; // Use a parameterized query
        const sql7 = 'DELETE FROM clusters WHERE id = ?';


        const [data_cluster] = await db.query(sql, [cluster_id]);
        const [data_department] = await db.query(sql2, [data_cluster[0]['departmentID']]);
        const [data_site] = await db.query(sql3, [data_cluster[0]['siteID']]);


        if (data_department.length === 0) {
            return res.status(404).json({ error: 'Department not found.' });
        }

        if (data_site.length === 0) {
            return res.status(404).json({ error: 'Site not found.' });
        }

        const [data_admin_login] = await db.query(sql4, [JSON.stringify(1)]);

   

        const [data_employee_profile] = await db.query(sql6, [cluster_id]);

        if(data_employee_profile.length >= 1) {
            return res.status(400).json({ error: `Cannot be deleted ${data_employee_profile.length == 1 ? `${ data_employee_profile.length } row has` : `${ data_employee_profile.length } rows have` } been affected.` });
        }

        const insert_logs_admin_level = await Promise.all(
            data_admin_login.map(async (admin_login) => {
                await db.query(sql5, ['Cluster has been deleted: ' + data_cluster[0]['clusterName'] + ' - ' + data_site[0]['siteName'] + ' - ' + data_department[0]['departmentName'], storeCurrentDateTime(0, 'hours'), 1, admin_login.emp_ID, 0]);
                return admin_login.emp_ID;
            })
        );



        if(data_employee_profile.length == 0) {
            const [result] = await db.query(sql7, [cluster_id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Cluster not found.' });
            }

            return res.status(200).json({ success: 'Cluster successfully deleted.' });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete cluster.' });
    }
});