// Initialize theme
(() => {
const theme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', theme);
localStorage.setItem('theme', theme);
});


// DOM elements
const els = {
  form: document.getElementById('searchForm'),
  query: document.getElementById('query'),
  status: document.getElementById('status'),
  card: document.getElementById('result'),
  flag: document.getElementById('flag'),
  name: document.getElementById('name'),
  capital: document.getElementById('capital'),
  population: document.getElementById('population'),
  region: document.getElementById('region'),
  temp: document.getElementById('temp'),
  feels: document.getElementById('feels'),
  wind: document.getElementById('wind'),
  wicon: document.getElementById('wicon'),
  wdesc: document.getElementById('wdesc'),
  humidity: document.getElementById('humidity'),
  geoBtn: document.getElementById('geoBtn'),
  themeToggle: document.getElementById('themeToggle')
};

// Check if all required elements exist
const requiredElements = ['form', 'query', 'status', 'card'];
const missingElements = requiredElements.filter(id => !els[id]);
if (missingElements.length > 0) {
  console.error('Missing required DOM elements:', missingElements);
}

// Helpers
const fmtInt = (n) => new Intl.NumberFormat().format(n);
const setStatus = (msg = '') => {
  if (els.status) {
    els.status.textContent = msg;
  } else {
    console.warn('Status element not found');
  }
};
const showCard = (show) => {
  if (els.card) {
    els.card.hidden = !show;
  } else {
    console.warn('Card element not found');
  }
};
const setLoading = (isLoading) => {
if (isLoading) {
  showCard(true);
  if (els.card) {
    els.card.classList.add('skeleton');
  }
  setStatus('Loading…');
} else {
  if (els.card) {
    els.card.classList.remove('skeleton');
  }
  // Don't clear status here, let the calling function handle it
}
};


// Fetch country data
async function fetchCountry(name) {
const url = `https://restcountries.com/v3.1/name/${encodeURIComponent(name)}?fullText=false&fields=name,capital,flags,population,cca2,region`;
console.log('Fetching country from:', url);

try {
  const res = await fetch(url);
  console.log('Response status:', res.status, res.statusText);
  
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(`Country "${name}" not found. Please check the spelling and try again.`);
    } else {
      throw new Error(`Failed to fetch country data (${res.status}). Please try again later.`);
    }
  }
  
  const data = await res.json();
  console.log('Country data received:', data);
  
  if (!data || data.length === 0) {
    throw new Error(`No results found for "${name}". Please try a different country name.`);
  }
  
  // pick the best match (first item usually)
  return data[0];
} catch (error) {
  console.error('fetchCountry error:', error);
  
  // Handle network errors
  if (error.name === 'TypeError' && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
    throw new Error('Network error. Please check your internet connection and try again.');
  }
  
  // Handle JSON parsing errors
  if (error.name === 'SyntaxError') {
    throw new Error(`Invalid response from country service. Please try again later.`);
  }
  
  // Re-throw our custom error messages
  throw error;
}
}


// Weather by city name using protected Vercel API endpoint
async function fetchWeather(city, countryCode) {
  try {
    // Call our server-side endpoint that protects the API key
    const url = new URL('/api/weather', window.location.origin);
    url.searchParams.set('city', city);
    if (countryCode) {
      url.searchParams.set('countryCode', countryCode);
    }

    const res = await fetch(url.toString());
    const data = await res.json();

    if (!res.ok) {
      if (res.status === 404) {
        throw new Error(`Weather data not available for ${city}. The capital city might not be recognized by the weather service.`);
      } else if (res.status === 401) {
        throw new Error('Weather service authentication failed. Please check API configuration.');
      } else {
        throw new Error(data.error || `Weather service error. Please try again later.`);
      }
    }

    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your internet connection and try again.');
    }
    throw error; // Re-throw the original error if it's already handled
  }
}

// Helper functions for Open-Meteo weather codes
function getWeatherMain(code) {
  const mainTypes = {
    0: 'Clear',
    1: 'Clear', 2: 'Clouds', 3: 'Clouds',
    45: 'Mist', 48: 'Mist',
    51: 'Drizzle', 53: 'Drizzle', 55: 'Drizzle', 56: 'Drizzle', 57: 'Drizzle',
    61: 'Rain', 63: 'Rain', 65: 'Rain', 66: 'Rain', 67: 'Rain',
    71: 'Snow', 73: 'Snow', 75: 'Snow', 77: 'Snow',
    80: 'Rain', 81: 'Rain', 82: 'Rain',
    85: 'Snow', 86: 'Snow',
    95: 'Thunderstorm', 96: 'Thunderstorm', 99: 'Thunderstorm'
  };
  return mainTypes[code] || 'Clear';
}

