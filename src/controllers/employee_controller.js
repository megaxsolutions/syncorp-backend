import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import { db } from '../config/config.js'; // Import the database connection

import moment from 'moment-timezone';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import welcome_mailer from "../utils/welcome_mailer.js";


import path from 'path'; // Import the path module
import fs from 'fs'; // Import fs to check if the directory exists
import { fileURLToPath } from 'url'; // Import fileURLToPath
import { dirname, join } from 'path'; // Import dirname


dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET; // Replace with your own secret key

const __dirname = dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '../../uploads/');




function dateConverter(date) {
    const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (!dateFormatRegex.test(date)) {
        throw new Error('Invalid date format. Please use "YYYY-MM-DD".');
    }

    const [year, month, day] = date.split('-');
    return `${month}${day}${year}`;
}

function hashConverterBCRYPT(password) {
    return bcrypt.hash(String(password));
}

function verifyPasswordBCRYPT(inputPassword, storedHash) {
    return bcrypt.compare(inputPassword, storedHash);
}


function hashConverterMD5(password) {
    return crypto.createHash('md5').update(String(password)).digest('hex');
}


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

function storeCurrentDate(expirationAmount, expirationUnit) {
    // Get the current date and time in Asia/Manila timezone
    const currentDateTime = moment.tz("Asia/Manila");

    // Calculate the expiration date and time
    const expirationDateTime = currentDateTime.clone().add(expirationAmount, expirationUnit);

    // Format the current date and expiration date
    const formattedCurrentDateTime = currentDateTime.format('YYYY-MM-DD');
    const formattedExpirationDateTime = expirationDateTime.format('YYYY-MM-DD');

    // Return both current and expiration date-time
    return formattedExpirationDateTime;
    // return {
    //     currentDateTime: formattedCurrentDateTime,
    //     expirationDateTime: formattedExpirationDateTime
    // };
}


export const create_employee = asyncHandler(async (req, res) => {
    const { birthdate, fname, mname, lname, date_hired, department_id, 
         cluster_id, site_id, email, phone, address, 
         emergency_contact_person, emergency_contact_number, sss, 
         pagibig, philhealth, tin, basic_pay, employee_status, 
         positionID, employee_level, healthcare, tranpo_allowance, food_allowance, 
         account_id, drug_test, xray, med_cert, nbi_clearance, employment_status } = req.body;

         const filename = req.file ? req.file.filename : null; // Get the filename from the uploaded file
         const filename_insert = `users/${filename}`; 

    try {
        const birthdateRegex = /^\d{4}-\d{2}-\d{2}$/;

        // Check if birthdate matches the regex
        if (!birthdateRegex.test(birthdate)) {
            return res.status(400).json({ message: 'Invalid birthdate format. Please use YYYY-MM-DD.' });
        } 

        if (!birthdateRegex.test(date_hired)) {
            return res.status(400).json({ message: 'Invalid date hired format. Please use YYYY-MM-DD.' });
        }
            const hash = hashConverterMD5(dateConverter(birthdate));
        
            const sql  = 'INSERT INTO id_generator (datetime_created) VALUES (?)';
            const sql2 = 'INSERT INTO login (emp_ID, password, expiry_date) VALUES (?, ?, ?)';
            const sql3 = 'INSERT INTO employee_profile (emp_ID, fName, mName, lName, bDate, date_hired, departmentID, clusterID, siteID, email, phone, address, emergency_contact_person, emergency_contact_number, employee_level, photo, accountID, drug_test, xray, med_cert, nbi_clearance, employment_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
            const sql4 = 'INSERT INTO employee_profile_benefits (emp_ID, sss, pagibig, philhealth, tin, basic_pay, healthcare, tranpo_allowance, food_allowance) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
            const sql5 = 'INSERT INTO employee_profile_standing (emp_ID, employee_status, positionID, date_added, datetime_updated) VALUES (?, ?, ?, ?, ?)';
            const sql6 = 'INSERT INTO clock_state (emp_ID, state, break_state) VALUES (?, ?, ?)';
            const sql7 = 'SELECT * FROM employee_profile WHERE emp_ID = ?'; // Use a parameterized query


            const [insert_data_id_generator] = await db.query(sql, [storeCurrentDateTime(0, 'hours')]);
            const [insert_data_login] = await db.query(sql2, [insert_data_id_generator['insertId'], hash, storeCurrentDate(3, 'months')]);
            const [insert_data_employee_profile] = await db.query(sql3, [insert_data_id_generator['insertId'], fname, mname, lname, birthdate, date_hired, department_id, cluster_id, site_id, email, phone, address, emergency_contact_person, emergency_contact_number, employee_level, req.file ? filename_insert : null, account_id, drug_test, xray, med_cert, nbi_clearance, employment_status]);
            const [insert_data_employee_profile_benefits] = await db.query(sql4, [insert_data_id_generator['insertId'], sss, pagibig, philhealth, tin, basic_pay, healthcare, tranpo_allowance, food_allowance]);
            const [insert_data_employee_profile_standing] = await db.query(sql5, [insert_data_id_generator['insertId'], employee_status, positionID, storeCurrentDateTime(0, 'months'), storeCurrentDateTime(0, 'months')]);
            const [insert_data_clock_state] = await db.query(sql6, [insert_data_id_generator['insertId'], 0, 0]);
            const [employee_profile] = await db.query(sql7, [insert_data_id_generator['insertId']]);

            welcome_mailer(`${employee_profile[0]['fName']} ${employee_profile[0]['lName']}`, employee_profile[0]['email'], 'Welcome to syncorp – Your Login Credentials', insert_data_id_generator['insertId'], dateConverter(birthdate));


        return res.status(200).json({ success: 'Account successfully created.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create user entry' });
    }
});



