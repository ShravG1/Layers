import { useState, useEffect, useCallback } from 'react'

const BASE_URL = 'https://api.open-meteo.com/v1/forecast'
const GEO_URL  = 'https://geocoding-api.open-meteo.com/v1/search'

const HOURLY_VARS  = 'temperature_2m,apparent_temperature,precipitation_probability,weathercode,windspeed_10m,uv_index,relative_humidity_2m'
const CURRENT_VARS = 'temperature_2m,apparent_temperature,precipitation_probability,windspeed_10m,weathercode,uv_index,relative_humidity_2m'
const DAILY_VARS   = 'weathercode,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_probability_max'

const SAVED_KEY = 'wtw_saved_locations'

async function fetchWeather(lat, lon) {
  const url = `${BASE_URL}?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=${HOURLY_VARS}&daily=${DAILY_VARS}&forecast_days=7&timezone=auto&current=${CURRENT_VARS}`
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

function loadSavedLocations() {
  try { return JSON.parse(localStorage.getItem(SAVED_KEY)) ?? [] } catch { return [] }
}
function persistSavedLocations(list) {
  localStorage.setItem(SAVED_KEY, JSON.stringify(list))
}

export function useWeather() {
  const [weather, setWeather]       = useState(null)
  const [hourly, setHourly]         = useState(null)
  const [daily, setDaily]           = useState(null)
  const [location, setLocation]     = useState(null) // { name, lat, lon }
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [geoBlocked, setGeoBlocked] = useState(false)
  const [savedLocations, setSavedLocations] = useState(loadSavedLocations)

  const load = useCallback(async (lat, lon, name = null) => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchWeather(lat, lon)
      const cur = data.current ?? {
        temperature_2m:           data.current_weather?.temperature,
        apparent_temperature:     data.current_weather?.temperature,
        precipitation_probability: 0,
        windspeed_10m:            data.current_weather?.windspeed,
        weathercode:              data.current_weather?.weathercode,
        uv_index:                 null,
        relative_humidity_2m:     null,
      }
      setWeather(cur)
      setHourly(data.hourly)
      setDaily(data.daily)
      setLocation({ lat, lon, name })
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

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

  const searchLocation = useCallback(async (query) => geocodeQuery(query), [])

  const selectLocation = useCallback((result) => {
    const name = result.name + (result.admin1 ? `, ${result.admin1}` : '')
    load(result.latitude, result.longitude, name)
  }, [load])

  const refresh = useCallback(async () => {
    if (location) await load(location.lat, location.lon, location.name)
  }, [location, load])

  const saveCurrentLocation = useCallback(() => {
    if (!location?.name) return
    setSavedLocations(prev => {
      if (prev.find(l => l.name === location.name)) return prev
      const next = [...prev, { name: location.name, lat: location.lat, lon: location.lon }].slice(0, 5)
      persistSavedLocations(next)
      return next
    })
  }, [location])

  const removeSavedLocation = useCallback((name) => {
    setSavedLocations(prev => {
      const next = prev.filter(l => l.name !== name)
      persistSavedLocations(next)
      return next
    })
  }, [])

  const switchToSaved = useCallback((saved) => {
    load(saved.lat, saved.lon, saved.name)
  }, [load])

  return {
    weather, hourly, daily, location, loading, error, geoBlocked,
    searchLocation, selectLocation, refresh,
    savedLocations, saveCurrentLocation, removeSavedLocation, switchToSaved,
  }
}