function getWeatherDescription(code) {
  const descriptions = {
    0: 'Clear sky',
    1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
    45: 'Fog', 48: 'Depositing rime fog',
    51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
    56: 'Light freezing drizzle', 57: 'Dense freezing drizzle',
    61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
    66: 'Light freezing rain', 67: 'Heavy freezing rain',
    71: 'Slight snow fall', 73: 'Moderate snow fall', 75: 'Heavy snow fall',
    77: 'Snow grains',
    80: 'Slight rain showers', 81: 'Moderate rain showers', 82: 'Violent rain showers',
    85: 'Slight snow showers', 86: 'Heavy snow showers',
    95: 'Thunderstorm', 96: 'Thunderstorm with slight hail', 99: 'Thunderstorm with heavy hail'
  };
  return descriptions[code] || 'Clear sky';
}

function getWeatherIcon(code) {
  const icons = {
    0: '01d', // Clear sky
    1: '02d', 2: '03d', 3: '04d', // Clouds
    45: '50d', 48: '50d', // Fog
    51: '09d', 53: '09d', 55: '09d', 56: '09d', 57: '09d', // Drizzle
    61: '10d', 63: '10d', 65: '10d', 66: '10d', 67: '10d', // Rain
    71: '13d', 73: '13d', 75: '13d', 77: '13d', // Snow
    80: '09d', 81: '09d', 82: '09d', // Rain showers
    85: '13d', 86: '13d', // Snow showers
    95: '11d', 96: '11d', 99: '11d' // Thunderstorm
  };
  return icons[code] || '01d';
}


function renderCountry(country) {
const { flags, name, capital, population, region } = country;
// Only set flag src if flags exist
if (flags && (flags.svg || flags.png)) {
  els.flag.src = flags.svg || flags.png;
  els.flag.srcset = flags.png ? `${flags.png} 1x, ${flags.svg} 2x` : '';
  els.flag.style.display = 'block';
} else {
  els.flag.src = '';
  els.flag.srcset = '';
  els.flag.style.display = 'none';
}
els.flag.loading = 'lazy';
els.name.textContent = name.common;
els.capital.textContent = (capital && capital[0]) || '—';
els.population.textContent = fmtInt(population);
els.region.textContent = region || '—';
}


function renderWeather(w) {
const t = Math.round(w.main.temp);
const feels = Math.round(w.main.feels_like);
els.temp.textContent = `${t}°C`;
els.feels.textContent = `Feels like ${feels}°C`;
els.wind.textContent = `Wind: ${Math.round(w.wind.speed)} m/s`;
els.humidity.textContent = `Humidity: ${w.main.humidity}%`;
els.wdesc.textContent = w.weather[0].description;

console.log('Weather data:', w.weather[0]); // Debug log

// Set weather icon with proper error handling
if (w.weather && w.weather[0] && w.weather[0].icon) {
  const iconCode = w.weather[0].icon;
  // Try OpenWeatherMap first, then fallback to emoji if it fails
  const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  
  console.log('Setting weather icon:', iconCode, iconUrl); // Debug log
  
  // Remove any existing fallback
  const existingFallback = els.wicon.parentNode.querySelector('.weather-fallback');
  if (existingFallback) {
    existingFallback.remove();
  }
  
  // Clear any previous styles and set the icon
  els.wicon.style.display = 'block';
  els.wicon.style.background = 'transparent';
  els.wicon.style.borderRadius = '0';
  
  // Try to load the image first
  const testImg = new Image();
  testImg.crossOrigin = 'anonymous';
  testImg.onload = function() {
    console.log('Weather icon loaded successfully');
    els.wicon.src = iconUrl;
    els.wicon.alt = w.weather[0].description;
    // Hide any fallback elements
    const fallback = els.wicon.parentNode.querySelector('.weather-fallback');
    if (fallback) {
      fallback.style.display = 'none';
    }
  };
  testImg.onerror = function() {
    console.warn('Weather icon failed to load, using emoji fallback:', iconUrl);
    // Hide the icon and show emoji fallback
    els.wicon.style.display = 'none';
    showWeatherFallback(w.weather[0].main);
  };
  testImg.src = iconUrl;
  
} else {
  console.log('No weather icon data available');
  els.wicon.src = '';
  els.wicon.style.display = 'none';
  showWeatherFallback('clear'); // Default fallback
}

// Apply weather-based background theme
applyWeatherTheme(w.weather[0].main);
}

