// In-memory session storage for demo mode
const logger = require('../utils/logger');

class SessionService {
  constructor() {
    this.sessions = new Map();
    this.isDbConnected = false;
    
    // Check database connection
    const mongoose = require('mongoose');
    mongoose.connection.on('connected', () => {
      this.isDbConnected = true;
      logger.info('Database connected - using persistent storage');
    });
    
    mongoose.connection.on('disconnected', () => {
      this.isDbConnected = false;
      logger.info('Database disconnected - using in-memory storage');
    });
  }

  async createSession(sessionData) {
    try {
      if (this.isDbConnected) {
        // Use database if available
        const Chat = require('../models/Chat');
        const chat = new Chat(sessionData);
        await chat.save();
        return chat;
      } else {
        // Use in-memory storage
        const session = {
          ...sessionData,
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date()
        };
        this.sessions.set(sessionData.sessionId, session);
        logger.info(`Created in-memory session: ${sessionData.sessionId}`);
        return session;
      }
    } catch (error) {
      logger.error('Session creation error:', error);
      throw error;
    }
  }

  async getSession(sessionId) {
    try {
      if (this.isDbConnected) {
        const Chat = require('../models/Chat');
        return await Chat.findOne({ sessionId });
      } else {
        return this.sessions.get(sessionId) || null;
      }
    } catch (error) {
      logger.error('Session retrieval error:', error);
      return this.sessions.get(sessionId) || null;
    }
  }

  async updateSession(sessionId, updateData) {
    try {
      if (this.isDbConnected) {
        const Chat = require('../models/Chat');
        return await Chat.findOneAndUpdate(
          { sessionId },
          { ...updateData, updatedAt: new Date() },
          { new: true }
        );
      } else {
        const session = this.sessions.get(sessionId);
        if (session) {
          Object.assign(session, updateData, { updatedAt: new Date() });
          this.sessions.set(sessionId, session);
        }
        return session;
      }
    } catch (error) {
      logger.error('Session update error:', error);
      const session = this.sessions.get(sessionId);
      if (session) {
        Object.assign(session, updateData, { updatedAt: new Date() });
        this.sessions.set(sessionId, session);
      }
      return session;
    }
  }

  async addMessage(sessionId, message) {
    try {
      const session = await this.getSession(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      if (this.isDbConnected) {
        const Chat = require('../models/Chat');
        return await Chat.findOneAndUpdate(
          { sessionId },
          { 
            $push: { messages: message },
            updatedAt: new Date()
          },
          { new: true }
        );
      } else {
        session.messages.push(message);
        session.updatedAt = new Date();
        this.sessions.set(sessionId, session);
        return session;
      }
    } catch (error) {
      logger.error('Add message error:', error);
      const session = this.sessions.get(sessionId);
      if (session) {
        session.messages.push(message);
        session.updatedAt = new Date();
        this.sessions.set(sessionId, session);
      }
      return session;
    }
  }

  async addSuggestion(sessionId, suggestion) {
    try {
      const session = await this.getSession(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      if (this.isDbConnected) {
        const Chat = require('../models/Chat');
        return await Chat.findOneAndUpdate(
          { sessionId },
          { 
            $push: { aiSuggestions: suggestion },
            updatedAt: new Date()
          },
          { new: true }
        );
      } else {
        if (!session.aiSuggestions) {
          session.aiSuggestions = [];
        }
        session.aiSuggestions.push(suggestion);
        session.updatedAt = new Date();
        this.sessions.set(sessionId, session);
        return session;
      }
    } catch (error) {
      logger.error('Add suggestion error:', error);
      const session = this.sessions.get(sessionId);
      if (session) {
        if (!session.aiSuggestions) {
          session.aiSuggestions = [];
        }
        session.aiSuggestions.push(suggestion);
        session.updatedAt = new Date();
        this.sessions.set(sessionId, session);
      }
      return session;
    }
  }

  getSessionCount() {
    return this.sessions.size;
  }

  clearOldSessions() {
    // Clean up sessions older than 1 hour in demo mode
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    let cleaned = 0;
    
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.updatedAt < oneHourAgo) {
        this.sessions.delete(sessionId);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      logger.info(`Cleaned up ${cleaned} old sessions`);
    }
  }
}

module.exports = new SessionService();
