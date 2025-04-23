import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import { db } from '../../config/config.js'; // Import the database connection

import moment from 'moment-timezone';
function formatCutoffPeriod(startDate, endDate) {
    const optionsMonthDay = { month: 'long', day: '2-digit' };
    const optionsYear = { year: 'numeric' };

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Format the start date to "April 01"
    const formattedStart = start.toLocaleDateString('en-US', optionsMonthDay);
    
    // Format the end date to "April 15"
    const formattedEnd = end.toLocaleDateString('en-US', optionsMonthDay);
    
    // Format the year from the start date
    const formattedYear = start.toLocaleDateString('en-US', optionsYear);

    // Combine the formatted strings
    return `${formattedStart} - ${formattedEnd}, ${formattedYear}`;
}

function getPreviousMonthDates(referenceDate) {
    // Create a new Date object based on the reference date
    const date = new Date(referenceDate);

    // Set the date to the first day of the current month
    date.setDate(1);
    
    // Move back one month
    date.setMonth(date.getMonth() - 1);

    // Get the start date (first day of the previous month)
    const startDate = new Date(date);
    
    // Get the end date (last day of the previous month)
    const endDate = new Date(date);
    endDate.setMonth(endDate.getMonth() + 1); // Move to the next month
    endDate.setDate(0); // Set to the last day of the previous month

    // Format the dates to MM-DD-YYYY
    const formatDate = (d) => {
        const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const day = String(d.getDate()).padStart(2, '0');
        const year = d.getFullYear();
        return `${year}-${month}-${day}`;
    };

    return {
        start: formatDate(startDate),
        end: formatDate(endDate)
    };
}