// Function to show weather emoji fallback
function showWeatherFallback(weatherMain) {
// Remove any existing fallback
const existingFallback = els.wicon.parentNode.querySelector('.weather-fallback');
if (existingFallback) {
  existingFallback.remove();
}

// Create new fallback element
const fallback = document.createElement('div');
fallback.className = 'weather-fallback';
fallback.style.display = 'flex';
fallback.style.alignItems = 'center';
fallback.style.justifyContent = 'center';
fallback.style.width = '72px';
fallback.style.height = '72px';
fallback.style.fontSize = '2.5rem';
fallback.style.background = 'var(--glass)';
fallback.style.borderRadius = '50%';
fallback.style.transition = 'var(--transition)';
fallback.textContent = getWeatherEmoji(weatherMain);

// Insert fallback before the weather icon
els.wicon.parentNode.insertBefore(fallback, els.wicon);

console.log('Showing weather fallback:', getWeatherEmoji(weatherMain));
}

// Function to get weather emoji based on weather condition
function getWeatherEmoji(weatherMain) {
const weatherType = weatherMain.toLowerCase();
switch (weatherType) {
  case 'clear': return '☀️';
  case 'clouds': return '☁️';
  case 'rain': return '🌧️';
  case 'drizzle': return '🌦️';
  case 'thunderstorm': return '⛈️';
  case 'snow': return '❄️';
  case 'mist':
  case 'fog':
  case 'haze': return '🌫️';
  default: return '🌤️';
}
}

// Function to apply weather-based background themes
function applyWeatherTheme(weatherMain) {
// Remove existing weather classes
const weatherClasses = [
  'weather-clear', 'weather-clouds', 'weather-rain', 'weather-drizzle',
  'weather-thunderstorm', 'weather-snow', 'weather-mist', 'weather-fog', 'weather-haze'
];
document.body.classList.remove(...weatherClasses);

// Apply new weather class based on main weather condition
const weatherType = weatherMain.toLowerCase();
switch (weatherType) {
  case 'clear':
    document.body.classList.add('weather-clear');
    break;
  case 'clouds':
    document.body.classList.add('weather-clouds');
    break;
  case 'rain':
    document.body.classList.add('weather-rain');
    break;
  case 'drizzle':
    document.body.classList.add('weather-drizzle');
    break;
  case 'thunderstorm':
    document.body.classList.add('weather-thunderstorm');
    break;
  case 'snow':
    document.body.classList.add('weather-snow');
    break;
  case 'mist':
  case 'fog':
  case 'haze':
  case 'dust':
  case 'sand':
  case 'smoke':
    document.body.classList.add('weather-mist');
    break;
  default:
    // Keep default theme for unknown weather types
    break;
}
}


// Main application logic
async function handleSearch(e) {
e.preventDefault();
const query = els.query.value.trim();

// Input validation
if (!query) {
  setStatus('Please enter a country name to search.');
  showCard(false);
  return;
}

if (query.length < 2) {
  setStatus('Please enter at least 2 characters.');
  showCard(false);
  return;
}

// Clear previous status and start loading
setStatus('');
setLoading(true);
showCard(false);

try {
  console.log(`Searching for country: "${query}"`);
  
  const country = await fetchCountry(query);
  console.log('Country found:', country.name.common);
  
  // Check if country has a capital
  if (!country.capital || country.capital.length === 0) {
    throw new Error(`${country.name.common} doesn't have a recognized capital city for weather data.`);
  }
  
  console.log(`Fetching weather for: ${country.capital[0]}, ${country.cca2}`);
  const weather = await fetchWeather(country.capital[0], country.cca2);
  
  // Render the results
  renderCountry(country);
  renderWeather(weather);
  showCard(true);
  setStatus(''); // Clear any previous error messages
  
} catch (error) {
  console.error('Search error:', error);
  
  // Display user-friendly error message with emojis
  let errorMessage = error.message;
  let displayMessage = '';
  
  // Handle specific error cases with appropriate emojis and suggestions
  if (errorMessage.includes('not found')) {
    displayMessage = `❌ ${errorMessage}\n💡 Try searching for: "United States", "India", "France", "Germany", "Japan"`;
  } else if (errorMessage.includes('No results found')) {
    displayMessage = `❌ ${errorMessage}\n💡 Try searching for: "United States", "India", "France", "Germany", "Japan"`;
  } else if (errorMessage.includes('Network error')) {
    displayMessage = `🌐 ${errorMessage}`;
  } else if (errorMessage.includes('Weather data not available')) {
    displayMessage = `🌤️ ${errorMessage}`;
  } else if (errorMessage.includes('capital city')) {
    displayMessage = `🏛️ ${errorMessage}`;
  } else if (errorMessage.includes('Invalid response')) {
    displayMessage = `⚠️ ${errorMessage}`;
  } else {
    displayMessage = `⚠️ ${errorMessage}`;
  }
  
  console.log('Setting status message:', displayMessage);
  setStatus(displayMessage);
  showCard(false);
  resetWeatherTheme();
} finally {
  setLoading(false);
}
}

