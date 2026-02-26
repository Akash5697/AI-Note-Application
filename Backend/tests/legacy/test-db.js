const mongoose = require('mongoose');
const config = require('./config/config');

async function testDatabaseConnection() {
  console.log('Testing database connectivity...');
  console.log('MongoDB URI:', config.mongoURI);
  
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ MongoDB connection successful!');
    console.log('Database name:', mongoose.connection.name);
    console.log('Connection state:', mongoose.connection.readyState);
    
    // Test a simple operation
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    // Close the connection
    await mongoose.connection.close();
    console.log('✅ Database connection test completed successfully');
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error:', error.message);
    
    if (error.name === 'MongoNetworkError') {
      console.error('\nPossible solutions:');
      console.error('1. Make sure MongoDB is running on your system');
      console.error('2. Check if MongoDB is running on the default port (27017)');
      console.error('3. Verify the connection string in config/config.js');
    }
    
    process.exit(1);
  }
}

testDatabaseConnection(); 