export const get_all_eligible_att_incentive = asyncHandler(async (req, res) => {
    const { cutoff_id } = req.params; // Assuming cluster_id is passed as a URL parameter

    try {
        const sql_cutoff  = `SELECT id, 
            DATE_FORMAT(startDate, '%Y-%m-%d') AS startDate,
            DATE_FORMAT(endDate, '%Y-%m-%d') AS endDate,
            status FROM cutoff WHERE id = ?`; // Use a parameterized query 

        const sql_leave_request = `
            SELECT 
                emp_ID,
                COUNT(*) AS approved_count,
                DATE_FORMAT(date, '%Y-%m-%d') AS date
            FROM 
                leave_request 
            WHERE 
                DATE_FORMAT(date, '%Y-%m-%d') >= ? 
                AND DATE_FORMAT(date, '%Y-%m-%d') <= ? 
                AND status2 = 'Approved'
            GROUP BY 
                emp_ID
            HAVING 
                approved_count >= 2`;


        const sql_incident_report = `
            SELECT 
                emp_ID,
                COUNT(*) AS report_count,
                DATE_FORMAT(submitted_datetime, '%Y-%m-%d') AS submitted_datetime
            FROM 
                incident_report 
            WHERE 
                DATE_FORMAT(submitted_datetime, '%Y-%m-%d') >= ? 
                AND DATE_FORMAT(submitted_datetime, '%Y-%m-%d') <= ? 
            GROUP BY 
                emp_ID
            HAVING 
                report_count >= 1`;


        const sql_absent_1 = `
            SELECT
                shift_schedule.id,
                shift_schedule.emp_ID,
                DATE_FORMAT(shift_schedule.day, '%Y-%m-%d') AS absent_day
            FROM 
                shift_schedule 
            LEFT JOIN 
                attendance ON shift_schedule.emp_ID = attendance.emp_ID AND DATE_FORMAT(shift_schedule.day, '%Y-%m-%d') = DATE_FORMAT(attendance.date, '%Y-%m-%d')
            WHERE 
                attendance.id IS NULL 
                AND DATE_FORMAT(shift_schedule.day, '%Y-%m-%d') >= ? 
                AND DATE_FORMAT(shift_schedule.day, '%Y-%m-%d') <= ?
            ORDER BY 
                shift_schedule.id ASC`;

        const sql_absent_2 = `
            SELECT
                shift_schedule.id,
                shift_schedule.emp_ID,
                DATE_FORMAT(shift_schedule.day, '%Y-%m-%d') AS absent_day
            FROM 
                shift_schedule 
            LEFT JOIN 
                dtr ON shift_schedule.emp_ID = dtr.emp_ID AND DATE_FORMAT(shift_schedule.day, '%Y-%m-%d') = DATE_FORMAT(dtr.date, '%Y-%m-%d')
            WHERE 
                dtr.id IS NULL 
                AND DATE_FORMAT(shift_schedule.day, '%Y-%m-%d') >= ? 
                AND DATE_FORMAT(shift_schedule.day, '%Y-%m-%d') <= ?
            ORDER BY 
                shift_schedule.id ASC`;

        const sql_employee_profile = `
            SELECT id,
                emp_ID,
                CONCAT(fName, ' ', lName) AS employee_fullname,
                2000 as amount,
                ? AS cutoff_period,
                ? as cutoffID
            FROM 
                employee_profile
            WHERE emp_ID NOT IN (?)`;

        const sql9 = `
            SELECT
                ss.id,
                ss.emp_ID,
                DATE_FORMAT(ss.day, '%Y-%m-%d') AS day,
                SUM(TIMESTAMPDIFF(MINUTE, ss.shift_in, a.timeIN)) AS late_minutes
            FROM 
                shift_schedule ss
            LEFT JOIN 
                attendance a ON ss.emp_ID = a.emp_ID  AND DATE_FORMAT(ss.day, '%Y-%m-%d') = DATE_FORMAT(a.date, '%Y-%m-%d')
            WHERE 
                a.id IS NOT NULL 
                AND ss.day >= ? 
                AND ss.day <= ?
                AND a.timeIN > ss.shift_in 
            GROUP BY 
                ss.day
            ORDER BY 
                ss.id ASC`;


        const sql10 = `
            SELECT
                ss.id,
                ss.emp_ID,
                DATE_FORMAT(ss.day, '%Y-%m-%d') AS day,
                SUM(TIMESTAMPDIFF(MINUTE, ss.shift_in, a.timeIN)) AS late_minutes,
                SUM(TIMESTAMPDIFF(MINUTE, a.timeIN, a.timeOUT)) AS total_minutes_attendance,
                SUM(TIMESTAMPDIFF(MINUTE, ss.shift_in, ss.shift_out)) AS total_minutes_shift,
                (SUM(TIMESTAMPDIFF(MINUTE, ss.shift_in, ss.shift_out)) - SUM(TIMESTAMPDIFF(MINUTE, a.timeIN, a.timeOUT))) AS undertime
            FROM 
                shift_schedule ss
            LEFT JOIN 
                attendance a ON ss.emp_ID = a.emp_ID  AND DATE_FORMAT(ss.day, '%Y-%m-%d') = DATE_FORMAT(a.date, '%Y-%m-%d')
            WHERE 
                a.id IS NOT NULL 
                AND ss.day >= ? 
                AND ss.day <= ?
            GROUP BY 
                ss.day
            HAVING 
                undertime >= 1
            ORDER BY 
                ss.id ASC`;

        const sql_init_employee = `
            SELECT 
                ep.emp_ID
            FROM 
                employee_profile ep
            WHERE 
                ep.emp_ID NOT IN (
                    SELECT 
                        ss.emp_ID
                    FROM 
                        shift_schedule ss
                    WHERE 
                        ss.day >= ? 
                        AND ss.day <= ?
                    GROUP BY 
                        ss.emp_ID
                )
            ORDER BY 
                ep.id ASC`;


        const sql_break_time = `
            SELECT
                bs.id,
                bs.emp_ID,
                DATE_FORMAT(bs.day, '%Y-%m-%d') AS day,
                SUM(TIMESTAMPDIFF(MINUTE, b.breakIN, b.breakOUT)) AS total_minutes_break,
                SUM(TIMESTAMPDIFF(MINUTE, bs.shift_in, bs.shift_out)) AS total_minutes_break2,
                (SUM(TIMESTAMPDIFF(MINUTE, b.breakIN, b.breakOUT)) - SUM(TIMESTAMPDIFF(MINUTE, bs.shift_in, bs.shift_out))) AS over_break_time
            FROM 
                 break_schedule bs
            LEFT JOIN 
                breaks b ON bs.emp_ID = b.emp_ID  AND DATE_FORMAT(bs.day, '%Y-%m-%d') = DATE_FORMAT(b.date, '%Y-%m-%d')
            WHERE 
                bs.day >= ? 
                AND bs.day <= ?
                AND b.id IS NOT NULL
            GROUP BY 
                bs.day AND bs.emp_ID
            HAVING 
                over_break_time >= 1
            ORDER BY 
                bs.id ASC`;

        const sql_undertime = `
            SELECT
                id,
                emp_ID,
                undertime,
                DATE_FORMAT(date, '%Y-%m-%d') AS date
            FROM 
                dtr 
            WHERE 
                date >= ? 
                AND date <= ?
            HAVING 
                undertime >= 1
            ORDER BY 
                id ASC`;

        const sql_late = `
            SELECT
                id,
                emp_ID,
                late,
                DATE_FORMAT(date, '%Y-%m-%d') AS date
            FROM 
                dtr 
            WHERE 
                date >= ? 
                AND date <= ?
            HAVING 
                late >= 1
            ORDER BY 
                id ASC`;
    

        const [cutoff] = await db.query(sql_cutoff, [cutoff_id]); //100%

        if (cutoff.length === 0) {
            return res.status(404).json({ error: 'Cutoff not found.' });
        }
        
        const previousMonthDates = getPreviousMonthDates(cutoff[0]['startDate']);


        const [leave_requests] = await db.query(sql_leave_request, [previousMonthDates.start, previousMonthDates.end]); //100%
        const [incident_reports] = await db.query(sql_incident_report, [previousMonthDates.start, previousMonthDates.end]); //100%
        const [absent_employees] = await db.query(sql_absent_2, [previousMonthDates.start, previousMonthDates.end]); //100%
        //const [late_employees] = await db.query(sql9, [cutoff[0]['startDate'], cutoff[0]['endDate']]); //90%
        //const [undertime_employees] = await db.query(sql10, [cutoff[0]['startDate'], cutoff[0]['endDate']]); //90%
        const [initial_employees] = await db.query(sql_init_employee,  [previousMonthDates.start, previousMonthDates.end]); //100%
        const [over_break_time_employees] = await db.query(sql_break_time,  [previousMonthDates.start, previousMonthDates.end]); //100%
        const [undertime_employees] = await db.query(sql_undertime,  [previousMonthDates.start, previousMonthDates.end]); //100%
        const [late_employees] = await db.query(sql_late,  [previousMonthDates.start, previousMonthDates.end]); //100%



        const _over_break_time_employees = await Promise.all(
            over_break_time_employees.map(async (over_break_time_employee) => {
                return over_break_time_employee.emp_ID;
            })
        );

        const _initial_employees = await Promise.all(
            initial_employees.map(async (initial_employee) => {
                return initial_employee.emp_ID;
            })
        );

        const _undertime_employees = await Promise.all(
            undertime_employees.map(async (undertime_employee) => {
                return undertime_employee.emp_ID;
            })
        );


        const _late_employees = await Promise.all(
            late_employees.map(async (late_employee) => {
                return late_employee.emp_ID;
            })
        );

        const _absent_employees = await Promise.all(
            absent_employees.map(async (absent_employee) => {
                return absent_employee.emp_ID;
            })
        );


        const leave_request_employees = await Promise.all(
            leave_requests.map(async (leave_request) => {
                return leave_request.emp_ID;
            })
        );

        const incident_report_employees = await Promise.all(
            incident_reports.map(async (incident_report) => {
                return incident_report.emp_ID;
            })
        );


        const combinedEmployees = [...new Set([...leave_request_employees, ...incident_report_employees, ..._absent_employees, ..._late_employees, ..._undertime_employees, ..._initial_employees, ..._over_break_time_employees])];
        const [employee_profile] = await db.query(sql_employee_profile, [formatCutoffPeriod(cutoff[0]['startDate'], cutoff[0]['endDate']), cutoff_id, combinedEmployees]);  

        // Return the merged results in the response
        return res.status(200).json({  data : employee_profile });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});


 

export const get_all_eligible_att_incentive_supervisor = asyncHandler(async (req, res) => {
    const { cutoff_id, supervisor_emp_id   } = req.params; // Assuming cluster_id is passed as a URL parameter

    try {
        const sql_cutoff  = `SELECT id, 
            DATE_FORMAT(startDate, '%Y-%m-%d') AS startDate,
            DATE_FORMAT(endDate, '%Y-%m-%d') AS endDate,
            status FROM cutoff WHERE id = ?`; // Use a parameterized query 

        const sql_leave_request = `
            SELECT 
                emp_ID,
                COUNT(*) AS approved_count,
                DATE_FORMAT(date, '%Y-%m-%d') AS date
            FROM 
                leave_request 
            WHERE 
                DATE_FORMAT(date, '%Y-%m-%d') >= ? 
                AND DATE_FORMAT(date, '%Y-%m-%d') <= ? 
                AND status2 = 'Approved'
            GROUP BY 
                emp_ID
            HAVING 
                approved_count >= 2`;


        const sql_incident_report = `
            SELECT 
                emp_ID,
                COUNT(*) AS report_count,
                DATE_FORMAT(submitted_datetime, '%Y-%m-%d') AS submitted_datetime
            FROM 
                incident_report 
            WHERE 
                DATE_FORMAT(submitted_datetime, '%Y-%m-%d') >= ? 
                AND DATE_FORMAT(submitted_datetime, '%Y-%m-%d') <= ? 
            GROUP BY 
                emp_ID
            HAVING 
                report_count >= 1`;


        const sql_absent_1 = `
            SELECT
                shift_schedule.id,
                shift_schedule.emp_ID,
                DATE_FORMAT(shift_schedule.day, '%Y-%m-%d') AS absent_day
            FROM 
                shift_schedule 
            LEFT JOIN 
                attendance ON shift_schedule.emp_ID = attendance.emp_ID AND DATE_FORMAT(shift_schedule.day, '%Y-%m-%d') = DATE_FORMAT(attendance.date, '%Y-%m-%d')
            WHERE 
                attendance.id IS NULL 
                AND DATE_FORMAT(shift_schedule.day, '%Y-%m-%d') >= ? 
                AND DATE_FORMAT(shift_schedule.day, '%Y-%m-%d') <= ?
            ORDER BY 
                shift_schedule.id ASC`;

        const sql_absent_2 = `
            SELECT
                shift_schedule.id,
                shift_schedule.emp_ID,
                DATE_FORMAT(shift_schedule.day, '%Y-%m-%d') AS absent_day
            FROM 
                shift_schedule 
            LEFT JOIN 
                dtr ON shift_schedule.emp_ID = dtr.emp_ID AND DATE_FORMAT(shift_schedule.day, '%Y-%m-%d') = DATE_FORMAT(dtr.date, '%Y-%m-%d')
            WHERE 
                dtr.id IS NULL 
                AND DATE_FORMAT(shift_schedule.day, '%Y-%m-%d') >= ? 
                AND DATE_FORMAT(shift_schedule.day, '%Y-%m-%d') <= ?
            ORDER BY 
                shift_schedule.id ASC`;

        const sql_employee_profile = `
            SELECT id,
                emp_ID,
                CONCAT(fName, ' ', lName) AS employee_fullname,
                2000 as amount,
                ? AS cutoff_period,
                ? as cutoffID
            FROM 
                employee_profile
            WHERE emp_ID NOT IN (?)`;

        const sql9 = `
            SELECT
                ss.id,
                ss.emp_ID,
                DATE_FORMAT(ss.day, '%Y-%m-%d') AS day,
                SUM(TIMESTAMPDIFF(MINUTE, ss.shift_in, a.timeIN)) AS late_minutes
            FROM 
                shift_schedule ss
            LEFT JOIN 
                attendance a ON ss.emp_ID = a.emp_ID  AND DATE_FORMAT(ss.day, '%Y-%m-%d') = DATE_FORMAT(a.date, '%Y-%m-%d')
            WHERE 
                a.id IS NOT NULL 
                AND ss.day >= ? 
                AND ss.day <= ?
                AND a.timeIN > ss.shift_in 
            GROUP BY 
                ss.day
            ORDER BY 
                ss.id ASC`;


        const sql10 = `
            SELECT
                ss.id,
                ss.emp_ID,
                DATE_FORMAT(ss.day, '%Y-%m-%d') AS day,
                SUM(TIMESTAMPDIFF(MINUTE, ss.shift_in, a.timeIN)) AS late_minutes,
                SUM(TIMESTAMPDIFF(MINUTE, a.timeIN, a.timeOUT)) AS total_minutes_attendance,
                SUM(TIMESTAMPDIFF(MINUTE, ss.shift_in, ss.shift_out)) AS total_minutes_shift,
                (SUM(TIMESTAMPDIFF(MINUTE, ss.shift_in, ss.shift_out)) - SUM(TIMESTAMPDIFF(MINUTE, a.timeIN, a.timeOUT))) AS undertime
            FROM 
                shift_schedule ss
            LEFT JOIN 
                attendance a ON ss.emp_ID = a.emp_ID  AND DATE_FORMAT(ss.day, '%Y-%m-%d') = DATE_FORMAT(a.date, '%Y-%m-%d')
            WHERE 
                a.id IS NOT NULL 
                AND ss.day >= ? 
                AND ss.day <= ?
            GROUP BY 
                ss.day
            HAVING 
                undertime >= 1
            ORDER BY 
                ss.id ASC`;

        const sql_init_employee = `
            SELECT 
                ep.emp_ID
            FROM 
                employee_profile ep
            WHERE 
                ep.emp_ID NOT IN (
                    SELECT 
                        ss.emp_ID
                    FROM 
                        shift_schedule ss
                    WHERE 
                        ss.day >= ? 
                        AND ss.day <= ?
                    GROUP BY 
                        ss.emp_ID
                )
            ORDER BY 
                ep.id ASC`;


        const sql_break_time = `
            SELECT
                bs.id,
                bs.emp_ID,
                DATE_FORMAT(bs.day, '%Y-%m-%d') AS day,
                SUM(TIMESTAMPDIFF(MINUTE, b.breakIN, b.breakOUT)) AS total_minutes_break,
                SUM(TIMESTAMPDIFF(MINUTE, bs.shift_in, bs.shift_out)) AS total_minutes_break2,
                (SUM(TIMESTAMPDIFF(MINUTE, b.breakIN, b.breakOUT)) - SUM(TIMESTAMPDIFF(MINUTE, bs.shift_in, bs.shift_out))) AS over_break_time
            FROM 
                 break_schedule bs
            LEFT JOIN 
                breaks b ON bs.emp_ID = b.emp_ID  AND DATE_FORMAT(bs.day, '%Y-%m-%d') = DATE_FORMAT(b.date, '%Y-%m-%d')
            WHERE 
                bs.day >= ? 
                AND bs.day <= ?
                AND b.id IS NOT NULL
            GROUP BY 
                bs.day AND bs.emp_ID
            HAVING 
                over_break_time >= 1
            ORDER BY 
                bs.id ASC`;

        const sql_undertime = `
            SELECT
                id,
                emp_ID,
                undertime,
                DATE_FORMAT(date, '%Y-%m-%d') AS date
            FROM 
                dtr 
            WHERE 
                date >= ? 
                AND date <= ?
            HAVING 
                undertime >= 1
            ORDER BY 
                id ASC`;

        const sql_late = `
            SELECT
                id,
                emp_ID,
                late,
                DATE_FORMAT(date, '%Y-%m-%d') AS date
            FROM 
                dtr 
            WHERE 
                date >= ? 
                AND date <= ?
            HAVING 
                late >= 1
            ORDER BY 
                id ASC`;
    
        const sql_supervisor  = `SELECT * FROM admin_login WHERE emp_ID = ?`; 


        const [data_admin_login] = await db.query(sql_supervisor, [supervisor_emp_id]);
                
        if (data_admin_login.length === 0) {
                return res.status(404).json({ error: 'Supervisor not found.' });
        }
        
        const bucketArray = JSON.parse(data_admin_login[0]['bucket'] == null || data_admin_login[0]['bucket'] == "" || JSON.parse(data_admin_login[0]['bucket']).length == 0 ? "[0]" : data_admin_login[0]['bucket'] );
        const placeholders = bucketArray.map(() => '?').join(', ');
                
        const sql14 = `
            SELECT id,
                emp_ID,
                CONCAT(fName, ' ', lName) AS employee_fullname,
                2000 as amount,
                ? AS cutoff_period,
                ? as cutoffID
            FROM 
                employee_profile
            WHERE emp_ID IN (?) 
            AND clusterID IN (${placeholders})`;

        const [cutoff] = await db.query(sql_cutoff, [cutoff_id]); //100%

        if (cutoff.length === 0) {
            return res.status(404).json({ error: 'Cutoff not found.' });
        }
        
        const previousMonthDates = getPreviousMonthDates(cutoff[0]['startDate']);


        const [leave_requests] = await db.query(sql_leave_request, [previousMonthDates.start, previousMonthDates.end]); //100%
        const [incident_reports] = await db.query(sql_incident_report, [previousMonthDates.start, previousMonthDates.end]); //100%
        const [absent_employees] = await db.query(sql_absent_2, [previousMonthDates.start, previousMonthDates.end]); //100%
        //const [late_employees] = await db.query(sql9, [cutoff[0]['startDate'], cutoff[0]['endDate']]); //90%
        //const [undertime_employees] = await db.query(sql10, [cutoff[0]['startDate'], cutoff[0]['endDate']]); //90%
        const [initial_employees] = await db.query(sql_init_employee,  [previousMonthDates.start, previousMonthDates.end]); //100%
        const [over_break_time_employees] = await db.query(sql_break_time,  [previousMonthDates.start, previousMonthDates.end]); //100%
        const [undertime_employees] = await db.query(sql_undertime,  [previousMonthDates.start, previousMonthDates.end]); //100%
        const [late_employees] = await db.query(sql_late,  [previousMonthDates.start, previousMonthDates.end]); //100%



        const _over_break_time_employees = await Promise.all(
            over_break_time_employees.map(async (over_break_time_employee) => {
                return over_break_time_employee.emp_ID;
            })
        );

        const _initial_employees = await Promise.all(
            initial_employees.map(async (initial_employee) => {
                return initial_employee.emp_ID;
            })
        );

        const _undertime_employees = await Promise.all(
            undertime_employees.map(async (undertime_employee) => {
                return undertime_employee.emp_ID;
            })
        );


        const _late_employees = await Promise.all(
            late_employees.map(async (late_employee) => {
                return late_employee.emp_ID;
            })
        );

        const _absent_employees = await Promise.all(
            absent_employees.map(async (absent_employee) => {
                return absent_employee.emp_ID;
            })
        );


        const leave_request_employees = await Promise.all(
            leave_requests.map(async (leave_request) => {
                return leave_request.emp_ID;
            })
        );

        const incident_report_employees = await Promise.all(
            incident_reports.map(async (incident_report) => {
                return incident_report.emp_ID;
            })
        );


        const combinedEmployees = [...new Set([...leave_request_employees, ...incident_report_employees, ..._absent_employees, ..._late_employees, ..._undertime_employees, ..._initial_employees, ..._over_break_time_employees])];
        const [employee_profiles] = await db.query(sql_employee_profile, [formatCutoffPeriod(cutoff[0]['startDate'], cutoff[0]['endDate']), cutoff_id, combinedEmployees]);  

        const _employee_profile = await Promise.all(
            employee_profiles.map(async (employee_profile) => {
                return employee_profile.emp_ID;
            })
        );

        const combinedEmployeesSupervisor = [...new Set([..._employee_profile])];

        const [eligible_att_incentives] = await db.query(sql14, [formatCutoffPeriod(cutoff[0]['startDate'], cutoff[0]['endDate']), cutoff_id, combinedEmployeesSupervisor.length > 0 ? combinedEmployeesSupervisor : [null], ...bucketArray]);


        return res.status(200).json({ data : eligible_att_incentives });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get all data.' });
    }
});
