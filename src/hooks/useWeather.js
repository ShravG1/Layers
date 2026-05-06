import { useState, useEffect, useCallback } from 'react'

const BASE_URL = 'https://api.open-meteo.com/v1/forecast'
const GEO_URL  = 'https://geocoding-api.open-meteo.com/v1/search'

const HOURLY_VARS = 'temperature_2m,apparent_temperature,precipitation_probability,weathercode,windspeed_10m,uv_index'

async function fetchWeather(lat, lon) {
  const url = `${BASE_URL}?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=${HOURLY_VARS}&forecast_days=2&timezone=auto&current=temperature_2m,apparent_temperature,precipitation_probability,windspeed_10m,weathercode,uv_index`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Weather fetch failed')
  return res.json()
}

async function geocodeQuery(query) {
  const res = await fetch(`${GEO_URL}?name=${encodeURIComponent(query)}&count=5&language=en&format=json`)
  if (!res.ok) throw new Error('Geocoding failed')
  const data = await res.json()
  return data.results ?? []
}

export function useWeather() {
  const [weather, setWeather]       = useState(null)
  const [hourly, setHourly]         = useState(null)
  const [location, setLocation]     = useState(null) // { name, lat, lon }
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [geoBlocked, setGeoBlocked] = useState(false)

  const load = useCallback(async (lat, lon, name = null) => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchWeather(lat, lon)
      // current comes from the 'current' key (v1 API)
      const cur = data.current ?? {
        temperature_2m:           data.current_weather?.temperature,
        apparent_temperature:     data.current_weather?.temperature,
        precipitation_probability: 0,
        windspeed_10m:            data.current_weather?.windspeed,
        weathercode:              data.current_weather?.weathercode,
        uv_index:                 null,
      }
      setWeather(cur)
      setHourly(data.hourly)
      setLocation({ lat, lon, name })
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial: try geolocation
  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoBlocked(true)
      setLoading(false)
      return
    }
    navigator.geolocation.getCurrentPosition(
      pos => load(pos.coords.latitude, pos.coords.longitude),
      () => {
        setGeoBlocked(true)
        setLoading(false)
      },
      { timeout: 8000 }
    )
  }, [load])

  const searchLocation = useCallback(async (query) => {
    const results = await geocodeQuery(query)
    return results
  }, [])

  const selectLocation = useCallback((result) => {
    load(result.latitude, result.longitude, result.name + (result.admin1 ? `, ${result.admin1}` : ''))
  }, [load])

  const refresh = useCallback(() => {
    if (location) load(location.lat, location.lon, location.name)
  }, [location, load])

  return { weather, hourly, location, loading, error, geoBlocked, searchLocation, selectLocation, refresh }
}
