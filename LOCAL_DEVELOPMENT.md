# Local Development with Environment Variables

This guide will help you set up local environment variables for testing the Weather App before deploying to Vercel.

## Option 1: Using a .env File (Recommended)

1. Create a `.env` file in your project root:

```
OPENWEATHER_API_KEY=your_api_key_here
```

2. Install the dotenv package to load environment variables locally:

```bash
npm init -y
npm install dotenv
```

3. Modify your API handler files to use dotenv. 

In `/api/weather.js` and `/api/geocode.js`, add at the top:

```javascript
// Only use dotenv in development
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
```

4. Run the project using Vercel CLI:

```bash
npm install -g vercel
vercel dev
```

## Option 2: Using the Vercel CLI with Environment Variables

1. Install the Vercel CLI:

```bash
npm install -g vercel
```

2. Link your project to your Vercel account:

```bash
vercel login
vercel link
```

3. Create a `.vercel/.env.local` file (this file will be automatically ignored by git):

```
OPENWEATHER_API_KEY=your_api_key_here
```

4. Run the development server:

```bash
vercel dev
```

## Option 3: Simple Test Server (Quick Setup)

For quick testing without Vercel CLI, you can create a simple test server:

1. Create a `server.js` file:

```javascript
const express = require('express');
const app = express();
const path = require('path');
const weatherHandler = require('./api/weather');
const geocodeHandler = require('./api/geocode');

// Set environment variables manually for testing
process.env.OPENWEATHER_API_KEY = 'your_api_key_here';

// Serve static files
app.use(express.static(path.join(__dirname)));

// Create express handlers for our Vercel functions
app.get('/api/weather', (req, res) => weatherHandler(req, res));
app.get('/api/geocode', (req, res) => geocodeHandler(req, res));

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
```

2. Install Express:

```bash
npm init -y
npm install express
```

3. Run the server:

```bash
node server.js
```

4. Visit http://localhost:3000 in your browser

## Important Notes

- Never commit your API keys or .env files to git
- Always use environment variables for sensitive information
- When deploying to Vercel, be sure to add your environment variables in the Vercel dashboard
