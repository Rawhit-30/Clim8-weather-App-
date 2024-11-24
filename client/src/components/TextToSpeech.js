// src/components/TextToSpeech.js

export const speakWeather = (data, recommendation) => {
    const weatherDescription = `${data.weather[0].description} in ${data.name}, ${data.sys.country}.`;
    const temperature = `The current temperature is ${Math.floor(data.main.temp - 273)} degrees Celsius.`;
    const speech = new SpeechSynthesisUtterance(`${weatherDescription} ${temperature} ${recommendation}`);
  
    speech.lang = "en-US"; // Set language to English
    window.speechSynthesis.speak(speech); // Speak the weather details
  };
  