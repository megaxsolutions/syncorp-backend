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
    // return {0
    //     currentDateTime: formattedCurrentDateTime,
    //     expirationDateTime: formattedExpirationDateTime
    // };
}

export const create_account = asyncHandler(async (req, res) => {
    const { account_name, site_id } = req.body;

    try {
        const sql  = 'SELECT * FROM admin_login WHERE JSON_CONTAINS(user_level, ?)';
        const sql2 = 'SELECT * FROM sites WHERE id = ?';
        const sql3 = 'INSERT INTO accounts (accountName, siteID) VALUES (?, ?)';
        const sql4 = 'INSERT INTO logs (details, datetime, user_level, emp_ID, is_read) VALUES (?, ?, ?, ?, ?)';


        const [data_admin_login] = await db.query(sql, [JSON.stringify(1)]);
        const [data_site] = await db.query(sql2, [site_id]);


        if (data_site.length === 0) {
            return res.status(404).json({ error: 'Site not found.' });
        }

        const [insert_data_department] = await db.query(sql3, [account_name, site_id]);

        const insert_logs_admin_level = await Promise.all(
            data_admin_login.map(async (admin_login) => {
                await db.query(sql4, ['New account added: ' + account_name + ' - ' + data_site[0]['siteName'], storeCurrentDateTime(0, 'hours'), 1, admin_login.emp_ID, 0]);
                return admin_login.emp_ID;
            })
        );

      
        // Return the merged results in the response
        return res.status(200).json({ success: 'Account successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create account.' });
    }
});

export const update_account = asyncHandler(async (req, res) => {
    const { account_name, site_id } = req.body;
    const { account_id } = req.params; // Assuming department_id is passed as a URL parameter

    try {
        const sql  = 'SELECT * FROM accounts WHERE id = ?';
        const sql2 = 'SELECT * FROM admin_login WHERE JSON_CONTAINS(user_level, ?)';
        const sql3 = 'SELECT * FROM sites WHERE id = ?';
        const sql4 = 'SELECT * FROM sites WHERE id = ?';
        const sql5 = 'INSERT INTO logs (details, datetime, user_level, emp_ID, is_read) VALUES (?, ?, ?, ?, ?)';
        const sql6 = 'UPDATE accounts SET accountName = ?, siteID = ? WHERE id = ?';

        const [data_account] = await db.query(sql, [account_id]);
        const [data_admin_login] = await db.query(sql2, [JSON.stringify(1)]);

        if (data_account.length === 0) {
            return res.status(404).json({ error: 'Account not found.' });
        }

        const [data_site] = await db.query(sql3, [data_account[0]['siteID']]);
        const [data_site_2] = await db.query(sql4, [site_id]);

        if (data_site_2.length === 0) {
            return res.status(404).json({ error: 'Site not found.' });
        }

        const insert_logs_admin_level = await Promise.all(
            data_admin_login.map(async (admin_login) => {
                await db.query(sql5, ['Account updated from: ' + data_account[0]['accountName'] + ' - ' + data_site[0]['siteName'] + ' to: ' + account_name + ' - ' + data_site_2[0]['siteName'] , storeCurrentDateTime(0, 'hours'), 1, admin_login.emp_ID, 0]);
                return admin_login.emp_ID;
            })
        );


        const [result] = await db.query(sql6, [account_name, site_id, account_id]);

        return res.status(200).json({ success: 'Account successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update account.'  });
    }
});

export const delete_account = asyncHandler(async (req, res) => {
    const { account_id } = req.params; // Assuming department_id is passed as a URL parameter

    try {

        const sql  = 'SELECT * FROM accounts WHERE id = ?';
        const sql2 = 'SELECT * FROM admin_login WHERE JSON_CONTAINS(user_level, ?)';
        const sql3 = 'SELECT * FROM sites WHERE id = ?';
        const sql4 = 'INSERT INTO logs (details, datetime, user_level, emp_ID, is_read) VALUES (?, ?, ?, ?, ?)';
        const sql5 = 'SELECT * FROM employee_profile WHERE accountID = ?'; // Use a parameterized query
        const sql6 = 'DELETE FROM accounts WHERE id = ?';

        const [data_account] = await db.query(sql, [account_id]);
        const [data_admin_login] = await db.query(sql2, [JSON.stringify(1)]);
        const [data_site] = await db.query(sql3, [data_account[0]['siteID']]);


        if (data_account.length === 0) {
            return res.status(404).json({ error: 'Account not found.' });
        }

     
    

        const [data_employee_profile] = await db.query(sql5, [account_id]);

        // if(data_site.length >= 1) {
        //     return res.status(400).json({ error: `Cannot be deleted ${data_site.length == 1 ? `${ data_site.length } row has` : `${ data_site.length } rows have` } been affected.` });
        // }


        if(data_employee_profile.length >= 1) {
            return res.status(400).json({ error: `Cannot be deleted ${data_employee_profile.length == 1 ? `${ data_employee_profile.length } row has` : `${ data_employee_profile.length } rows have` } been affected.` });
        }

        const insert_logs_admin_level = await Promise.all(
            data_admin_login.map(async (admin_login) => {
                await db.query(sql4, ['Account has been deleted: ' + data_account[0]['accountName'] + ' - ' + data_site[0]['siteName'], storeCurrentDateTime(0, 'hours'), 1, admin_login.emp_ID, 0]);
                return admin_login.emp_ID;
            })
        );


        if(data_employee_profile.length == 0) {
            const [result] = await db.query(sql6, [account_id]);

            return res.status(200).json({ success: 'Account successfully deleted.' });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete account.' });
    }
});



export const get_all_account = asyncHandler(async (req, res) => {
    try {
        const sql  = 'SELECT * FROM accounts'; // Use a parameterized query

        const [account] = await db.query(sql);

        // Return the merged results in the response
        return res.status(200).json({ data: account });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});
  
  