// Handle geolocation button click
async function handleGeolocation() {
if (!navigator.geolocation) {
  setStatus('🌐 Geolocation is not supported by this browser.');
  return;
}

setStatus('📍 Getting your location...');
setLoading(true);
showCard(false);

navigator.geolocation.getCurrentPosition(
  async (position) => {
    try {
      const { latitude, longitude } = position.coords;
      console.log('User coordinates:', latitude, longitude);
      
      // Use reverse geocoding to get location details
      const locationData = await fetchLocationFromCoords(latitude, longitude);
      console.log('Location data:', locationData);
      
      if (!locationData || !locationData.country) {
        throw new Error('Could not determine your country from your location.');
      }
      
      // Try to fetch country data using the country code first, then country name
      let country;
      try {
        // First try with country code if available
        if (locationData.countryCode === 'IN' || locationData.country === 'India') {
          console.log('Detected India, fetching India data directly');
          country = await fetchCountryByCode('IN');
        } else if (locationData.countryCode && locationData.countryCode.length === 2) {
          console.log('Trying country code lookup:', locationData.countryCode);
          country = await fetchCountryByCode(locationData.countryCode);
        }
      } catch (error) {
        console.log('Country code lookup failed, trying country name');
      }
      
      // If country code lookup failed, try with country name
      if (!country && locationData.country) {
        console.log('Trying country name lookup:', locationData.country);
        
        // Handle specific case where Baranagar should be India
        if (locationData.name && locationData.name.toLowerCase().includes('baranagar')) {
          console.log('Baranagar detected, forcing India lookup');
          try {
            country = await fetchCountryByCode('IN');
          } catch (e) {
            country = await fetchCountry('India');
          }
        } else {
          // For other locations, try the detected country name
          try {
            country = await fetchCountry(locationData.country);
          } catch (e) {
            // If that fails and we think it's India, try India
            if (locationData.country === 'IN' || locationData.country === 'India') {
              country = await fetchCountry('India');
            } else {
              throw e;
            }
          }
        }
      }
      
      if (!country) {
        throw new Error('Could not find country information for your location.');
      }
      
      // Check if country has a capital
      if (!country.capital || country.capital.length === 0) {
        throw new Error(`${country.name.common} doesn't have a recognized capital city for weather data.`);
      }
      
      // Fetch weather for the capital
      const weather = await fetchWeather(country.capital[0], country.cca2);
      
      // Render results
      renderCountry(country);
      renderWeather(weather);
      showCard(true);
      
      const locationName = locationData.city || locationData.name || country.name.common;
      setStatus(`📍 Showing weather for ${locationName} (${country.name.common})`);
      
    } catch (error) {
      console.error('Geolocation error:', error);
      setStatus(`❌ ${error.message}`);
      showCard(false);
      resetWeatherTheme();
    } finally {
      setLoading(false);
    }
  },
  (error) => {
    console.error('Geolocation error:', error);
    let errorMessage = '';
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = '❌ Location access denied. Please allow location access and try again.';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = '❌ Location information is unavailable. Please try again later.';
        break;
      case error.TIMEOUT:
        errorMessage = '❌ Location request timed out. Please try again.';
        break;
      default:
        errorMessage = '❌ An unknown error occurred while retrieving location.';
        break;
    }
    
    setStatus(errorMessage);
    showCard(false);
    setLoading(false);
    resetWeatherTheme();
  },
  {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 300000 // 5 minutes
  }
);
}

