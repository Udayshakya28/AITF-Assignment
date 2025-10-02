// MongoDB initialization script
db = db.getSiblingDB('ai-weather-chatbot');

// Create collections with indexes
db.createCollection('chats');
db.createCollection('users');

// Create indexes for better performance
db.chats.createIndex({ "sessionId": 1 }, { unique: true });
db.chats.createIndex({ "userId": 1 });
db.chats.createIndex({ "createdAt": -1 });
db.chats.createIndex({ "updatedAt": -1 });

db.users.createIndex({ "userId": 1 }, { unique: true });
db.users.createIndex({ "lastActive": -1 });

print('Database initialized successfully!');