export const login_employee = asyncHandler(async (req, res) => {
    const { emp_ID, password } = req.body;

    try {
        const hash = hashConverterMD5(password);

        const sql = `SELECT login.emp_ID, login.password, login.login_attempts, 
        DATE_FORMAT(login.expiry_date, '%Y-%m-%d') AS expiry_date,
        employee_profile.fName, employee_profile.mName, employee_profile.lName, 
        DATE_FORMAT(employee_profile.bDate, '%Y-%m-%d') AS bDate,
        DATE_FORMAT(employee_profile.date_hired, '%Y-%m-%d') AS date_hired,
        employee_profile.departmentID, employee_profile.clusterID,
        employee_profile.siteID, employee_profile.email, employee_profile.phone, employee_profile.address,
        employee_profile.emergency_contact_person, employee_profile.emergency_contact_number,
        employee_profile.employee_level, employee_profile.photo,
        employee_profile_benefits.sss, employee_profile_benefits.pagibig,
        employee_profile_benefits.philhealth, employee_profile_benefits.tin, employee_profile_benefits.basic_pay,
        employee_profile_benefits.healthcare, employee_profile_standing.employee_status, employee_profile_standing.date_added,
        employee_profile_standing.datetime_updated, employee_profile_standing.positionID,
        admin_login.user_level, admin_login.bucket
        FROM login  
        LEFT JOIN employee_profile ON login.emp_ID = employee_profile.emp_ID 
        LEFT JOIN employee_profile_benefits ON employee_profile.emp_ID = employee_profile_benefits.emp_ID 
        LEFT JOIN employee_profile_standing ON employee_profile.emp_ID = employee_profile_standing.emp_ID 
        LEFT JOIN admin_login ON employee_profile.emp_ID = admin_login.emp_ID 
        WHERE login.emp_ID = ?`;

        const sql2 = 'INSERT INTO tokens (emp_ID, token, expiry_datetime) VALUES (?, ?, ?)';
        const sql3 = 'UPDATE login SET login_attempts = ? WHERE emp_ID = ?';

        const [login] = await db.query(sql, [emp_ID]);

        if(storeCurrentDate(0, 'months') > login[0]['expiry_date']) {
            return res.status(400).json({ error: 'Your account has expired. Please contact the administrator for assistance.' });        
        }

        if(login[0]['login_attempts'] == 5) {
            return res.status(400).json({ error: 'Please contact the admin.' });
        }

        if(login[0]['password'] == hash) {
            // Generate a JWT token
            const token = jwt.sign({ login }, JWT_SECRET, {
                expiresIn: '7d' // Token expiration time
            });

            //const hashTokenBCRYPT = hashConverterBCRYPT(token);
            const [data_token] = await db.query(sql2, [emp_ID, token, storeCurrentDateTime(1, 'hours')]);
            const [data_admin_login] = await db.query(sql3, [0, emp_ID]);



            return res.status(200).json({ data: token, emp_id: login[0]['emp_ID'] });
        }

        const [update_admin_login] = await db.query(sql3, [login[0]['login_attempts'] + 1, emp_ID]);

        return res.status(400).json({ error: 'Failed to login wrong password.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to login ' });
    }
});


