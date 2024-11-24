import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { getWeatherRecommendation } from './components/WeatherRecommendation'; // Import recommendation function
import { speakWeather } from './components/TextToSpeech'; // Import speak function
import SavedWeather from './components/SavedWeather';

const apikey = "feff206daa60b539abe8fae8f2ab7f29";

function App() {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [recommendation, setRecommendation] = useState(''); // For weather recommendation
  const [currentPage, setCurrentPage] = useState('home'); // State to track the current page
  const [successMessage, setSuccessMessage] = useState(''); // Success message for saving weather data
  const [errorMessage, setErrorMessage] = useState(''); // Error message for saving weather data
  const [locationRequested, setLocationRequested] = useState(false); // Track if the location has been requested

  useEffect(() => {
    // Ask for the user's location when the page loads
    if (navigator.geolocation && !locationRequested) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apikey}`;
          fetchWeatherData(url, { latitude, longitude });
          setLocationRequested(true); // Mark that location was successfully fetched
        },
        (error) => {
          console.log("Error getting location", error);
          setLocationRequested(true); // Mark as done even if location request fails
        }
      );
    }
  }, [locationRequested]);

  const fetchWeatherData = async (url, coordinates = null) => {
    try {
      const response = await axios.get(url);
      const data = response.data;
      console.log(data);
      weatherReport(data, coordinates || { latitude: data.coord.lat, longitude: data.coord.lon });
      setWeatherData(data);
      saveWeatherData(data);

      // Generate recommendation based on weather data
      const recommendation = getWeatherRecommendation(data); // This function should generate recommendations based on weather conditions
      setRecommendation(recommendation);

    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };

  const searchByCity = async () => {
    try {
      const cleanCity = city.trim();
      if (!cleanCity) {
        console.log("Please enter a city name.");
        return;
      }

      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cleanCity)}&appid=${apikey}`;
      const response = await axios.get(url);
      const data = response.data;

      if (data.cod === '404') {
        console.log('City not found');
        return;
      }

      console.log(data);
      fetchWeatherData(url, { latitude: data.coord.lat, longitude: data.coord.lon });
      setCity(''); // Clear city input after search
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };

  const saveWeatherData = async (data) => {
    try {
      // Check if the location is already saved
      const response = await axios.post('http://localhost:5000/api/weather', {
        city: data.name,
        country: data.sys.country,
        temperature: Math.floor(data.main.temp - 273),
        description: data.weather[0].description,
        icon: data.weather[0].icon,
      });

      console.log('Weather data saved to database:', response.data);

      // Now toggle the saved status for this location
      const weatherDataId = response.data._id; // Assuming the response contains the saved weather data
      const saveResponse = await axios.patch(`http://localhost:5000/api/weather/${weatherDataId}/save`);

      console.log('Save status toggled:', saveResponse.data.isSaved);

      // Set success message
      setSuccessMessage('Weather data saved successfully!');
      setErrorMessage(''); // Clear any previous error message
    } catch (error) {
      console.error('Error saving weather data to database:', error);
      setErrorMessage('Error saving the weather data. Please try again.');
      setSuccessMessage(''); // Clear any previous success message
    }
  };

  const weatherReport = async (data, coordinates) => {
    const { latitude, longitude } = coordinates;
    const urlcast = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apikey}`;
    try {
      const response = await axios.get(urlcast);
      const forecast = response.data;
      hourForecast(forecast);
      dayForecast(forecast);

      document.getElementById('city').innerText = `${data.name}, ${data.sys.country}`;
      document.getElementById('temperature').innerText = `${Math.floor(data.main.temp - 273)} °C`;
      document.getElementById('clouds').innerText = data.weather[0].description;

      const icon1 = data.weather[0].icon;
      const iconurl = `https://openweathermap.org/img/wn/${icon1}@2x.png`;
      document.getElementById('img').src = iconurl;
      document.getElementById('current-icon').src = iconurl;
    } catch (error) {
      console.error('Error fetching forecast data:', error);
    }
  };

  const hourForecast = (forecast) => {
    document.querySelector('.templist').innerHTML = '';
    for (let i = 0; i < 5; i++) {
      const date = new Date(forecast.list[i].dt * 1000);
      const hourR = document.createElement('div');
      hourR.setAttribute('class', 'hour-card');

      const div = document.createElement('div');
      const time = document.createElement('p');
      time.setAttribute('class', 'time');
      time.innerText = date.toLocaleTimeString(undefined, 'Asia/Kolkata').replace(':00', '');

      const temp = document.createElement('p');
      temp.innerText = `${Math.floor(forecast.list[i].main.temp_max - 273)} °C / ${Math.floor(
        forecast.list[i].main.temp_min - 273
      )} °C`;

      div.appendChild(time);
      div.appendChild(temp);

      const desc = document.createElement('p');
      desc.setAttribute('class', 'desc');
      desc.innerText = forecast.list[i].weather[0].description;

      const icon = document.createElement('img');
      icon.setAttribute(
        'src',
        `https://openweathermap.org/img/wn/${forecast.list[i].weather[0].icon}@2x.png`
      );
      icon.setAttribute('alt', forecast.list[i].weather[0].description);

      hourR.appendChild(icon);
      hourR.appendChild(div);
      hourR.appendChild(desc);

      // Adding weather recommendation for each hour
      const recommendation = getWeatherRecommendation(forecast.list[i]); // Using the updated logic
      const recDiv = document.createElement('div');
      recDiv.className = 'hour-recommendation';
      recDiv.style = 'padding: 8px; background: #f8f8f8; border-radius: 5px; margin-top: 10px;';
      recDiv.innerText = recommendation;
      hourR.appendChild(recDiv);

      document.querySelector('.templist').appendChild(hourR);
    }
  };

  const dayForecast = (forecast) => {
    document.querySelector('.weekF').innerHTML = '';
    for (let i = 8; i < forecast.list.length; i += 8) {
      const div = document.createElement('div');
      div.setAttribute('class', 'day-card');

      const day = document.createElement('p');
      day.setAttribute('class', 'date');
      day.innerText = new Date(forecast.list[i].dt * 1000).toDateString(undefined, 'Asia/Kolkata');
      div.appendChild(day);

      const temp = document.createElement('p');
      temp.innerText = `${Math.floor(forecast.list[i].main.temp_max - 273)} °C / ${Math.floor(
        forecast.list[i].main.temp_min - 273
      )} °C`;
      div.appendChild(temp);

      const description = document.createElement('p');
      description.setAttribute('class', 'desc');
      description.innerText = forecast.list[i].weather[0].description;
      div.appendChild(description);

      const icon = document.createElement('img');
      icon.setAttribute(
        'src',
        `https://openweathermap.org/img/wn/${forecast.list[i].weather[0].icon}@2x.png`
      );
      icon.setAttribute('alt', forecast.list[i].weather[0].description);

      div.appendChild(icon);

      // Adding weather recommendation for each day
      const recommendation = getWeatherRecommendation(forecast.list[i]); // Using the updated logic
      const recDiv = document.createElement('div');
      recDiv.className = 'day-recommendation';
      recDiv.style = 'padding: 8px; background: #f8f8f8; border-radius: 5px; margin-top: 10px;';
      recDiv.innerText = recommendation;
      div.appendChild(recDiv);

      document.querySelector('.weekF').appendChild(div);
    }
  };

  const handleSpeech = () => {
    if (weatherData && recommendation) {
      speakWeather(weatherData, recommendation); // Speak weather details and recommendation
    }
  };

  const goToSavedWeather = () => setCurrentPage('SavedWeather'); // Navigate to SavedWeather page
  const goToHome = () => {
    setCurrentPage('home');
    window.location.reload();
  } // Navigate back to Home page

  if (currentPage === 'SavedWeather') {
    return <SavedWeather goToHome={goToHome} />; // Pass a prop to go back to home
  }

  return (
    <div className="weather-info">
      <div className="header">
        <h3 className="title">Clim8</h3>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Enter city name"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <button onClick={searchByCity}>Search</button>
          <button onClick={goToSavedWeather}> Store location</button>
        </div>
      </div>

      <main>
        <div className="current-weather">
          <h2 id="city">Delhi, IN</h2>
          <div className="temp-info">
            <p id="temperature">26 °C</p>
            <button onClick={handleSpeech} aria-label="Speak Weather Details">
              <i className="fa-solid fa-volume-high"></i> {/* Add a speech icon */}
            </button>
          </div>
          <span id="clouds">Broken Clouds</span>
          <img id="current-icon" alt="Current Weather Icon" />
        </div>

        {/* Displaying Weather Recommendation */}
        <div className="weather-recommendation" style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
          <p style={{ fontWeight: 'bold', fontSize: '16px', color: '#333' }}>{recommendation}</p>
        </div>

        {/* Display success/error message */}
        {successMessage && <div className="success-message">{successMessage}</div>}
        

        <div className="hourly-forecast">
          <p className="cast-header">Upcoming forecast</p>
          <div className="templist"></div>
        </div>

        <div className="daily-forecast">
          <p className="cast-header">Next 4 days forecast</p>
          <div className="weekF"></div>
        </div>
      </main>
    </div>
  );
}

export default App;
