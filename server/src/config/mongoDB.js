const mongoose = require("mongoose");

// Function to connect to the MongoDB database
const connectDatabase = async () => {
  try {
    // Connect to the MongoDB database using the connection string from environment variables
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // useNewUrlParser: true,     // Use the new URL parser to avoid deprecation warnings
      // useUnifiedTopology: true,  // Use the new topology engine to avoid deprecation warnings
    });

    // Log successful connection message with the host name
    console.log(
      `Connected to MongoDB database at host: ${conn.connection.host}`
    );
  } catch (error) {
    // Log the error message if connection fails
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1); // Exit the process with failure
  }
};

// Export the function to be used in other parts of the application
module.exports = connectDatabase;