export const update_employee_expiration = asyncHandler(async (req, res) => {
    const { expiry_date } = req.body;
    const { emp_id } = req.params; // Assuming department_id is passed as a URL parameter

    try {
        const sql  = 'UPDATE login SET expiry_date = ? WHERE emp_ID = ?';

        const expirydateRegex = /^\d+\s+(hours|months|years)$/; // For "1 hours", "1 months", or "1 years"
        const match = expiry_date.match(expirydateRegex);

        // Check if birthdate matches the regex
        if (!expirydateRegex.test(expiry_date)) {
            return res.status(400).json({ message: 'Invalid expiry date format. Please use "<number> hours", "<number> months", or "<number> years".' });
        }

        const [update_admin_expiration ] = await db.query(sql, [storeCurrentDate(match[1], match[2]), emp_id]);
            
        if (update_admin_expiration.affectedRows === 0) {
            return res.status(404).json({ error: 'Employee not found.' });
        }
        

        return res.status(200).json({ success: 'Employee successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update employee.' });
    }
});

export const update_employee_login = asyncHandler(async (req, res) => {
    const { password } = req.body;
    const { emp_id } = req.params; // Assuming department_id is passed as a URL parameter

    try {
        const hash_password = hashConverterMD5(password);
        const sql2 = 'UPDATE login SET password = ? WHERE emp_ID = ?';

        const [update_login_password] = await db.query(sql2, [hash_password, emp_id]);
            
        if (update_login_password.affectedRows === 0) {
            return res.status(404).json({ error: 'Employee not found.' });
        }
    

        return res.status(200).json({ success: 'Employee successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update employee.' });
    }
});


export const update_employee_login_attempts = asyncHandler(async (req, res) => {
    const { login_attempts } = req.body;
    const { emp_id } = req.params; // Assuming department_id is passed as a URL parameter

    try {
        const sql  = 'UPDATE login SET login_attempts = ? WHERE emp_ID = ?';

        const [update_login_no_password] = await db.query(sql, [login_attempts, emp_id]);
        if (update_login_no_password.affectedRows === 0) {
                return res.status(404).json({ error: 'Employee not found.' });
        }
   
        return res.status(200).json({ success: 'Employee successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update employee.' });
    }
});




export const update_employee = asyncHandler(async (req, res) => {
         const { birthdate, fname, mname, lname, date_hired, department_id, 
            cluster_id, site_id, email, phone, address, 
            emergency_contact_person, emergency_contact_number, sss, 
            pagibig, philhealth, tin, basic_pay, employee_status, 
            positionID, employee_level, healthcare, tranpo_allowance, food_allowance, 
            account_id, drug_test, xray, med_cert, nbi_clearance, employment_status  } = req.body;


    const filename = req.file ? req.file.filename : null; // Get the filename from the uploaded file
    const filename_insert = `users/${filename}`; 

    const { emp_id } = req.params; // Assuming department_id is passed as a URL parameter
    
    const birthdateRegex = /^\d{4}-\d{2}-\d{2}$/;

    // Check if birthdate matches the regex
    if (!birthdateRegex.test(birthdate)) {
        return res.status(400).json({ message: 'Invalid birthdate format. Please use YYYY-MM-DD.' });
    }

    if (!birthdateRegex.test(date_hired)) {
        return res.status(400).json({ message: 'Invalid date hired format. Please use YYYY-MM-DD.' });
    }
    try {
        const sql0 = 'SELECT * FROM employee_profile WHERE emp_ID = ?'; // Use a parameterized query
        
        const sql  = `UPDATE employee_profile SET fName = ?, mName = ?, lName = ?,
         bDate = ?, date_hired = ?, departmentID = ?, clusterID = ?, siteID = ?, 
         email = ?, phone = ?, address = ?, emergency_contact_person = ?, 
         emergency_contact_number = ?, employee_level = ?, photo = ?,
         accountID = ?, drug_test = ?, xray = ?, med_cert = ?, nbi_clearance = ?,
         employment_status = ?
         WHERE emp_ID = ?`;
       
        const sql2 = 'UPDATE employee_profile_benefits SET sss = ?, pagibig = ?, philhealth = ?, tin = ?, basic_pay = ?, healthcare = ?, tranpo_allowance = ?, food_allowance = ? WHERE emp_ID = ?';
        const sql3 = 'UPDATE employee_profile_standing SET employee_status = ?, positionID = ?, datetime_updated = ? WHERE emp_ID = ?';

        const [employee_profile] = await db.query(sql0, [emp_id]);
        const [insert_data_employee_profile] = await db.query(sql, [fname, mname, lname, birthdate, date_hired, department_id, 
            cluster_id, site_id, email, phone, address, emergency_contact_person, emergency_contact_number, 
            employee_level, req.file ? filename_insert : employee_profile[0]['photo'], 
            account_id, drug_test, xray, med_cert, nbi_clearance, employment_status, emp_id]);
        const [insert_data_employee_profile_benefits] = await db.query(sql2, [sss, pagibig, philhealth, tin, basic_pay, healthcare, tranpo_allowance, food_allowance, emp_id]);
        const [insert_data_employee_profile_standing] = await db.query(sql3, [employee_status, positionID, storeCurrentDateTime(0, 'months'), emp_id]);


         if(req.file) {
            const filePath = path.join(uploadsDir, employee_profile[0]['photo']);
        
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error('Error deleting file:', err);
                }
            });
        }

        return res.status(200).json({ success: 'Employee successfully updated.' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update employee entry' });
    }
});


