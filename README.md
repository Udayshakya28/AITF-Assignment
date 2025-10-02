# AI Weather Chatbot - AITF Assignment

A comprehensive AI-powered weather chatbot with Japanese voice input and intelligent travel/activity suggestions.

## 🌟 Features

- **Japanese Voice Input**: Full support for Japanese speech recognition using Web Speech API
- **Weather Integration**: Real-time weather data from OpenWeatherMap API
- **AI-Powered Suggestions**: Intelligent recommendations based on weather conditions using OpenAI GPT
- **Multiple Themes**: Travel, Fashion, Sports, Music, Agriculture, and General themes
- **Beautiful UI**: Modern, responsive design with smooth animations
- **Chat History**: Persistent chat sessions with MongoDB
- **Location Services**: GPS location detection and city search
- **Real-time Updates**: Live weather data and AI responses

## 🏗️ Architecture

### Frontend (React)
- **Framework**: React 18 with Hooks
- **Styling**: Tailwind CSS with custom animations
- **UI Components**: Framer Motion for animations, Lucide React for icons
- **Voice Input**: Web Speech API for Japanese speech recognition
- **State Management**: React Context and local state

### Backend (Node.js/Express)
- **Framework**: Express.js with middleware
- **Database**: MongoDB with Mongoose ODM
- **APIs**: OpenWeatherMap for weather, OpenAI for AI responses
- **Security**: Helmet, CORS, Rate limiting
- **Logging**: Winston for structured logging

### Database (MongoDB)
- **Chat Sessions**: Message history and preferences
- **User Data**: Preferences and statistics
- **Weather Cache**: Optimized weather data storage

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- MongoDB (local or cloud)
- OpenWeatherMap API key
- OpenAI API key

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd ai-weather-chatbot
```

2. **Install dependencies**
```bash
npm run install-all
```

3. **Environment Setup**

Backend (`server/.env`):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai-weather-chatbot
OPENWEATHER_API_KEY=your_openweather_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
NODE_ENV=development
JWT_SECRET=your_jwt_secret_here
CORS_ORIGIN=http://localhost:3000
```

Frontend (`client/.env`):
```env
REACT_APP_API_URL=http://localhost:5000/api
```

4. **Start the application**
```bash
npm run dev
```

This will start both the backend server (port 5000) and frontend (port 3000).

## 📱 Usage

### Voice Input
1. Click the microphone button
2. Speak in Japanese
3. The system will transcribe and process your speech
4. AI will respond with weather information and suggestions

### Text Chat
1. Type your message in the chat input
2. Press Enter or click Send
3. Receive AI-powered responses with weather context

### Theme Selection
- Choose from 6 different themes for personalized suggestions
- Each theme provides specialized recommendations based on weather

### Location Services
- Use GPS to get current location weather
- Search and select from popular Japanese cities
- Manual location input supported

## 🛠️ API Endpoints

### Weather API
- `GET /api/weather/current/:city` - Get current weather by city
- `GET /api/weather/current?lat=&lon=` - Get weather by coordinates
- `GET /api/weather/forecast/:city` - Get weather forecast
- `GET /api/weather/geocode/:city` - Geocode city name

### Chat API
- `POST /api/chat/session` - Create new chat session
- `POST /api/chat/message` - Send message to chat
- `GET /api/chat/history/:sessionId` - Get chat history
- `PUT /api/chat/preferences/:sessionId` - Update preferences

### AI API
- `POST /api/ai/suggestions` - Generate AI suggestions
- `POST /api/ai/voice` - Process voice input
- `POST /api/ai/chat` - Generate chat response

## 🎨 UI Components

### Main Components
- **ChatInterface**: Main chat window with message history
- **VoiceInput**: Japanese speech recognition interface
- **WeatherDisplay**: Beautiful weather information display
- **ThemeSelector**: Theme selection with icons and descriptions
- **LocationSelector**: Location search and GPS integration

### Utility Components
- **LoadingSpinner**: Animated loading indicators
- **ErrorBoundary**: Error handling and recovery

## 🌐 Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Environment Variables for Production
- Set `NODE_ENV=production`
- Configure production MongoDB URI
- Set appropriate CORS origins
- Use secure JWT secrets

## 🔧 Configuration

### Weather API
- Uses OpenWeatherMap API for weather data
- Supports multiple languages (Japanese/English)
- Includes current weather and 5-day forecast

### AI Integration
- OpenAI GPT-3.5-turbo for intelligent responses
- Context-aware suggestions based on weather
- Theme-specific recommendation generation

### Voice Recognition
- Web Speech API with Japanese language support
- Real-time transcription and processing
- Error handling for unsupported browsers

## 📊 Features in Detail

### Japanese Voice Input
- Native Japanese speech recognition
- Real-time transcription display
- Voice activity indicators
- Error handling for permissions and network issues

### Weather Integration
- Current weather conditions
- 5-day weather forecast
- Location-based weather data
- Weather icons and descriptions in Japanese

### AI Suggestions
- Context-aware recommendations
- Theme-based suggestion generation
- Confidence scoring for suggestions
- Weather-appropriate activity recommendations

### Chat System
- Persistent chat sessions
- Message history storage
- User preferences tracking
- Real-time message updates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is created for the AITF Assignment and is for educational purposes.

## 🙏 Acknowledgments

- OpenWeatherMap for weather data
- OpenAI for AI capabilities
- Web Speech API for voice recognition
- React and Node.js communities

## 📞 Support

For questions or issues related to this AITF assignment, please refer to the assignment guidelines or contact the instructor.

---

**Made with ❤️ for AITF Assignment 2024 by Utkarsh Shakya**

