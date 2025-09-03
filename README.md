this website gives you the country details and their capital's current weather update. also has a option to autometically detect your locaion and give output based on it.

## Features
- Search for countries and view their details
- Get current weather for capital cities
- Auto-detect location using geolocation (requires HTTPS)

## Setup

### TO RUN LOCALLY:
1. Clone the repository or download the source code
2. Create a config.js file in the project root
    Create a new file named config.js with the following content:
      ```javascript
      window.CONFIG = {
        OPENWEATHER_API_KEY: "YOUR_API_KEY_HERE"
      };
      ```
3. Get an API Key from OpenWeatherMap
   - Go to [OpenWeatherMap](https://openweathermap.org/)
   - Sign up for a free account
   - Navigate to your API keys section
   - Generate a new API key (it may take a few hours to activate)
   - Replace `YOUR_API_KEY_HERE` in the config.js file with your actual API key
4. Open the application
   - Open `index.html` in a browser
   - For geolocation to work locally, use a local server (e.g., `python -m http.server` or VS Code Live Server)

### DEPLOYMENT:
1. Follow steps 1-3 above to set up the API key
2. Deploy to GitHub Pages or any HTTPS-enabled hosting service
3. **Important**: Geolocation requires HTTPS. Make sure your deployment uses HTTPS.
4. If geolocation doesn't work, check:
   - Your API key is valid and activated
   - The site is served over HTTPS
   - User has granted location permissions in the browser
   - API rate limits haven't been exceeded
   - Check browser console for detailed error messages
   - Try refreshing the page and allowing location access when prompted