export const get_all_employee_supervisor = asyncHandler(async (req, res) => {
    const { supervisor_emp_id } = req.params; // Assuming cluster_id is passed as a URL parameter

    try {
        const sql = 'SELECT * FROM admin_login WHERE emp_ID = ?'; // Use a parameterized query

        const [data_admin_login] = await db.query(sql, [supervisor_emp_id]);

        if (data_admin_login.length === 0) {
            return res.status(404).json({ error: 'Supervisor not found.' });
        }


        const bucketArray = JSON.parse(data_admin_login[0]['bucket'] == null || data_admin_login[0]['bucket'] == "" || JSON.parse(data_admin_login[0]['bucket']).length == 0 ? "[0]" : data_admin_login[0]['bucket'] );
        const placeholders = bucketArray.map(() => '?').join(', ');



        const sql2 = `SELECT login.emp_ID, login.password, login.login_attempts, 
        DATE_FORMAT(login.expiry_date, '%Y-%m-%d') AS expiry_date,
        employee_profile.fName, employee_profile.mName, employee_profile.lName, 
        DATE_FORMAT(employee_profile.bDate, '%Y-%m-%d') AS bDate,
        DATE_FORMAT(employee_profile.date_hired, '%Y-%m-%d') AS date_hired,
        employee_profile.departmentID, employee_profile.clusterID,
        employee_profile.siteID, employee_profile.email, employee_profile.phone, employee_profile.address,
        employee_profile.emergency_contact_person, employee_profile.emergency_contact_number,
        employee_profile.employee_level, employee_profile.photo,
        employee_profile.accountID, employee_profile.drug_test, employee_profile.xray,
        employee_profile.med_cert, employee_profile.nbi_clearance,
        employee_profile_benefits.sss, employee_profile_benefits.pagibig,
        employee_profile_benefits.philhealth, employee_profile_benefits.tin, employee_profile_benefits.basic_pay,
        employee_profile_benefits.healthcare, employee_profile_benefits.tranpo_allowance, 
        employee_profile_benefits.food_allowance, 
        employee_profile_standing.employee_status, employee_profile_standing.date_added,
        employee_profile_standing.datetime_updated, employee_profile_standing.positionID,
        accounts.accountName
        FROM login 
        LEFT JOIN employee_profile ON login.emp_ID = employee_profile.emp_ID 
        LEFT JOIN employee_profile_benefits ON login.emp_ID = employee_profile_benefits.emp_ID 
        LEFT JOIN employee_profile_standing ON login.emp_ID = employee_profile_standing.emp_ID
        LEFT JOIN accounts ON employee_profile.accountID = accounts.id
        WHERE employee_profile.clusterID IN (${placeholders})
        `;

        const [users] = await db.query(sql2, bucketArray);

        return res.status(200).json({ data: users });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all user.' });
    }
});



