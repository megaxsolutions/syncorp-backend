import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import { db } from '../config/config.js'; // Import the database connection

import moment from 'moment-timezone';
import { Worker } from 'worker_threads';

function extendDateByOneDay(dateString) {
    // Create a Date object from the input string
    const date = new Date(dateString);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
        throw new Error('Invalid date format. Please use YYYY-MM-DD.');
    }

    // Extend the date by one day
    date.setDate(date.getDate() + 1);

    // Get the new date in the desired format (YYYY-MM-DD)
    return date.toISOString().split('T')[0];
}


function check_shift_type(shiftIn, shiftOut) {
    const timeZone = 'Asia/Manila';

    // Get the current date
    const currentDate = moment.tz(timeZone).startOf('day');

    // Create moment objects for shiftIn and shiftOut in the specified timezone
    const shiftInTime = moment.tz(`${currentDate.format('YYYY-MM-DD')} ${shiftIn}`, timeZone);
    const shiftOutTime = moment.tz(`${currentDate.format('YYYY-MM-DD')} ${shiftOut}`, timeZone);

    // If shiftOut is less than or equal to shiftIn, it means it goes to the next day
    if (shiftOutTime.isSameOrBefore(shiftInTime)) {
        return false; // Invalid shift, as it overlaps within the same day
    }
    return true; // Valid shift
}


function storeCurrentDate(expirationAmount, expirationUnit) {
    const currentDateTime = moment.tz("Asia/Manila");
    const expirationDateTime = currentDateTime.clone().add(expirationAmount, expirationUnit);
    return expirationDateTime.format('YYYY-MM-DD');
}

function getCurrentWeekdays() {
    const weekdays = [];
    const today = moment.tz('Asia/Manila'); // Get current date in Asia/Manila timezone

    // Declare startOfWeek variable
    let startOfWeek;

    // Check if today is Saturday (6) or Sunday (0)
    if (today.day() === 6 || today.day() === 0) {
        // If today is Saturday or Sunday, start from next Monday
        startOfWeek = today.clone().add(1, 'weeks').startOf('isoWeek'); // Move to next week's Monday
    } else {
        // If today is a weekday, start from the current week's Monday
        startOfWeek = today.clone().startOf('isoWeek');
    }

    // Loop through the week (Monday to Friday)
    for (let i = 0; i < 5; i++) {
        const weekday = startOfWeek.clone().add(i, 'days');
        // Format the date as "YYYY-MM-DD"
        weekdays.push(weekday.format('YYYY-MM-DD')); // You can append time if needed
    }

    return weekdays;
}


function getCurrentWeekdays1() {
    const weekdays = [];
    const today = moment.tz('Asia/Manila'); // Get current date in Asia/Manila timezone

    // Get the start of the week (Monday)
    const startOfWeek = today.clone().startOf('isoWeek');

    // Loop through the week (Monday to Friday)
    for (let i = 0; i < 5; i++) {
        const weekday = startOfWeek.clone().add(i, 'days');
        // Format the date as "YYYY-MM-DD HH:mm:ss"
        weekdays.push(weekday.format('YYYY-MM-DD')); // Assuming you want a fixed time of 17:00:00
    }

    return weekdays;
}



// Function to get weekdays of the current month
function getCurrentMonthWeekdays() {
    const weekdays = [];
    const today = moment.tz('Asia/Manila'); // Get current date in Asia/Manila timezone

    // Get the start and end of the current month
    const startOfMonth = today.clone().startOf('month');
    const endOfMonth = today.clone().endOf('month');

    // Loop through each day of the month
    for (let day = startOfMonth.clone(); day.isBefore(endOfMonth.clone().add(1, 'days')); day.add(1, 'days')) {
        // Check if the day is a weekday (Monday to Friday)
        if (day.day() !== 0 && day.day() !== 6) { // 0 = Sunday, 6 = Saturday
            weekdays.push(day.format('YYYY-MM-DD')); // Store in the desired format
        }
    }

    return weekdays;
}




