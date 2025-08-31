# Weather Now (React + Vite + Tailwind)

A minimal, elegant weather app for *Jamie* (Outdoor Enthusiast) that shows **current conditions** for any city using the **Open‑Meteo** public API (no API key).

## ✨ Features

- 🔎 City search with live suggestions (Open‑Meteo Geocoding API)
- 📍 "Use my location" (HTML Geolocation + reverse geocode)
- 🌡️ Current temperature, feels-like, wind, condition & emoji
- 🔁 Unit toggles (°C/°F, km/h/mph) with local persistence
- 💾 Remembers your last city
- 📱 Responsive UI, keyboard-friendly, accessibly labeled
- 🧰 Clean React hooks + Tailwind; no extra libraries

## 🧪 APIs

- Geocoding: `https://geocoding-api.open-meteo.com/v1/search?name={city}`
- Reverse geocoding: `https://geocoding-api.open-meteo.com/v1/reverse?latitude={lat}&longitude={lon}`
- Weather: `https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,apparent_temperature,is_day,wind_speed_10m,weather_code`

## 🚀 Run locally (VS Code)

1. **Download** this project and unzip it.
2. In VS Code, open the folder. Make sure you have **Node.js 18+**.
3. Install deps:
   ```bash
   npm install
   ```
4. Start dev server:
   ```bash
   npm run dev
   ```
   Vite will print a local URL (usually http://localhost:5173). Open it in your browser.
5. Build for production (optional):
   ```bash
   npm run build
   npm run preview
   ```

## 🌍 Deploy free

- **CodeSandbox / StackBlitz**: Import this folder directly; it will auto-detect Vite + React.
- **Netlify**: Build command `npm run build`, publish directory `dist`.
- **Vercel**: Just import; it detects Vite.

## 🧱 Project structure

```
weather-now/
├─ index.html
├─ package.json
├─ postcss.config.js
├─ tailwind.config.js
├─ vite.config.js
├─ src/
│  ├─ App.jsx
│  ├─ main.jsx
│  ├─ index.css
│  ├─ components/
│  │  ├─ SearchBar.jsx
│  │  └─ WeatherCard.jsx
│  └─ utils/
│     └─ weatherCodes.js
└─ README.md
```

## 📝 Notes

- This app focuses on **current conditions** as required. You can extend it with hourly/daily forecasts, charts, and favorites.
- The Open‑Meteo weather-code to text/emoji mapping lives in `src/utils/weatherCodes.js`.
- Geolocation works on **https** (and on `http://localhost`). If denied, you can still search by city.
