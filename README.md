# 🌍 Country + Capital Weather App

A beautiful, responsive web application that displays country infor## � Acknowledgments

- Weather data provided by [OpenWeatherMap](https://openweathermap.org/)
- Country data provided by [REST Countries](https://restcountries.com/)
- Deployment architecture by [Vercel](https://vercel.com/)

---

⭐ **Star this repo if you found it useful!** ⭐current weather data for capital cities using secure server-side API calls.

![Weather App](https://img.shields.io/badge/Weather-App-blue) ![Secure API](https://img.shields.io/badge/Secure-API-green) ![Vercel Ready](https://img.shields.io/badge/Vercel-Ready-brightgreen)

## ✨ Features

- **🏳️ Country Information**: Flag, name, capital, population, and region
- **🌤️ Capital Weather**: Temperature, feels like, wind speed, humidity, and conditions  
- **🎨 Dynamic Backgrounds**: Background changes based on weather conditions
- **📍 Geolocation**: Find weather based on your current location
- **🌙 Dark/Light Mode**: Toggle between dark and light themes
- **📱 Responsive Design**: Works on all devices (mobile, tablet, desktop)
- **❌ Error Handling**: User-friendly error messages
- **� Secure API**: Server-side API calls to protect your API keys

## 🚀 Deployment Options

### Deploy to Vercel (Recommended)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/your-repo-name&env=OPENWEATHER_API_KEY)

**Important:** You will need to provide your OpenWeatherMap API key during deployment.

### Additional Deployment Guides
- For complete Vercel deployment instructions, see [README_DEPLOYMENT.md](./README_DEPLOYMENT.md)
- For local development with environment variables, see [LOCAL_DEVELOPMENT.md](./LOCAL_DEVELOPMENT.md)

## �️ Local Development

```bash
# Clone the repository
git clone https://github.com/yourusername/your-repo-name.git
cd your-repo-name

# Install dependencies
npm init -y
npm install node-fetch dotenv

# Create a .env file with your API key
echo "OPENWEATHER_API_KEY=your_api_key_here" > .env

# Install Vercel CLI
npm install -g vercel

# Run the development server
vercel dev
```

For more detailed setup instructions, see [LOCAL_DEVELOPMENT.md](./LOCAL_DEVELOPMENT.md)

## 📱 How to Use

1. **🔍 Search for a Country**
   - Type any country name in the search bar
   - Click "Search" or press Enter
   - View country information and capital city weather

2. **📍 Use Your Location**
   - Click the "📍 Use my location" button
   - Allow location access when prompted
   - The app will detect your country and show its capital's weather

3. **🎨 Switch Themes**
   - Toggle the switch in the upper right corner for dark/light modes

## � APIs Used

- **🏳️ [REST Countries API](https://restcountries.com/)** - Country data (no key needed)
- **�️ [OpenWeatherMap API](https://openweathermap.org/api)** - Weather data and geocoding (API key required)
  - Used securely via serverless functions

## 🛠️ Technologies

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: CSS Custom Properties, Glass morphism design
- **APIs**: REST Countries, OpenWeatherMap
- **Deployment**: Vercel with serverless functions
- **Security**: Server-side API calls with environment variables

## 🔐 API Security

This project demonstrates a secure way to use API keys in frontend applications:

1. **Server-side API Calls**: All calls to APIs requiring authentication are made from secure serverless functions
2. **Environment Variables**: API keys are stored as environment variables, never exposed in client-side code
3. **API Route Proxying**: Frontend calls secure API routes which proxy requests to the weather service

This approach:
- **🛡️ Protects your API keys** from being exposed in client-side code
- **💰 Prevents unauthorized usage** of your API quota
- **� Simplifies deployment** with Vercel's environment variables system

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## � License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Weather data provided by [Open-Meteo](https://open-meteo.com/)
- Country data provided by [REST Countries](https://restcountries.com/)
- Geocoding by [OpenStreetMap Nominatim](https://nominatim.openstreetmap.org/)

---

⭐ **Star this repo if you found it useful!** ⭐

Made with ❤️ by [Subhro107](https://github.com/Subhro107)
