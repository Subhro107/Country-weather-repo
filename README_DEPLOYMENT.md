# Deploying the Weather App to Vercel

This guide will walk you through deploying the Weather App to Vercel while ensuring your API keys are properly secured.

## Prerequisites

1. A Vercel account (Sign up at [vercel.com](https://vercel.com) if you don't have one)
2. Your OpenWeatherMap API key (Get one at [openweathermap.org](https://openweathermap.org/api) if needed)
3. Git installed on your computer
4. A GitHub account (for pushing your code to a repository)

## Step 1: Prepare Your Project for GitHub

1. Create a `.gitignore` file in your project root (if not already present):

```
# Ignore local configuration files with API keys
config.js
.env
.env.local
node_modules/
.vercel
```

2. Make sure your local `config.js` file is not pushed to GitHub, as it contains your API keys.

## Step 2: Push Your Code to GitHub

1. Create a new GitHub repository
2. Initialize your local repository and push your code:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/your-repo-name.git
git push -u origin main
```

## Step 3: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and log in
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. In the project configuration screen:
   - Framework Preset: Choose "Other"
   - Build and Output Settings: Leave as default
   - Root Directory: Leave as default (usually `/`)

5. **Important**: Add your Environment Variable
   - Click "Environment Variables"
   - Add the following:
     - Name: `OPENWEATHER_API_KEY`
     - Value: Your OpenWeatherMap API key
     - Environments: Choose all (Production, Preview, Development)

6. Click "Deploy"

## Step 4: Verify Your Deployment

1. Once deployment is complete, Vercel will provide you with a URL (usually `your-project-name.vercel.app`)
2. Visit the URL to make sure your app is working correctly
3. Test the weather search and geolocation features to ensure the API calls are working

## Troubleshooting

If your API calls aren't working after deployment, check the following:

1. **Environment Variables**: Make sure you've added the `OPENWEATHER_API_KEY` environment variable in the Vercel dashboard.

2. **API Routes**: Verify that your API routes in the `/api` folder are correctly accessing the environment variables.

3. **CORS Issues**: If you're getting CORS errors, check that your API routes are setting the appropriate CORS headers.

4. **Logs**: Check the Function Logs in the Vercel dashboard for any errors.

## Additional Information

- **Local Development with Vercel**: You can use the Vercel CLI to test your functions locally:
  ```bash
  npm i -g vercel
  vercel dev
  ```

- **Updating Your Deployment**: Any changes pushed to your GitHub repository will trigger an automatic redeployment on Vercel.

- **Custom Domains**: You can add a custom domain to your project in the Vercel dashboard under Project Settings → Domains.
