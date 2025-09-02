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


// Weather by city name + country code (to disambiguate)
async function fetchWeather(city, countryCode) {
const url = new URL('https://api.openweathermap.org/data/2.5/weather');
url.searchParams.set('q', `${city},${countryCode}`);
url.searchParams.set('appid', window.CONFIG.OPENWEATHER_API_KEY);
url.searchParams.set('units', 'metric');
try {
  const res = await fetch(url.toString());
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(`Weather data not available for ${city}. The capital city might not be recognized by the weather service.`);
    } else if (res.status === 401) {
      throw new Error('Weather service authentication failed. Please check API configuration.');
    } else {
      throw new Error(`Weather service error. Please try again later.`);
    }
  }
  return await res.json();
} catch (error) {
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    throw new Error('Network error. Please check your internet connection and try again.');
  }
  throw error; // Re-throw the original error if it's already handled
}
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