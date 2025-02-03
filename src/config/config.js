// db.js
import mysql from 'mysql2';

const db = mysql.createConnection({
    host: '13.228.73.214',
    user: 'sync_admin',
    password: 'Kk9566678@!',
    database: 'sync_db'
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to MySQL database.');
});

// Export the database connection
export default db;