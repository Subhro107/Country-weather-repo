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
const fmtInt = (n) => new Intl.NumberFormat().format(n);
const setStatus = (msg = '') => (els.status.textContent = msg);
const showCard = (show) => (els.card.hidden = !show);
const setLoading = (isLoading) => {
if (isLoading) {
showCard(true);
els.card.classList.add('skeleton');
setStatus('Loading…');
} else {
els.card.classList.remove('skeleton');
setStatus('');
}
};


// Fetch country data
async function fetchCountry(name) {
const url = `https://restcountries.com/v3.1/name/${encodeURIComponent(name)}?fullText=false&fields=name,capital,flags,population,cca2,region`;
const res = await fetch(url);
if (!res.ok) throw new Error(`Country not found: ${name}`);
const data = await res.json();
// pick the best match (first item usually)
return data[0];
}


// Weather by city name + country code (to disambiguate)
async function fetchWeather(city, countryCode) {
const url = new URL('https://api.openweathermap.org/data/2.5/weather');
url.searchParams.set('q', `${city},${countryCode}`);
url.searchParams.set('appid', window.CONFIG.OPENWEATHER_API_KEY);
url.searchParams.set('units', 'metric');
const res = await fetch(url.toString());
if (!res.ok) throw new Error('Weather not available');
return res.json();
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
// Only set weather icon if weather data exists
if (w.weather && w.weather[0] && w.weather[0].icon) {
  els.wicon.src = `https://openweathermap.org/img/wn/${w.weather[0].icon}@2x.png`;
  els.wicon.style.display = 'block';
} else {
  els.wicon.src = '';
  els.wicon.style.display = 'none';
}
}


// Main application logic
async function handleSearch(e) {
e.preventDefault();
const query = els.query.value.trim();
if (!query) return;

setLoading(true);
showCard(false); // Hide card while loading
try {
  const country = await fetchCountry(query);
  const weather = await fetchWeather(country.capital[0], country.cca2);
  renderCountry(country);
  renderWeather(weather);
  showCard(true); // Show card with data
  setStatus('');
} catch (error) {
  console.error('Error:', error);
  setStatus(`Error: ${error.message}`);
  showCard(false);
} finally {
  setLoading(false);
}
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