async function break_shift_store(array_employee_emp_id, admin_emp_id, shift_in, shift_out, array_selected_days, schedule_type_id) {
    const sql  = 'SELECT * FROM login'; // Use a parameterized query

    const sqlInsert = 'INSERT INTO break_schedule (emp_ID, shift_in, shift_out, day, plotted_by, schedule_type) VALUES ?';

    // Fix for the SQL query with the IN clause:
    const sqlSelect = `SELECT emp_ID, 
    DATE_FORMAT(day, '%Y-%m-%d') AS day
    FROM break_schedule 
    WHERE emp_ID = ? 
    AND day IN (?) 
    AND schedule_type = ? 
    AND DATE_FORMAT(shift_in, '%H:%i') = ? 
    AND DATE_FORMAT(shift_out, '%H:%i') = ?;`;

    // Fetch all the existing shift schedules for the current employees and weekdays in one go
   // const selected_days = [storeCurrentDate(0, 'hours')];
    const selected_days = array_selected_days;

    // Prepare data for batch insertion
    const insertValues = [];
    let employees_affected = 0;

    // Create a Map to store existing schedules
    const existingSchedulesMap = new Map();

    // Get all the schedules at once
    const emp_ids = array_employee_emp_id;
    const days = selected_days;

    // Execute a single query to get all the existing schedules for the employees and days
    // We need to check for each emp_id and day
    const shift_schedules = await Promise.all(
        emp_ids.map(async (emp_id) => {
            const [result] = await db.query(sqlSelect, [emp_id, days, schedule_type_id, shift_in, shift_out]);
            return result;
        })
    );

    // Populate the map with the shift schedule data
    shift_schedules.flat().forEach(schedule => {
        const key = `${schedule.emp_ID}-${check_shift_type (shift_in, shift_out) === true ? schedule.day : extendDateByOneDay(schedule.day)}`;
        existingSchedulesMap.set(key, true);
    });

    // Loop through each employee and day to prepare the insertion data
    for (const emp_id of emp_ids) {
        let count_employees = 0;

        for (const day of selected_days) {
            const key = `${emp_id}-${check_shift_type (shift_in, shift_out) === true ? day : extendDateByOneDay(day)}`;
            // Check if the (emp_id, day) combination is already in the map (i.e., the shift exists)
            if (!existingSchedulesMap.has(key)) {
                // If the schedule doesn't exist, prepare for insertion
                insertValues.push([emp_id, `${day} ${shift_in}`, `${check_shift_type (shift_in, shift_out) === true ? day : extendDateByOneDay(day)} ${shift_out}`, day, admin_emp_id, schedule_type_id]);
                count_employees++;
            }
        }

        // If at least one schedule was added for this employee, increment the affected count
        if (count_employees > 0) {
            employees_affected++;
        }
    }

    // If there are any values to insert, perform a batch insert
    if (insertValues.length > 0) {
        await db.query(sqlInsert, [insertValues]);
    }

    // Check the length of users
    const [users] = await db.query(sql);

    if (users.length === array_employee_emp_id.length) {
        //return res.status(200).json({ success: 'Break shift schedule for all employees has been updated.' });
    }

    //return res.status(200).json({ success: `Break shift schedule for ${employees_affected} employees has been updated.` });
}

export const create_break_shift_schedule_multiple_day = asyncHandler(async (req, res) => {
    const { array_employee_emp_id, admin_emp_id, array_break, array_selected_days } = req.body;

    try {
        const break_shift_schedules = await Promise.all(
            array_break.map(async (breakItem) => {
                await break_shift_store(array_employee_emp_id, admin_emp_id, breakItem.shift_in, breakItem.shift_out, array_selected_days, breakItem.schedule_type);
                return breakItem.name; // Return the name to collect in the array
            })
        );

        return res.status(200).json({ success: `Break shift schedule for employees has been updated.` });
    } catch (error) {
        console.error(error); // Log the error for debugging
        return res.status(500).json({ error: 'Failed to update  break shift schedule.' });
    }
});




