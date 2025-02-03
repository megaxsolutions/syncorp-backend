// models/admin.js
import { Sequelize, DataTypes } from 'sequelize';

const sequelize = new Sequelize('sync_db', 'root', '', {
    host: 'localhost',
    dialect: 'mysql'
});

const UserSchema = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    emp_ID: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    password: {
        type: DataTypes.TEXT('long'), // Specify 'long' to indicate LONGTEXT
        allowNull: false
    },
    login_attempts: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    expiry_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')    
    }
}, {
    tableName: 'users',
    timestamps: false // Disable timestamps if you don't want createdAt/updatedAt fields
});

// Sync the model with the database
const syncDatabase = async () => {
    try {
        await sequelize.sync();
        console.log('Users table has been created (if it did not exist).');
    } catch (error) {
        console.error('Unable to create table:', error);
    }
};

syncDatabase();

export default UserSchema;