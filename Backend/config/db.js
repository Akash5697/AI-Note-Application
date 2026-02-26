const { Sequelize } = require('sequelize');
require('dotenv').config();

const dbOptions = {
    dialect: 'postgres',
    logging: false,
    pool: {
        max: 20,
        min: 2,
        acquire: 30000,
        idle: 10000
    }
};

// Standard SSL config for cloud providers like Render (required for public connection)
if (process.env.NODE_ENV === 'development' || process.env.DATABASE_URL) {
    dbOptions.dialectOptions = {
        ssl: {
            require: true,
            rejectUnauthorized: false // Necessary for many cloud providers with self-signed certs
        }
    };
}

const sequelize = process.env.DATABASE_URL
    ? new Sequelize(process.env.DATABASE_URL, dbOptions)
    : new Sequelize(
        process.env.DB_NAME || 'notes_db',
        process.env.DB_USER || 'postgres',
        process.env.DB_PASSWORD || 'postgres',
        {
            ...dbOptions,
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
        }
    );

const connectDb = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to PostgreSQL');

        // Sync models
        await sequelize.sync({ alter: true });
        console.log('Database synced');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
};

module.exports = { sequelize, connectDb };
