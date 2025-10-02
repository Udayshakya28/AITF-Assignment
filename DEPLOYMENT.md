# Deployment Guide - AI Weather Chatbot

This guide provides detailed instructions for deploying the AI Weather Chatbot application.

## 🚀 Quick Deployment with Docker

### Prerequisites
- Docker and Docker Compose installed
- API keys for OpenWeatherMap and OpenAI

### Steps

1. **Clone and Setup**
```bash
git clone <repository-url>
cd ai-weather-chatbot
npm run setup
```

2. **Configure Environment**
```bash
cp env.example .env
# Edit .env with your API keys
```

3. **Deploy with Docker**
```bash
npm run docker:build
npm run docker:up
```

4. **Access the Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- MongoDB: localhost:27017

## 🛠️ Manual Deployment

### Development Environment

1. **Install Dependencies**
```bash
npm run install-all
```

2. **Setup Environment Files**

Backend (`server/.env`):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai-weather-chatbot
OPENWEATHER_API_KEY=your_api_key_here
OPENAI_API_KEY=your_api_key_here
NODE_ENV=development
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=http://localhost:3000
```

Frontend (`client/.env`):
```env
REACT_APP_API_URL=http://localhost:5000/api
```

3. **Start MongoDB**
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:7.0

# Or install MongoDB locally
```

4. **Start the Application**
```bash
npm run dev
```

### Production Deployment

#### Option 1: Traditional Server Deployment

1. **Prepare the Server**
```bash
# Install Node.js, MongoDB, and PM2
npm install -g pm2
```

2. **Build the Application**
```bash
npm run build
```

3. **Configure Production Environment**
```bash
# Set NODE_ENV=production
# Configure production database
# Set secure JWT secrets
```

4. **Start with PM2**
```bash
cd server
pm2 start ecosystem.config.js
```

#### Option 2: Cloud Deployment

**Heroku Deployment:**
1. Create Heroku apps for frontend and backend
2. Configure environment variables
3. Deploy using Git or GitHub integration

**Vercel/Netlify (Frontend) + Railway/Render (Backend):**
1. Deploy frontend to Vercel/Netlify
2. Deploy backend to Railway/Render
3. Configure environment variables
4. Update CORS settings

## 🔧 Configuration

### Required API Keys

1. **OpenWeatherMap API**
   - Sign up at https://openweathermap.org/api
   - Get free API key
   - Add to `OPENWEATHER_API_KEY`

2. **OpenAI API**
   - Sign up at https://platform.openai.com/
   - Create API key
   - Add to `OPENAI_API_KEY`

### Database Configuration

**MongoDB Atlas (Cloud):**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-weather-chatbot
```

**Local MongoDB:**
```env
MONGODB_URI=mongodb://localhost:27017/ai-weather-chatbot
```

### Security Configuration

1. **JWT Secret**
```bash
# Generate secure secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

2. **CORS Configuration**
```env
# Development
CORS_ORIGIN=http://localhost:3000

# Production
CORS_ORIGIN=https://yourdomain.com
```

## 📊 Monitoring and Logging

### Application Logs
```bash
# View Docker logs
npm run docker:logs

# View PM2 logs
pm2 logs

# Log files location
server/logs/combined.log
server/logs/error.log
```

### Health Checks
- Backend: `GET /api/health`
- Frontend: `GET /health`

### Performance Monitoring
- Monitor API response times
- Track database query performance
- Monitor memory and CPU usage

## 🔒 Security Considerations

### Production Checklist
- [ ] Use HTTPS in production
- [ ] Configure secure headers
- [ ] Set up rate limiting
- [ ] Use environment variables for secrets
- [ ] Enable MongoDB authentication
- [ ] Configure firewall rules
- [ ] Regular security updates

### Environment Variables Security
```bash
# Never commit .env files
echo ".env" >> .gitignore
echo "server/.env" >> .gitignore
echo "client/.env" >> .gitignore
```

## 🚨 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
```bash
# Check MongoDB status
docker ps | grep mongo
# Check connection string
```

2. **API Keys Not Working**
```bash
# Verify API keys are set
echo $OPENWEATHER_API_KEY
echo $OPENAI_API_KEY
```

3. **CORS Errors**
```bash
# Check CORS_ORIGIN setting
# Ensure frontend URL matches
```

4. **Voice Input Not Working**
- Ensure HTTPS in production
- Check browser permissions
- Verify microphone access

### Debug Commands
```bash
# Check application status
npm run docker:logs

# Test API endpoints
curl http://localhost:5000/api/health

# Check database connection
docker exec -it ai-weather-chatbot-db mongo
```

## 📈 Scaling

### Horizontal Scaling
- Use load balancer (nginx, HAProxy)
- Deploy multiple backend instances
- Use Redis for session storage

### Database Scaling
- MongoDB replica sets
- Database indexing optimization
- Connection pooling

### CDN and Caching
- Use CDN for static assets
- Implement API response caching
- Browser caching for frontend

## 🔄 Updates and Maintenance

### Regular Maintenance
1. Update dependencies monthly
2. Monitor security vulnerabilities
3. Backup database regularly
4. Monitor application performance

### Update Process
```bash
# Pull latest changes
git pull origin main

# Update dependencies
npm run install-all

# Rebuild and restart
npm run docker:build
npm run docker:up
```

## 📞 Support

For deployment issues:
1. Check the troubleshooting section
2. Review application logs
3. Verify environment configuration
4. Test API endpoints individually

---

**Happy Deploying! 🚀**