export const get_employee = asyncHandler(async (req, res) => {
    const { emp_id } = req.params; // Assuming cluster_id is passed as a URL parameter


    try {
        const sql = `SELECT login.emp_ID, login.password, login.login_attempts, 
        DATE_FORMAT(login.expiry_date, '%Y-%m-%d') AS expiry_date,
        employee_profile.fName, employee_profile.mName, employee_profile.lName, 
        DATE_FORMAT(employee_profile.bDate, '%Y-%m-%d') AS bDate,
        DATE_FORMAT(employee_profile.date_hired, '%Y-%m-%d') AS date_hired,
        employee_profile.departmentID, employee_profile.clusterID,
        employee_profile.siteID, employee_profile.email, employee_profile.phone, employee_profile.address,
        employee_profile.emergency_contact_person, employee_profile.emergency_contact_number,
        employee_profile.employee_level, employee_profile.photo,
        employee_profile.accountID, employee_profile.drug_test, employee_profile.xray,
        employee_profile.med_cert, employee_profile.nbi_clearance,
        employee_profile_benefits.sss, employee_profile_benefits.pagibig,
        employee_profile_benefits.philhealth, employee_profile_benefits.tin, employee_profile_benefits.basic_pay,
        employee_profile_benefits.healthcare, employee_profile_benefits.tranpo_allowance, 
        employee_profile_benefits.food_allowance, 
        employee_profile_standing.employee_status, employee_profile_standing.date_added,
        employee_profile_standing.datetime_updated, employee_profile_standing.positionID,
        accounts.accountName
        FROM login 
        LEFT JOIN employee_profile ON login.emp_ID = employee_profile.emp_ID 
        LEFT JOIN employee_profile_benefits ON login.emp_ID = employee_profile_benefits.emp_ID 
        LEFT JOIN employee_profile_standing ON login.emp_ID = employee_profile_standing.emp_ID
        LEFT JOIN accounts ON employee_profile.accountID = accounts.id
        WHERE employee_profile.emp_ID = ?
        `;

       
        const [users] = await db.query(sql, [emp_id]);

        return res.status(200).json({ data: users });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all user.' });
    }
});

export const get_all_employee = asyncHandler(async (req, res) => {
    try {
        const sql = `SELECT login.emp_ID, login.password, login.login_attempts, 
        DATE_FORMAT(login.expiry_date, '%Y-%m-%d') AS expiry_date,
        employee_profile.fName, employee_profile.mName, employee_profile.lName, 
        DATE_FORMAT(employee_profile.bDate, '%Y-%m-%d') AS bDate,
        DATE_FORMAT(employee_profile.date_hired, '%Y-%m-%d') AS date_hired,
        employee_profile.departmentID, employee_profile.clusterID,
        employee_profile.siteID, employee_profile.email, employee_profile.phone, employee_profile.address,
        employee_profile.emergency_contact_person, employee_profile.emergency_contact_number,
        employee_profile.employee_level, employee_profile.photo,
        employee_profile.accountID, employee_profile.drug_test, employee_profile.xray,
        employee_profile.med_cert, employee_profile.nbi_clearance,
        employee_profile_benefits.sss, employee_profile_benefits.pagibig,
        employee_profile_benefits.philhealth, employee_profile_benefits.tin, employee_profile_benefits.basic_pay,
        employee_profile_benefits.healthcare, employee_profile_benefits.tranpo_allowance, 
        employee_profile_benefits.food_allowance, 
        employee_profile_standing.employee_status, employee_profile_standing.date_added,
        employee_profile_standing.datetime_updated, employee_profile_standing.positionID,
        accounts.accountName
        FROM login 
        LEFT JOIN employee_profile ON login.emp_ID = employee_profile.emp_ID 
        LEFT JOIN employee_profile_benefits ON login.emp_ID = employee_profile_benefits.emp_ID 
        LEFT JOIN employee_profile_standing ON login.emp_ID = employee_profile_standing.emp_ID
        LEFT JOIN accounts ON employee_profile.accountID = accounts.id
        `;

       
        const [users] = await db.query(sql);

        return res.status(200).json({ data: users });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all user.' });
    }
});
  
  