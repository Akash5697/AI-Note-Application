const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/notes_db';
const client = new MongoClient(uri);

let db;

const connectDb = async () => {
    try {
        await client.connect();
        db = client.db();
        console.log('Connected to MongoDB');

        // Create indexes
        await db.collection('users').createIndex({ email: 1 }, { unique: true });
        await db.collection('users').createIndex({ username: 1 }, { unique: true });
        await db.collection('roles').createIndex({ name: 1 }, { unique: true });
        await db.collection('notes').createIndex({ userId: 1 });
        await db.collection('notes').createIndex({ tags: 1 });
        await db.collection('shared_notes').createIndex({ noteId: 1, userId: 1 }, { unique: true });

        console.log('Database indexes created');
        return db;
    } catch (error) {
        console.error('Unable to connect to MongoDB:', error);
        process.exit(1);
    }
};

const getDb = () => {
    if (!db) {
        throw new Error('Database not initialized. Call connectDb first.');
    }
    return db;
};

module.exports = { connectDb, getDb, ObjectId };
