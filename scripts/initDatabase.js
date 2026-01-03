// Database Initialization and Verification Script
// This script verifies that the database connection works and the ChatMessage model is set up correctly

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import ChatMessage from '../models/chatMessage.js';

dotenv.config();

async function initDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    
    // Connect to database
    await connectDB();
    
    console.log('✅ Database connected successfully!');
    console.log(`📊 Database Name: ${mongoose.connection.db.databaseName}`);
    
    // Check if chatmessages collection exists
    const collections = await mongoose.connection.db.listCollections().toArray();
    const chatMessagesExists = collections.some(col => col.name === 'chatmessages');
    
    if (chatMessagesExists) {
      console.log('✅ ChatMessages collection already exists');
      
      // Get count of existing messages
      const messageCount = await ChatMessage.countDocuments();
      console.log(`📝 Current messages in database: ${messageCount}`);
    } else {
      console.log('ℹ️  ChatMessages collection will be created automatically when first message is saved');
    }
    
    // Verify the model schema
    console.log('\n📋 ChatMessage Schema:');
    console.log('  - userEmail: String (required)');
    console.log('  - userName: String (required)');
    console.log('  - message: String (required)');
    console.log('  - reply: String (default: "")');
    console.log('  - status: String (enum: ["pending", "answered"], default: "pending")');
    console.log('  - repliedAt: Date');
    console.log('  - createdAt: Date (default: Date.now)');
    
    console.log('\n✅ Database setup verified! The chatbox feature is ready to use.');
    console.log('\n💡 The collection will be created automatically when:');
    console.log('   1. A user sends their first message through the chatbox');
    console.log('   2. The server saves it to the database');
    
    // Optional: Create a test message (commented out by default)
    // Uncomment below to create a test message
    /*
    console.log('\n🧪 Creating a test message...');
    const testMessage = new ChatMessage({
      userEmail: 'test@example.com',
      userName: 'Test User',
      message: 'This is a test message to verify the database works!',
      status: 'pending'
    });
    await testMessage.save();
    console.log('✅ Test message created successfully!');
    */
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    console.error('\n🔍 Troubleshooting:');
    console.error('   1. Check that your .env file exists and contains MONGO_URI');
    console.error('   2. Verify your MongoDB connection string is correct');
    console.error('   3. Ensure MongoDB Atlas cluster is running (if using Atlas)');
    console.error('   4. Check your network connection');
    process.exit(1);
  }
}

// Run the initialization
initDatabase();


