this website gives you the country details and their capital's current weather update. also has a option to autometically detect your locaion and give output based on it.
TO RUN LOCALLY:-
1. Clone the repository or download the source code
2. Create a config.js file in the project root
    Create a new file named config.js with the following content:
      // config.js
      window.CONFIG = {
        OPENWEATHER_API_KEY: "YOUR_API_KEY_HERE"
        };
3. Get an API Key from OpenWeatherMap
   Go to OpenWeatherMap
    Sign up for a free account
      Navigate to your API keys section
        Generate a new API key (it may take a few hours to activate)
          Replace YOUR_API_KEY_HERE in the config.js file with your actual API key
4. Open the application
    Open index.html, use a local server
