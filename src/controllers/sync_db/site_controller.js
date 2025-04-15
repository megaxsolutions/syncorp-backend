import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import { db } from '../../config/config.js'; // Import the database connection
import moment from 'moment-timezone';


// Function to get the current date and time in Asia/Manila and store it in the database
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

export const create_site = asyncHandler(async (req, res) => {
    const { site_name } = req.body;

    try {
        const sql  = 'INSERT INTO sites (siteName, stamp) VALUES (?, ?)';
        const sql2 = 'SELECT * FROM admin_login WHERE JSON_CONTAINS(user_level, ?)';
        const sql3 = 'INSERT INTO logs (details, datetime, user_level, emp_ID, is_read) VALUES (?, ?, ?, ?, ?)';


        const [insert_data_site] = await db.query(sql, [site_name, storeCurrentDateTime(0, 'hours')]);
        const [data_admin_login] = await db.query(sql2, [JSON.stringify(1)]);

        const insert_logs_admin_level = await Promise.all(
            data_admin_login.map(async (admin_login) => {
                await db.query(sql3, ['New site added: ' + site_name, storeCurrentDateTime(0, 'hours'), 1, admin_login.emp_ID, 0]);
                return admin_login.emp_ID;
            })
        );
   
      
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
        const sql  = 'SELECT * FROM sites WHERE id = ?';
        const sql2 = 'SELECT * FROM admin_login WHERE JSON_CONTAINS(user_level, ?)';
        const sql3 = 'INSERT INTO logs (details, datetime, user_level, emp_ID, is_read) VALUES (?, ?, ?, ?, ?)';
        const sql4 = 'UPDATE sites SET siteName = ? WHERE id = ?';


        const [data_site] = await db.query(sql, [site_id]);
        const [data_admin_login] = await db.query(sql2, [JSON.stringify(1)]);

        if (data_site.length === 0) {
            return res.status(404).json({ error: 'Site not found.' });
        }

        const insert_logs_admin_level = await Promise.all(
            data_admin_login.map(async (admin_login) => {
                await db.query(sql3, ['Site updated from: ' + data_site[0]['siteName'] + ' to: ' + site_name, storeCurrentDateTime(0, 'hours'), 1, admin_login.emp_ID, 0]);
                return admin_login.emp_ID;
            })
        );


        const [result] = await db.query(sql4, [site_name, site_id]);

        return res.status(200).json({ success: 'Site successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update site.' });
    }
});

export const delete_site = asyncHandler(async (req, res) => {
    const { site_id } = req.params; // Assuming site_id is passed as a URL parameter

    try {

        const sql  = 'SELECT * FROM sites WHERE id = ?';
        const sql2 = 'SELECT * FROM admin_login WHERE JSON_CONTAINS(user_level, ?)';
        const sql3 = 'INSERT INTO logs (details, datetime, user_level, emp_ID, is_read) VALUES (?, ?, ?, ?, ?)';
        const sql4 = 'SELECT * FROM employee_profile WHERE siteID = ?'; // Use a parameterized query
        const sql5 = 'SELECT * FROM departments WHERE siteID = ?'; // Use a parameterized query
        const sql6 = 'SELECT * FROM accounts WHERE siteID = ?'; // Use a parameterized query
        const sql7 = 'DELETE FROM sites WHERE id = ?';

        
        const [data_site] = await db.query(sql, [site_id]);
        const [data_admin_login] = await db.query(sql2, [JSON.stringify(1)]);

        if (data_site.length === 0) {
            return res.status(404).json({ error: 'Site not found.' });
        }

    



        const [data_employee_profile] = await db.query(sql4, [site_id]);
        const [data_departments] = await db.query(sql5, [site_id]);
        const [data_accounts] = await db.query(sql6, [site_id]);



        if(data_employee_profile.length >= 1) {
            return res.status(400).json({ error: `Cannot be deleted ${data_employee_profile.length == 1 ? `${ data_employee_profile.length } row has` : `${ data_employee_profile.length } rows have` } been affected.` });
        }

        if(data_departments.length >= 1) {
            return res.status(400).json({ error: `Cannot be deleted ${data_departments.length == 1 ? `${ data_departments.length } row has` : `${ data_departments.length } rows have` } been affected.` });
        }

        if(data_accounts.length >= 1) {
            return res.status(400).json({ error: `Cannot be deleted ${data_accounts.length == 1 ? `${ data_accounts.length } row has` : `${ data_accounts.length } rows have` } been affected.` });
        }

        const insert_logs_admin_level = await Promise.all(
            data_admin_login.map(async (admin_login) => {
                await db.query(sql3, ['Site has been deleted: ' + data_site[0]['siteName'], storeCurrentDateTime(0, 'hours'), 1, admin_login.emp_ID, 0]);
                return admin_login.emp_ID;
            })
        );

        if(data_employee_profile.length == 0) {
            const [result] = await db.query(sql7, [site_id]);

            return res.status(200).json({ success: 'Site successfully deleted.' });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete site.' });
    }
});