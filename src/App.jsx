import React, { useEffect, useMemo, useRef, useState } from 'react'
import SearchBar from './components/SearchBar.jsx'
import WeatherCard from './components/WeatherCard.jsx'

const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search"
const METEO_URL = "https://api.open-meteo.com/v1/forecast"

const defaultUnits = () => {
  // read from localStorage if present
  const u = localStorage.getItem('wn:units')
  if (u) {
    try { return JSON.parse(u) } catch {}
  }
  return { temperature: 'celsius', wind: 'kmh' } // 'fahrenheit' / 'mph' supported
}

export default function App() {
  const [query, setQuery] = useState(localStorage.getItem('wn:lastQuery') || 'Bengaluru')
  const [suggestions, setSuggestions] = useState([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)

  const [place, setPlace] = useState(null)
  const [weather, setWeather] = useState(null)
  const [loadingWeather, setLoadingWeather] = useState(false)
  const [error, setError] = useState(null)

  const [units, setUnits] = useState(defaultUnits())
  useEffect(() => {
    localStorage.setItem('wn:units', JSON.stringify(units))
  }, [units])

  // Debounced search for suggestions
  const debounceRef = useRef(0)
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSuggestions([])
      return
    }
    localStorage.setItem('wn:lastQuery', query)
    setLoadingSuggestions(true)
    const controller = new AbortController()

    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          name: query.trim(),
          count: '5',
          language: 'en',
          format: 'json'
        })
        const res = await fetch(`${GEO_URL}?${params.toString()}`, { signal: controller.signal })
        if (!res.ok) throw new Error('Failed to fetch places')
        const data = await res.json()
        setSuggestions(data.results ?? [])
      } catch (e) {
        if (e.name !== 'AbortError') {
          console.error(e)
        }
      } finally {
        setLoadingSuggestions(false)
      }
    }, 450)

    return () => {
      controller.abort()
      clearTimeout(debounceRef.current)
    }
  }, [query])

  async function fetchWeatherFor(lat, lon, tz) {
    setLoadingWeather(true)
    setError(null)
    setWeather(null)
    try {
      const params = new URLSearchParams({
        latitude: String(lat),
        longitude: String(lon),
        timezone: tz || 'auto',
        current: 'temperature_2m,apparent_temperature,is_day,wind_speed_10m,weather_code',
        wind_speed_unit: units.wind === 'mph' ? 'mph' : 'kmh',
        temperature_unit: units.temperature === 'fahrenheit' ? 'fahrenheit' : 'celsius',
      })
      const res = await fetch(`${METEO_URL}?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch weather')
      const data = await res.json()
      setWeather(data)
    } catch (e) {
      console.error(e)
      setError(e.message || 'Something went wrong')
    } finally {
      setLoadingWeather(false)
    }
  }

  function onPickSuggestion(s) {
    setPlace(s)
    setSuggestions([])
    fetchWeatherFor(s.latitude, s.longitude, s.timezone)
  }

  async function onSubmit(e) {
    e?.preventDefault()
    // If user typed and didn't pick a suggestion, take first result
    if (suggestions.length > 0) {
      onPickSuggestion(suggestions[0])
      return
    }
    // else do an immediate geocode fetch
    try {
      setLoadingSuggestions(true)
      const params = new URLSearchParams({
        name: query.trim(),
        count: '1',
        language: 'en',
        format: 'json'
      })
      const res = await fetch(`${GEO_URL}?${params.toString()}`)
      const data = await res.json()
      if (!data.results || data.results.length === 0) {
        setError('No matching city found. Try a different name.')
        return
      }
      onPickSuggestion(data.results[0])
    } catch (e) {
      console.error(e)
      setError('Could not search for that city right now.')
    } finally {
      setLoadingSuggestions(false)
    }
  }

  function onUseMyLocation() {
    if (!('geolocation' in navigator)) {
      setError('Geolocation not supported by your browser.')
      return
    }
    setError(null)
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords
      // Reverse geocode to get a nice name
      try {
        const params = new URLSearchParams({
          latitude: String(latitude),
          longitude: String(longitude),
          language: 'en',
          format: 'json'
        })
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/reverse?${params.toString()}`)
        const data = await res.json()
        const s = data?.results?.[0] ?? {
          name: 'Your Location',
          country: '',
          admin1: '',
          latitude, longitude, timezone: 'auto'
        }
        setPlace(s)
        await fetchWeatherFor(latitude, longitude, s.timezone)
      } catch (e) {
        console.error(e)
        setPlace({ name: 'Your Location', latitude, longitude, timezone: 'auto' })
        await fetchWeatherFor(latitude, longitude, 'auto')
      }
    }, (err) => {
      setError('Could not get your location. Please allow permission and try again.')
      console.error(err)
    }, { enableHighAccuracy: true, timeout: 10000 })
  }

  // Initial load (persist last place)
  useEffect(() => {
    const saved = localStorage.getItem('wn:lastPlace')
    if (saved) {
      try {
        const p = JSON.parse(saved)
        setPlace(p)
        fetchWeatherFor(p.latitude, p.longitude, p.timezone)
        return
      } catch {}
    }
    // else trigger a default search
    onSubmit()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Persist place
  useEffect(() => {
    if (place) localStorage.setItem('wn:lastPlace', JSON.stringify(place))
  }, [place])

  const unitLabel = useMemo(() => ({
    temp: units.temperature === 'fahrenheit' ? '°F' : '°C',
    wind: units.wind === 'mph' ? 'mph' : 'km/h'
  }), [units])

  return (
    <div className="min-h-screen bg-grid">
      <header className="py-10">
        <div className="max-w-2xl mx-auto px-4">
          <h1 className="text-center text-3xl md:text-4xl font-extrabold text-slate-100 tracking-tight">
            Weather <span className="text-sky-400">Now</span>
          </h1>
          <p className="text-center text-slate-400 mt-2">
            Quick current conditions for any city. Powered by Open‑Meteo.
          </p>
        </div>
      </header>

      <main className="px-4 pb-16">
        <SearchBar
          query={query}
          onChange={setQuery}
          onSubmit={onSubmit}
          onUseMyLocation={onUseMyLocation}
          suggestions={suggestions}
          loadingSuggestions={loadingSuggestions}
          onPickSuggestion={onPickSuggestion}
        />

        <div className="w-full max-w-2xl mx-auto mt-4 flex items-center justify-between gap-3">
          <div className="card px-3 py-2 flex items-center gap-3">
            <span className="text-slate-300 text-sm">Units:</span>
            <button
              className={"badge " + (units.temperature === 'celsius' ? "border-sky-500 text-sky-300" : "")}
              onClick={() => setUnits(u => ({ ...u, temperature: 'celsius' }))}
            >°C</button>
            <button
              className={"badge " + (units.temperature === 'fahrenheit' ? "border-sky-500 text-sky-300" : "")}
              onClick={() => setUnits(u => ({ ...u, temperature: 'fahrenheit' }))}
            >°F</button>
            <div className="w-px h-5 bg-white/10" />
            <button
              className={"badge " + (units.wind === 'kmh' ? "border-sky-500 text-sky-300" : "")}
              onClick={() => setUnits(u => ({ ...u, wind: 'kmh' }))}
            >km/h</button>
            <button
              className={"badge " + (units.wind === 'mph' ? "border-sky-500 text-sky-300" : "")}
              onClick={() => setUnits(u => ({ ...u, wind: 'mph' }))}
            >mph</button>
          </div>

          <div className="text-xs text-slate-400 hidden sm:block">
            {place ? `${place.latitude.toFixed(2)}, ${place.longitude.toFixed(2)}` : ""}
          </div>
        </div>

        {error && (
          <div className="w-full max-w-2xl mx-auto mt-4 card p-4 text-red-300 text-sm">
            {error}
          </div>
        )}

        {loadingWeather && (
          <div className="w-full max-w-2xl mx-auto mt-6 card p-6 text-slate-300">
            Loading current weather…
          </div>
        )}

        {(!loadingWeather && weather && place) && (
          <WeatherCard place={place} weather={weather} unit={units.temperature} />
        )}
      </main>

      <footer className="py-10 text-center text-xs text-slate-500">
        Built with React + Tailwind · Deployed anywhere · © {new Date().getFullYear()}
      </footer>
    </div>
  )
}
