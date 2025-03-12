import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import { db } from '../config/config.js'; // Import the database connection

import moment from 'moment-timezone';


// Function to get the current date and time in Asia/Manila and store it in the database
function storeCurrentDateTime(expirationAmount, expirationUnit) {
    // Get the current date and time in Asia/Manila timezone
    const currentDateTime = moment.tz("Asia/Manila");

    // Calculate the expiration date and time
    const expirationDateTime = currentDateTime.clone().add(expirationAmount, expirationUnit);

    // Format the current date and expiration date
    const formattedCurrentDateTime = currentDateTime.format('YYYY-MM-DD HH:mm:ss');
    const formattedExpirationDateTime = expirationDateTime.format('YYYY-MM-DD HH:mm:ss');

    // Return both current and expiration date-time
    return formattedExpirationDateTime;
    // return {
    //     currentDateTime: formattedCurrentDateTime,
    //     expirationDateTime: formattedExpirationDateTime
    // };
}

export const create_department = asyncHandler(async (req, res) => {
    const { department_name, site_id } = req.body;

    try {
        const sql  = 'SELECT * FROM admin_login WHERE JSON_CONTAINS(user_level, ?)';
        const sql2 = 'SELECT * FROM sites WHERE id = ?';
        const sql3 = 'INSERT INTO departments (departmentName, siteID) VALUES (?, ?)';
        const sql4 = 'INSERT INTO logs (details, datetime, user_level, emp_ID, is_read) VALUES (?, ?, ?, ?, ?)';


        const [data_admin_login] = await db.query(sql, [JSON.stringify(1)]);
        const [data_site] = await db.query(sql2, [site_id]);


        if (data_site.length === 0) {
            return res.status(404).json({ error: 'Site not found.' });
        }

        const [insert_data_department] = await db.query(sql3, [department_name, site_id]);

        const insert_logs_admin_level = await Promise.all(
            data_admin_login.map(async (admin_login) => {
                await db.query(sql4, ['New department added: ' + department_name + ' - ' + data_site[0]['siteName'], storeCurrentDateTime(0, 'hours'), 1, admin_login.emp_ID, 0]);
                return admin_login.emp_ID;
            })
        );

      
        // Return the merged results in the response
        return res.status(200).json({ success: 'Department successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create department.', data: error });
    }
});

export const update_department = asyncHandler(async (req, res) => {
    const { department_name, site_id } = req.body;
    const { department_id } = req.params; // Assuming department_id is passed as a URL parameter

    try {
        const sql  = 'SELECT * FROM departments WHERE id = ?';
        const sql2 = 'SELECT * FROM admin_login WHERE JSON_CONTAINS(user_level, ?)';
        const sql3 = 'SELECT * FROM sites WHERE id = ?';
        const sql4 = 'SELECT * FROM sites WHERE id = ?';
        const sql5 = 'INSERT INTO logs (details, datetime, user_level, emp_ID, is_read) VALUES (?, ?, ?, ?, ?)';
        const sql6 = 'UPDATE departments SET departmentName = ?, siteID = ? WHERE id = ?';

        const [data_department] = await db.query(sql, [department_id]);
        const [data_admin_login] = await db.query(sql2, [JSON.stringify(1)]);

        if (data_department.length === 0) {
            return res.status(404).json({ error: 'Department not found.' });
        }

        const [data_site] = await db.query(sql3, [data_department[0]['siteID']]);
        const [data_site_2] = await db.query(sql4, [site_id]);

        if (data_site_2.length === 0) {
            return res.status(404).json({ error: 'Site not found.' });
        }

        const insert_logs_admin_level = await Promise.all(
            data_admin_login.map(async (admin_login) => {
                await db.query(sql5, ['Department updated from: ' + data_department[0]['departmentName'] + ' - ' + data_site[0]['siteName'] + ' to: ' + department_name + ' - ' + data_site_2[0]['siteName'] , storeCurrentDateTime(0, 'hours'), 1, admin_login.emp_ID, 0]);
                return admin_login.emp_ID;
            })
        );


        const [result] = await db.query(sql6, [department_name, site_id, department_id]);

        return res.status(200).json({ success: 'Department successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update department.', data: error  });
    }
});

export const delete_department = asyncHandler(async (req, res) => {
    const { department_id } = req.params; // Assuming department_id is passed as a URL parameter

    try {

        const sql  = 'SELECT * FROM departments WHERE id = ?';
        const sql2 = 'SELECT * FROM admin_login WHERE JSON_CONTAINS(user_level, ?)';
        const sql3 = 'SELECT * FROM sites WHERE id = ?';
        const sql4 = 'INSERT INTO logs (details, datetime, user_level, emp_ID, is_read) VALUES (?, ?, ?, ?, ?)';
        const sql5 = 'SELECT * FROM employee_profile WHERE departmentID = ?'; // Use a parameterized query
        const sql6 = 'DELETE FROM departments WHERE id = ?';

        const [data_department] = await db.query(sql, [department_id]);
        const [data_admin_login] = await db.query(sql2, [JSON.stringify(1)]);
        const [data_site] = await db.query(sql3, [data_department[0]['siteID']]);


        if (data_department.length === 0) {
            return res.status(404).json({ error: 'Department not found.' });
        }

     

        const [data_employee_profile] = await db.query(sql5, [department_id]);


        if(data_employee_profile.length >= 1) {
            return res.status(400).json({ error: `Cannot be deleted ${data_employee_profile.length == 1 ? `${ data_employee_profile.length } row has` : `${ data_employee_profile.length } rows have` } been affected.` });
        }

        const insert_logs_admin_level = await Promise.all(
            data_admin_login.map(async (admin_login) => {
                await db.query(sql4, ['Department has been deleted: ' + data_department[0]['departmentName'] + ' - ' + data_site[0]['siteName'], storeCurrentDateTime(0, 'hours'), 1, admin_login.emp_ID, 0]);
                return admin_login.emp_ID;
            })
        );


        if(data_employee_profile.length == 0) {
            const [result] = await db.query(sql6, [department_id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Department not found.' });
            }

            return res.status(200).json({ success: 'Department successfully deleted.' });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete department.' });
    }
});