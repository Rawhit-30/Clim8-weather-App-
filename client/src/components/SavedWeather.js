import React, { useState, useEffect } from 'react';
import axios from 'axios';

const apikey = "feff206daa60b539abe8fae8f2ab7f29"; // Same API key from App.js

const SavedWeather = ({ goToHome }) => {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [savedWeather, setSavedWeather] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchSavedWeatherData();
  }, []);

  // Fetch saved weather data
  const fetchSavedWeatherData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/weather');
      const saved = response.data.filter((weather) => weather.isSaved === true);
      setSavedWeather(saved);
    } catch (err) {
      console.error('Error fetching saved weather:', err);
      setErrorMessage('Error fetching saved weather data.');
    }
  };

  // Fetch weather for the entered city
  const handleSearch = async () => {
    if (!city) return;

    setLoading(true);
    setError('');
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apikey}`;
      const response = await axios.get(url);
      setWeatherData(response.data);
    } catch (err) {
      setError('Could not fetch weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Save weather data to the backend
  const saveWeatherData = async () => {
    if (!weatherData) return;

    try {
      const { name, sys, main, weather } = weatherData;
      const timestamp = new Date().toLocaleString();

      // Save the weather data to the backend with the timestamp
      const response = await axios.post('http://localhost:5000/api/weather', {
        city: name,
        country: sys.country,
        temperature: Math.floor(main.temp - 273), // Convert Kelvin to Celsius
        description: weather[0].description,
        icon: weather[0].icon,
        timestamp,
      });

      const weatherDataId = response.data.weatherData._id;

      // Now toggle the 'isSaved' flag to true after saving the weather
      await axios.patch(`http://localhost:5000/api/weather/${weatherDataId}/save`);

      setSuccessMessage('Location saved successfully!');
      setErrorMessage('');
      fetchSavedWeatherData(); // Refresh the saved weather data
      setCity('');
      setWeatherData(null);
    } catch (error) {
      console.error('Error saving weather data:', error);
      setErrorMessage('Error saving the location. Please try again.');
      setSuccessMessage('');
    }
  };

  // Delete saved weather location
  const deleteWeatherData = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/weather/${id}`);
      setSuccessMessage('Location deleted successfully!');
      setErrorMessage('');
      fetchSavedWeatherData();
    } catch (error) {
      console.error('Error deleting weather data:', error);
      setErrorMessage('Error deleting the location. Please try again.');
      setSuccessMessage('');
    }
  };

  // Refresh weather for a saved location
  const refreshWeather = async (city) => {
    setLoading(true);
    setError('');
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apikey}`;
      const response = await axios.get(url);
      setWeatherData(response.data);
      setSuccessMessage(`Weather for ${city} refreshed successfully!`);
    } catch (err) {
      setError('Could not refresh weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="save-weather">
      <h3>Save Location Weather</h3>

      {/* Search Section */}
      <div className="search-section">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city name"
          className="city-input"
        />
        <button onClick={handleSearch} disabled={loading} className="search-button">
          {loading ? 'Loading...' : 'Search Weather'}
        </button>
        {error && <p className="error">{error}</p>}
      </div>

      {/* Display Weather Data */}
      {weatherData && (
        <div className="weather-info">
          <h4>{weatherData.name}, {weatherData.sys.country}</h4>
          <p>{Math.floor(weatherData.main.temp - 273)}°C</p>
          <p>{weatherData.weather[0].description}</p>
          <img
            src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
            alt={weatherData.weather[0].description}
          />
          <button onClick={saveWeatherData} className="store-button">Store Location</button>
        </div>
      )}

      {/* Success or error message */}
      {successMessage && <p className="success">{successMessage}</p>}
      {errorMessage && <p className="error">{errorMessage}</p>}

      {/* Display Saved Weather */}
      {savedWeather.length > 0 ? (
        <div className="saved-weather">
          <h3>Saved Locations</h3>
          <div className="weather-grid">
            {savedWeather.map((weather) => (
              <div key={weather._id} className="weather-card">
                <h4>{weather.city}, {weather.country}</h4>
                <p>{weather.temperature}°C</p>
                <p>{weather.description}</p>
                <p><strong>Saved on:</strong> {new Date(weather.timestamp).toLocaleString()}</p>
                <img
                  src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                  alt={weather.description}
                />
                <button onClick={() => deleteWeatherData(weather._id)} className="delete-button">Delete Location</button>
                <button onClick={() => refreshWeather(weather.city)} className="refresh-button">Refresh Weather</button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p>No saved weather locations yet. Save your location first!</p>
      )}

      {/* Link back to main App */}
      <button onClick={goToHome} className="back-button">Back to Main</button>
    </div>
  );
};

export default SavedWeather;
