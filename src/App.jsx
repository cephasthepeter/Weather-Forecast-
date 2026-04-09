import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

function App() {
  const [weather, setWeather] = useState(null)
  const [forecast, setForecast] = useState([])
  const [city, setCity] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [worldWeather, setWorldWeather] = useState([])
  const [apiKeyValid, setApiKeyValid] = useState(true)

  const API_KEY = 'bff7039544277672814ba96ad948427c'

  // Popular cities around the world
  const worldCities = [
    { name: 'New York', country: 'US' },
    { name: 'London', country: 'GB' },
    { name: 'Tokyo', country: 'JP' },
    { name: 'Paris', country: 'FR' },
    { name: 'Dubai', country: 'AE' },
    { name: 'Sydney', country: 'AU' },
    { name: 'Mumbai', country: 'IN' },
    { name: 'Lagos', country: 'NG' },
    { name: 'São Paulo', country: 'BR' },
    { name: 'Moscow', country: 'RU' },
    { name: 'Singapore', country: 'SG' },
    { name: 'Toronto', country: 'CA' }
  ]

  const getBackground = (condition) => {
    if (!condition) return 'from-blue-400 via-purple-500 to-blue-600'
    const cond = condition.toLowerCase()
    if (cond.includes('clear')) return 'from-yellow-400 via-orange-500 to-red-500'
    if (cond.includes('cloud')) return 'from-gray-400 via-gray-500 to-gray-600'
    if (cond.includes('rain')) return 'from-blue-600 via-blue-700 to-blue-800'
    if (cond.includes('snow')) return 'from-white via-gray-200 to-gray-300'
    return 'from-blue-400 via-purple-500 to-blue-600'
  }

  const fetchWeather = async (lat, lon, cityName) => {
    setLoading(true)
    setError(null)
    try {
      let url
      if (lat && lon) {
        url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      } else {
        url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`
      }
      const response = await fetch(url)
      
      if (!response.ok) {
        if (response.status === 401) {
          setApiKeyValid(false)
          throw new Error('Invalid API Key. Please get a new API key from openweathermap.org and wait for it to activate (can take up to 2 hours)')
        } else if (response.status === 404) {
          throw new Error('City not found. Please check the city name and try again.')
        } else {
          throw new Error(`Error: ${response.status} - ${response.statusText}`)
        }
      }
      
      const data = await response.json()
      setWeather(data)
      setApiKeyValid(true)

      // Fetch forecast
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${data.coord.lat}&lon=${data.coord.lon}&appid=${API_KEY}&units=metric`
      const forecastResponse = await fetch(forecastUrl)
      
      if (!forecastResponse.ok) {
        console.warn('Failed to fetch forecast data')
        setForecast([])
        return
      }
      
      const forecastData = await forecastResponse.json()
      setForecast(forecastData.list.slice(0, 40))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchWorldWeather = async () => {
    if (!apiKeyValid) return
    
    try {
      const promises = worldCities.map(async (city) => {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city.name},${city.country}&appid=${API_KEY}&units=metric`
        const response = await fetch(url)
        if (response.ok) {
          const data = await response.json()
          return data
        } else if (response.status === 401) {
          setApiKeyValid(false)
        }
        return null
      })
      const results = await Promise.all(promises)
      const validResults = results.filter(r => r !== null)
      if (validResults.length > 0) {
        setWorldWeather(validResults)
      }
    } catch (err) {
      console.error('Failed to fetch world weather:', err)
    }
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          fetchWeather(latitude, longitude)
        },
        (err) => {
          setError('Location access denied')
        }
      )
    } else {
      setError('Geolocation not supported')
    }
  }

  useEffect(() => {
    fetchWorldWeather()
    // Refresh world weather every 10 minutes
    const interval = setInterval(fetchWorldWeather, 600000)
    return () => clearInterval(interval)
  }, [apiKeyValid])

  const handleSearch = (e) => {
    e.preventDefault()
    if (city.trim()) {
      fetchWeather(null, null, city)
    }
  }

  const getDayName = (timestamp) => {
    const date = new Date(timestamp * 1000)
    return date.toLocaleDateString('en-US', { weekday: 'short' })
  }

  const getHour = (timestamp) => {
    const date = new Date(timestamp * 1000)
    return date.getHours()
  }

  const dailyForecast = forecast.reduce((acc, item) => {
    const date = new Date(item.dt * 1000).toDateString()
    if (!acc[date]) acc[date] = []
    acc[date].push(item)
    return acc
  }, {})

  const dailySummary = Object.entries(dailyForecast).slice(0, 5).map(([date, items]) => {
    const temps = items.map(i => i.main.temp)
    const minTemp = Math.min(...temps)
    const maxTemp = Math.max(...temps)
    const condition = items[0].weather[0].description
    return { date, minTemp, maxTemp, condition, icon: items[0].weather[0].icon }
  })

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getBackground(weather?.weather[0]?.main)} transition-all duration-1000 p-4 relative overflow-hidden`}>
      {/* World Weather Background Cards */}
      {worldWeather.length > 0 && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 opacity-20">
            {worldWeather.map((cityWeather, index) => (
              <motion.div
                key={cityWeather.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.3, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20"
              >
                <p className="text-white font-semibold text-sm">{cityWeather.name}</p>
                <div className="flex items-center justify-between">
                  <p className="text-white text-2xl font-bold">{Math.round(cityWeather.main.temp)}°C</p>
                  <img 
                    src={`http://openweathermap.org/img/wn/${cityWeather.weather[0].icon}.png`} 
                    alt={cityWeather.weather[0].description}
                    className="w-12 h-12"
                  />
                </div>
                <p className="text-white text-xs capitalize">{cityWeather.weather[0].description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center">
        {/* API Key Warning */}
        {!apiKeyValid && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-500/90 backdrop-blur-sm text-white px-6 py-4 rounded-2xl shadow-xl mb-4 max-w-2xl text-center"
          >
            <p className="font-bold text-lg mb-2">⚠️ API Key Issue</p>
            <p className="text-sm">
              Your API key is invalid or not activated yet. New API keys can take up to 2 hours to activate.
              <br />
              Get a free API key from <a href="https://openweathermap.org/api" target="_blank" rel="noopener noreferrer" className="underline font-bold">openweathermap.org</a>
            </p>
          </motion.div>
        )}

        {/* Centered Search Section */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl mb-8"
        >
          <h1 className="text-5xl md:text-7xl font-bold text-center mb-8 text-white drop-shadow-2xl">
            Weather Forecast
          </h1>
          
          <form onSubmit={handleSearch} className="mb-4">
            <div className="flex gap-2 flex-wrap justify-center">
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Search for any city..."
                className="flex-1 min-w-[250px] px-6 py-4 rounded-full bg-white/90 backdrop-blur-sm border-2 border-white/50 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/50 text-lg shadow-xl"
              />
              <button 
                type="submit" 
                className="px-8 py-4 bg-white/90 backdrop-blur-sm rounded-full border-2 border-white/50 hover:bg-white transition-all shadow-xl font-semibold text-gray-800 hover:scale-105"
              >
                Search
              </button>
              <button 
                type="button" 
                onClick={getCurrentLocation} 
                className="px-6 py-4 bg-white/90 backdrop-blur-sm rounded-full border-2 border-white/50 hover:bg-white transition-all shadow-xl text-2xl hover:scale-105"
                title="Use my location"
              >
                📍
              </button>
            </div>
          </form>

          {loading && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-white text-xl font-semibold drop-shadow-lg"
            >
              Loading...
            </motion.p>
          )}
          
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-500/90 backdrop-blur-sm text-white px-6 py-4 rounded-2xl text-center shadow-xl"
            >
              {error}
            </motion.div>
          )}
        </motion.div>

        {/* Weather Details */}
        {weather && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/20 backdrop-blur-lg rounded-3xl p-8 shadow-2xl text-white max-w-5xl w-full"
          >
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold mb-2">{weather.name}, {weather.sys.country}</h2>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <img 
                  src={`http://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`} 
                  alt={weather.weather[0].description}
                  className="w-32 h-32"
                />
                <div>
                  <p className="text-7xl font-bold">{Math.round(weather.main.temp)}°C</p>
                  <p className="text-2xl capitalize">{weather.weather[0].description}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white/20 rounded-2xl p-4 text-center">
                <p className="text-sm opacity-80">Feels Like</p>
                <p className="text-3xl font-bold">{Math.round(weather.main.feels_like)}°C</p>
              </div>
              <div className="bg-white/20 rounded-2xl p-4 text-center">
                <p className="text-sm opacity-80">Humidity</p>
                <p className="text-3xl font-bold">{weather.main.humidity}%</p>
              </div>
              <div className="bg-white/20 rounded-2xl p-4 text-center">
                <p className="text-sm opacity-80">Wind Speed</p>
                <p className="text-3xl font-bold">{weather.wind.speed} m/s</p>
              </div>
              <div className="bg-white/20 rounded-2xl p-4 text-center">
                <p className="text-sm opacity-80">Pressure</p>
                <p className="text-3xl font-bold">{weather.main.pressure} hPa</p>
              </div>
            </div>

            {dailySummary.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mb-8"
              >
                <h3 className="text-2xl font-semibold mb-4">5-Day Forecast</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {dailySummary.map((day, index) => (
                    <div key={index} className="bg-white/20 rounded-2xl p-4 text-center hover:bg-white/30 transition-all">
                      <p className="font-semibold text-lg">{getDayName(new Date(day.date).getTime() / 1000)}</p>
                      <img 
                        src={`http://openweathermap.org/img/wn/${day.icon}@2x.png`} 
                        alt={day.condition} 
                        className="mx-auto w-16 h-16"
                      />
                      <p className="text-sm capitalize">{day.condition}</p>
                      <p className="text-xl font-bold">{Math.round(day.minTemp)}° / {Math.round(day.maxTemp)}°</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {forecast.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <h3 className="text-2xl font-semibold mb-4">Hourly Forecast</h3>
                <div className="flex overflow-x-auto space-x-4 pb-4 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-white/10">
                  {forecast.slice(0, 24).map((hour, index) => (
                    <div key={index} className="bg-white/20 rounded-2xl p-4 text-center min-w-[120px] hover:bg-white/30 transition-all">
                      <p className="text-sm font-semibold">{getHour(hour.dt)}:00</p>
                      <img 
                        src={`http://openweathermap.org/img/wn/${hour.weather[0].icon}@2x.png`} 
                        alt={hour.weather[0].description}
                        className="mx-auto w-12 h-12"
                      />
                      <p className="text-xs capitalize">{hour.weather[0].description}</p>
                      <p className="font-bold text-xl">{Math.round(hour.main.temp)}°</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default App