// Fetch location data from coordinates using protected Vercel API endpoint
async function fetchLocationFromCoords(lat, lon) {
  try {
    console.log('Fetching location for coordinates:', lat, lon);
    
    // Call our secure server endpoint that protects the API key
    const url = new URL('/api/geocode', window.location.origin);
    url.searchParams.set('lat', lat);
    url.searchParams.set('lon', lon);
    
    const res = await fetch(url.toString());
    const data = await res.json();

    if (!res.ok || !data) {
      throw new Error(data.error || 'Failed to get location data from coordinates.');
    }

    console.log('All reverse geocoding results:', data);

    if (data && data.length > 0) {
      // Log all results to see what we're getting
      data.forEach((result, index) => {
        console.log(`Result ${index}:`, {
          name: result.name,
          state: result.state,
          country: result.country,
          lat: result.lat,
          lon: result.lon
        });
      });

      let bestMatch = data[0]; // Default to first result

      // Manual override for known locations in India
      const locationName = bestMatch.name?.toLowerCase();
      if (locationName && isIndianLocation(locationName, lat, lon)) {
        console.log('Detected Indian location, overriding country to India');
        bestMatch = {
          ...bestMatch,
          country: 'IN',
          countryName: 'India'
        };
      }

      // Try to find a better match for India in the results
      const indiaMatch = data.find(location =>
        location.country === 'IN' ||
        location.country === 'India' ||
        (location.state && location.state.toLowerCase().includes('bengal')) ||
        (location.state && location.state.toLowerCase().includes('west bengal'))
      );

      if (indiaMatch) {
        console.log('Found India/Bengal match in results:', indiaMatch);
        bestMatch = indiaMatch;
      }

      console.log('Using location:', bestMatch);

      return {
        name: bestMatch.name,
        city: bestMatch.name,
        state: bestMatch.state,
        country: bestMatch.countryName || bestMatch.country,
        countryCode: bestMatch.country === 'IN' ? 'IN' : bestMatch.country
      };
    } else {
      throw new Error('No location data found for your coordinates.');
    }
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    throw new Error('Could not determine your location. Please try searching manually.');
  }
}

// Function to detect if a location is in India based on coordinates and name
function isIndianLocation(locationName, lat, lon) {
// India's approximate bounding box coordinates
const indiaBounds = {
  north: 37.6,
  south: 6.4,
  east: 97.25,
  west: 68.7
};

// Check if coordinates are within India's bounds
const withinIndiaBounds = lat >= indiaBounds.south && 
                         lat <= indiaBounds.north && 
                         lon >= indiaBounds.west && 
                         lon <= indiaBounds.east;

// Known Indian cities/locations (add more as needed)
const indianLocations = [
  'baranagar', 'barahanagar', 'kolkata', 'calcutta', 'delhi', 'mumbai', 
  'bangalore', 'hyderabad', 'chennai', 'pune', 'ahmedabad', 'surat',
  'jaipur', 'lucknow', 'kanpur', 'nagpur', 'patna', 'indore', 'thane',
  'bhopal', 'visakhapatnam', 'vadodara', 'firozabad', 'ludhiana',
  'rajkot', 'agra', 'siliguri', 'durgapur', 'asansol', 'howrah'
];

const isKnownIndianLocation = indianLocations.some(city => 
  locationName.includes(city) || city.includes(locationName)
);

console.log('Location check:', {
  locationName,
  withinIndiaBounds,
  isKnownIndianLocation,
  coordinates: {lat, lon}
});

return withinIndiaBounds || isKnownIndianLocation;
}

// Fetch country data by country code (ISO 3166-1 alpha-2)
async function fetchCountryByCode(countryCode) {
const url = `https://restcountries.com/v3.1/alpha/${countryCode}?fields=name,capital,flags,population,cca2,region`;
console.log('Fetching country by code:', url);

try {
  const res = await fetch(url);
  console.log('Country by code response status:', res.status);
  
  if (!res.ok) {
    throw new Error(`Country code lookup failed: ${countryCode}`);
  }
  
  const data = await res.json();
  console.log('Country by code data:', data);
  
  return data;
} catch (error) {
  console.error('fetchCountryByCode error:', error);
  throw error;
}
}

// Function to reset weather theme to default
function resetWeatherTheme() {
const weatherClasses = [
  'weather-clear', 'weather-clouds', 'weather-rain', 'weather-drizzle',
  'weather-thunderstorm', 'weather-snow', 'weather-mist', 'weather-fog', 'weather-haze'
];
document.body.classList.remove(...weatherClasses);
}

// Event listeners
els.form.addEventListener('submit', handleSearch);

// Geolocation button
els.geoBtn.addEventListener('click', handleGeolocation);

// Theme toggle
els.themeToggle.addEventListener('change', (e) => {
const theme = e.target.checked ? 'light' : 'dark';
document.documentElement.setAttribute('data-theme', theme);
localStorage.setItem('theme', theme);
});

// Initialize theme toggle state
const currentTheme = localStorage.getItem('theme') || 'dark';
els.themeToggle.checked = currentTheme === 'light';

// Test function for error handling (can be called from console)
window.testInvalidCountry = function() {
  els.query.value = 'invalidcountryname123';
  handleSearch({preventDefault: () => {}});
};

// Add some example suggestions
window.countrySuggestions = [
  'United States', 'India', 'France', 'Germany', 'Japan', 
  'Australia', 'Canada', 'Brazil', 'Italy', 'Spain'
];