# Modern Weather App

A responsive, modern weather application built with React, Tailwind CSS, and OpenWeatherMap API.

## Features

- Real-time weather data display
- Search functionality for any city worldwide
- Current temperature, weather condition, humidity, wind speed, and feels-like temperature
- 5-day forecast with icons and temperature range
- Hourly forecast with scrollable timeline
- Location detection (GPS-based)
- Dynamic background that changes based on weather
- Glassmorphism UI design
- Smooth animations with Framer Motion
- Mobile-first responsive design

## Tech Stack

- **Frontend:** React + Vite
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **API:** OpenWeatherMap API

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Get an API key from [OpenWeatherMap](https://openweathermap.org/api)
4. Replace `YOUR_OPENWEATHERMAP_API_KEY` in `src/App.jsx` with your API key
5. Run the development server:
   ```bash
   npm run dev
   ```
6. Open [http://localhost:5173](http://localhost:5173) in your browser

## Build for Production

```bash
npm run build
```

## Deployment

### Firebase Hosting

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```
2. Login to Firebase:
   ```bash
   firebase login
   ```
3. Initialize Firebase in your project:
   ```bash
   firebase init
   ```

   - Select "Hosting"
   - Choose "dist" as the public directory
   - Configure as single-page app
4. Deploy:
   ```bash
   firebase deploy
   ```

## API Key Setup

⚠️ **IMPORTANT:** The current API key in the code is invalid. You need to get your own API key.

### Steps to Get Your API Key:

1. Go to [OpenWeatherMap](https://openweathermap.org/api)
2. Click "Sign Up" (or "Sign In" if you have an account)
3. After signing up, go to your [API Keys page](https://home.openweathermap.org/api_keys)
4. Copy your API key (it may take a few minutes to activate)
5. Open `src/App.jsx` and replace the API key on line 12:
   ```javascript
   const API_KEY = 'YOUR_NEW_API_KEY_HERE'
   ```

**Note:** 
- New API keys can take up to 2 hours to activate
- The free tier provides 60 calls/minute and 1,000,000 calls/month
- The free tier includes 5-day forecast data

## License

MIT License
# Weather-Forecast-
