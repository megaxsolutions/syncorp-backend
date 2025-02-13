// db.js
import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: 3306,
    timezone: '+08:00' // Set the timezone to UTC+8
});



// db.connect(err => {
//     if (err) {
//         console.error('Database connection failed:', err);
//         return;
//     }
//     console.log('Connected to MySQL database.');
// });

// Export the database connection
export default db;
