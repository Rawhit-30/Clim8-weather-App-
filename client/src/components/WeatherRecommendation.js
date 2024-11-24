// src/components/WeatherRecommendation.js

export const getWeatherRecommendation = (data) => {
    const weatherCondition = data.weather[0].main.toLowerCase();
    const temperature = Math.floor(data.main.temp - 273); // Convert Kelvin to Celsius
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed;
    const recommendation = [];

    // Rainy weather
    if (weatherCondition.includes("rain")) {
        recommendation.push("It looks like it will rain. Don't forget to carry an umbrella!");
    }

    // Windy weather
    if (windSpeed > 5) {
        recommendation.push("It's quite windy outside. You might want to carry a mask or something to protect yourself.");
    }

    // Snowy weather
    if (weatherCondition.includes("snow")) {
        recommendation.push("It's snowing! Make sure to wear a heavy jacket to stay warm.");
    }

    // Clear/Sunny weather
    if (weatherCondition.includes("clear") || weatherCondition.includes("sun")) {
        if (temperature > 30) {
            recommendation.push("It's a hot and sunny day! Make sure to drink plenty of water and wear sunscreen.");
        } else {
            recommendation.push("It's a clear day, enjoy the pleasant weather!");
        }
    }

    // Cloudy weather
    if (weatherCondition.includes("cloud")) {
        recommendation.push("It's a bit cloudy today, a good day for a walk or outdoor activities.");
    }

    //Smoke 
    if (weatherCondition.includes("smoke")) {
        recommendation.push("The air quality might be poor due to smoke. It's best to stay indoors or wear a mask if you need to go outside.");
    }
    
    // Foggy weather
    if (weatherCondition.includes("fog")) {
        recommendation.push("It's foggy, visibility is low. Drive carefully and stay alert.");
    }

    // Stormy weather
    if (weatherCondition.includes("storm")) {
        recommendation.push("There's a storm brewing. It's best to stay indoors for safety.");
    }

    // Hot weather (above 35°C)
    if (temperature > 35) {
        recommendation.push("It's extremely hot outside. Stay hydrated, avoid outdoor activities during peak heat, and wear light clothing.");
    }

    // Cold weather (below 10°C)
    if (temperature < 10) {
        recommendation.push("It's a bit chilly, consider wearing a jacket or sweater.");
    }

    // Extreme cold (below 0°C)
    if (temperature < 0) {
        recommendation.push("It's freezing outside! Make sure to wear warm clothing and gloves.");
    }

    // High humidity
    if (humidity > 80) {
        recommendation.push("It's quite humid outside. Stay cool and avoid excessive physical activity.");
    }

    // Low humidity (dry air)
    if (humidity < 30) {
        recommendation.push("The air is dry, make sure to stay hydrated and use moisturizer if needed.");
    }

    return recommendation.join(" ");
};
