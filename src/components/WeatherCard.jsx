import React from 'react'
import { codeToEmoji, codeToText } from '../utils/weatherCodes.js'

function Stat({ label, value, suffix }) {
  return (
    <div className="flex flex-col">
      <div className="text-sm text-slate-400">{label}</div>
      <div className="text-lg md:text-xl text-slate-100 font-semibold">
        {value}{suffix ?? ""}
      </div>
    </div>
  )
}

export default function WeatherCard({ place, weather, unit }) {
  if (!weather || !place) return null

  const { current, timezone } = weather
  const code = current?.weather_code
  const temp = Math.round(current?.temperature_2m ?? 0)
  const app = Math.round(current?.apparent_temperature ?? temp)
  const wind = Math.round(current?.wind_speed_10m ?? 0)
  const isDay = current?.is_day === 1
  const localTime = current?.time

  return (
    <div className="card p-6 md:p-10 w-full max-w-2xl mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-slate-400 text-sm">Current weather in</div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-100">
            {place.name}{place.admin1 ? `, ${place.admin1}` : ""}{place.country ? `, ${place.country}` : ""}
          </h2>
          <div className="text-slate-400 mt-1 text-sm">{timezone} · {localTime}</div>
        </div>
        <div className="text-5xl md:text-6xl">{codeToEmoji(code)}</div>
      </div>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Condition" value={codeToText(code)} />
        <Stat label="Temperature" value={temp} suffix={`°${unit === 'fahrenheit' ? 'F' : 'C'}`} />
        <Stat label="Feels like" value={app} suffix={`°${unit === 'fahrenheit' ? 'F' : 'C'}`} />
        <Stat label="Wind" value={wind} suffix={unit === 'mph' ? " mph" : " km/h"} />
      </div>

      <div className="mt-6 text-xs text-slate-400">
        Data by Open‑Meteo · Free and no API key
      </div>
    </div>
  )
}