export const delete_break_shift_schedule_multiple_day = asyncHandler(async (req, res) => {
    const { array_employee_emp_id, array_selected_days } = req.body;
    const { schedule_type_id } = req.params; // Assuming emp_id is passed as a URL parameter

    try {
        const sql  = 'SELECT * FROM login'; // Use a parameterized query

        const sqlDelete = `DELETE FROM shift_schedule WHERE emp_ID = ? AND DATE_FORMAT(day, '%Y-%m-%d') IN (?) AND schedule_type = ? AND is_overtime = ? AND is_break = ?`;

        const selected_days = array_selected_days;


        const insertValues = [];
        let employees_affected = 0;


        // Get all the schedules at once
        const emp_ids = array_employee_emp_id;
        const days = selected_days;


        const delete_shift_schedules = await Promise.all(
            emp_ids.map(async (emp_id) => {
                const [result] = await db.query(sqlDelete, [emp_id, days, schedule_type_id, 0, 1]);
                if(result.affectedRows > 0) {
                    employees_affected++;
                }
                return result;
            })
        );

        // Count the total affected rows
        const totalAffectedRows = delete_shift_schedules.reduce((total, result) => {
            return total + result.affectedRows; // Sum the affectedRows from each result
        }, 0);


        // Check the length of users
        const [users] = await db.query(sql);

        if (users.length === array_employee_emp_id.length) {
            return res.status(200).json({ success: 'Shift schedule for all employees has been updated.' });
        }

        return res.status(200).json({ success: `Shift schedule for ${employees_affected} employees has been updated.` });
    } catch (error) {
        console.error(error); // Log the error for debugging
        return res.status(500).json({ error: 'Failed to delete shift schedule.' });
    }
});


export const get_break_shift_schedule_day = asyncHandler(async (req, res) => {
    try {
        const sql = `SELECT 
        break_schedule.emp_ID,
        DATE_FORMAT(break_schedule.shift_in, '%Y-%m-%d %H:%i:%s') AS shift_in, 
        DATE_FORMAT(break_schedule.shift_out, '%Y-%m-%d %H:%i:%s') AS shift_out,
        DATE_FORMAT(break_schedule.day, '%Y-%m-%d') AS day,
        break_schedule.plotted_by,
        break_schedule.schedule_type,
        CONCAT(employee_profile.fName, ' ', employee_profile.lName) AS fullName
        FROM break_schedule 
        LEFT JOIN employee_profile ON break_schedule.emp_ID = employee_profile.emp_ID`; // Use a parameterized query

        const [result] = await db.query(sql);

        return res.status(200).json({ data: result });
    } catch (error) {
        console.error(error); // Log the error for debugging
        return res.status(500).json({ error: 'Failed to display break shift schedule.' });
    }
});




export const get_break_shift_schedule_day_supervisor = asyncHandler(async (req, res) => {
    const { supervisor_emp_id } = req.params; // Assuming cluster_id is passed as a URL parameter
    
    try {
        const sql = 'SELECT * FROM admin_login WHERE emp_ID = ?'; // Use a parameterized query

        const [data_admin_login] = await db.query(sql, [supervisor_emp_id]);

        if (data_admin_login.length === 0) {
            return res.status(404).json({ error: 'Supervisor not found.' });
        }

        const bucketArray = JSON.parse(data_admin_login[0]['bucket'] == null || data_admin_login[0]['bucket'] == "" || JSON.parse(data_admin_login[0]['bucket']).length == 0 ? "[0]" : data_admin_login[0]['bucket'] );
	    const placeholders = bucketArray.map(() => '?').join(', ');

        const sql2 = `SELECT 
        break_schedule.emp_ID,
        DATE_FORMAT(break_schedule.shift_in, '%Y-%m-%d %H:%i:%s') AS shift_in, 
        DATE_FORMAT(break_schedule.shift_out, '%Y-%m-%d %H:%i:%s') AS shift_out,
        DATE_FORMAT(break_schedule.day, '%Y-%m-%d') AS day,
        break_schedule.plotted_by,
        break_schedule.schedule_type,
        CONCAT(employee_profile.fName, ' ', employee_profile.lName) AS fullName
        FROM break_schedule 
        LEFT JOIN employee_profile ON break_schedule.emp_ID = employee_profile.emp_ID
        WHERE employee_profile.clusterID IN (${placeholders})`; // Use a parameterized query

        // Flatten the parameters for the query
        const params = [...bucketArray];
        const [result] = await db.query(sql2, params);

        return res.status(200).json({ data: result });
    } catch (error) {
        console.error(error); // Log the error for debugging
        return res.status(500).json({ error: 'Failed to display break shift schedule.' });
    }
});




