import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import db from './../config/config.js'; // Import the database connection
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



export const create_shift_schedule_multiple_day_overtime = asyncHandler(async (req, res) => {
    const { array_employee_emp_id, admin_emp_id, shift_in, shift_out, array_selected_days, schedule_type_id } = req.body;

    try {
        const sql  = 'SELECT * FROM login'; // Use a parameterized query

        const sqlInsert = 'INSERT INTO shift_schedule (emp_ID, shift_in, shift_out, day, plotted_by, schedule_type, is_overtime) VALUES ?';

        const sqlSelect = `SELECT emp_ID, 
        DATE_FORMAT(day, '%Y-%m-%d') AS day, 
        DATE_FORMAT(shift_in, '%Y-%m-%d %H:%i:%s') AS shift_in,
        DATE_FORMAT(shift_out, '%Y-%m-%d %H:%i:%s') AS shift_out  
        FROM shift_schedule WHERE emp_ID = ? AND day IN (?) AND schedule_type = ? AND is_overtime = ?`;
 
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
                const [result] = await db.query(sqlSelect, [emp_id, days, schedule_type_id, 1]);
                return result;
            })
        );

        
        // const shift_schedules = await Promise.all(
        //     emp_ids.map(async (emp_id) => {
        //         // Use Promise.all to wait for all day queries to complete
        //         const results = await Promise.all(
        //             days.map(async (day) => {
        //                 const [result] = await db.query(sqlSelect, [emp_id, day, schedule_type_id, 1]);
        //                 return result; // Return the first object directly
        //             })
        //         );
        //         return results.flat(); // Flatten the results for each employee
        //     })
        // );
        // The result is a 2D array: each emp_id will have an array of results for their days.
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
                    insertValues.push([emp_id, `${day} ${shift_in}`, `${check_shift_type (shift_in, shift_out) === true ? day : extendDateByOneDay(day)} ${shift_out}`, day, admin_emp_id, schedule_type_id, 1]);
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
            return res.status(200).json({ success: 'Shift schedule for all employees has been updated.' });
        }

        return res.status(200).json({ success: `Shift schedule for ${employees_affected} employees has been updated.` });

    } catch (error) {
        console.error(error); // Log the error for debugging
        return res.status(500).json({ error: 'Failed to update shift schedule.' });
    }
});


export const create_shift_schedule_multiple_day = asyncHandler(async (req, res) => {
    const { array_employee_emp_id, admin_emp_id, shift_in, shift_out, array_selected_days, schedule_type_id, shift_type } = req.body;

    try {
        const sql  = 'SELECT * FROM login'; // Use a parameterized query

        const sqlInsert = 'INSERT INTO shift_schedule (emp_ID, shift_in, shift_out, day, plotted_by, schedule_type, is_overtime) VALUES ?';

        // Fix for the SQL query with the IN clause:
        const sqlSelect = `SELECT emp_ID, DATE_FORMAT(day, '%Y-%m-%d') AS day FROM shift_schedule WHERE emp_ID = ? AND day IN (?) AND schedule_type = ? AND  is_overtime = ?`;

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
                const [result] = await db.query(sqlSelect, [emp_id, days, schedule_type_id, 0]);
                return result;
            })
        );
        //shift_type === 0 means night shift
        //shift_type === 1 means day shift
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
                    insertValues.push([emp_id, `${day} ${shift_in}`, `${check_shift_type (shift_in, shift_out) === true ? day : extendDateByOneDay(day)} ${shift_out}`, day, admin_emp_id, schedule_type_id, 0]);
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
            return res.status(200).json({ success: 'Shift schedule for all employees has been updated.' });
        }

        return res.status(200).json({ success: `Shift schedule for ${employees_affected} employees has been updated.` });

    } catch (error) {
        console.error(error); // Log the error for debugging
        return res.status(500).json({ error: 'Failed to update shift schedule.' });
    }
});



export const delete_shift_schedule_multiple_day_overtime = asyncHandler(async (req, res) => {
    const { array_employee_emp_id, array_selected_days } = req.body;
    const { schedule_type_id } = req.params; // Assuming emp_id is passed as a URL parameter

    try {
        const sql  = 'SELECT * FROM login'; // Use a parameterized query

        const sqlDelete = `DELETE FROM shift_schedule WHERE emp_ID = ? AND DATE_FORMAT(day, '%Y-%m-%d') IN (?) AND schedule_type = ? AND is_overtime = ?`;

        const selected_days = array_selected_days;


        const insertValues = [];
        let employees_affected = 0;


        // Get all the schedules at once
        const emp_ids = array_employee_emp_id;
        const days = selected_days;


        const delete_shift_schedules = await Promise.all(
            emp_ids.map(async (emp_id) => {
                const [result] = await db.query(sqlDelete, [emp_id, days, schedule_type_id, 1]);
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


export const delete_shift_schedule_multiple_day = asyncHandler(async (req, res) => {
    const { array_employee_emp_id, array_selected_days } = req.body;
    const { schedule_type_id } = req.params; // Assuming emp_id is passed as a URL parameter

    try {
        const sql  = 'SELECT * FROM login'; // Use a parameterized query

        const sqlDelete = `DELETE FROM shift_schedule WHERE emp_ID = ? AND DATE_FORMAT(day, '%Y-%m-%d') IN (?) AND schedule_type = ? AND is_overtime = ?`;

        const selected_days = array_selected_days;


        const insertValues = [];
        let employees_affected = 0;


        // Get all the schedules at once
        const emp_ids = array_employee_emp_id;
        const days = selected_days;


        const delete_shift_schedules = await Promise.all(
            emp_ids.map(async (emp_id) => {
                const [result] = await db.query(sqlDelete, [emp_id, days, schedule_type_id, 0]);
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


export const get_shift_schedule_day = asyncHandler(async (req, res) => {
    const sql = `SELECT 
    emp_ID,
    DATE_FORMAT(shift_in, '%Y-%m-%d %H:%i:%s') AS shift_in, 
    DATE_FORMAT(shift_out, '%Y-%m-%d %H:%i:%s') AS shift_out,
    DATE_FORMAT(day, '%Y-%m-%d') AS day,
    plotted_by,
    schedule_type,
    is_overtime
    FROM shift_schedule WHERE is_overtime = ?`; // Use a parameterized query

    try {
        const [result] = await db.query(sql, [0]);

        return res.status(200).json({ data: result });
    } catch (error) {
        console.error(error); // Log the error for debugging
        return res.status(500).json({ error: 'Failed to delete shift schedule.' });
    }
});

export const get_shift_schedule_day_overtime = asyncHandler(async (req, res) => {
    const sql = `SELECT 
    emp_ID,
    DATE_FORMAT(shift_in, '%Y-%m-%d %H:%i:%s') AS shift_in, 
    DATE_FORMAT(shift_out, '%Y-%m-%d %H:%i:%s') AS shift_out,
    DATE_FORMAT(day, '%Y-%m-%d') AS day,
    plotted_by,
    schedule_type,
    is_overtime
    FROM shift_schedule WHERE is_overtime = ?`; // Use a parameterized query

    try {
        const [result] = await db.query(sql, [1]);

        return res.status(200).json({ data: result });
    } catch (error) {
        console.error(error); // Log the error for debugging
        return res.status(500).json({ error: 'Failed to delete shift schedule.' });
    }
});
