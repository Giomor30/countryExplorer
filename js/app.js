// 🌍 Countries App - Consumo de REST Countries API

// URL base de la API REST Countries con campos específicos
const API_URL = "https://restcountries.com/v3.1/all?fields=name,capital,region,population,flags,cca2,latlng,capitalInfo";

// Esperar a que el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
});

function initializeApp() {
  const container = document.getElementById("countriesContainer");
  const searchInput = document.getElementById("searchInput");
  
  if (!container || !searchInput) {
    console.error("Error: No se encontraron los elementos necesarios en el DOM");
    return;
  }
  
  // Variable para almacenar todos los países
  let allCountries = [];
  
  // Función para obtener todos los países
  async function getCountries() {
    try {
      console.log("Conectando con:", API_URL);
      
      const response = await fetch(API_URL);
      
      console.log("Respuesta recibida:", response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("✓ Datos recibidos:", data.length, "países");
      
      allCountries = data;
      displayCountries(data);
      
    } catch (error) {
      console.error("Error completo:", error);
      container.innerHTML = `
        <div class="col-12">
          <div class="alert alert-danger" role="alert">
            <h4 class="alert-heading">Error al cargar países</h4>
            <p>No se pudo conectar con la API REST Countries.</p>
            <hr>
            <p class="mb-0"><strong>Error:</strong> ${error.message}</p>
            <p class="mb-0 mt-2"><small>Ver la consola del navegador (F12) para más detalles.</small></p>
          </div>
        </div>
      `;
    }
  }
  
  // Función auxiliar para obtener datos de país
  function getCountryData(country) {
    const capitalCoords = country.capitalInfo?.latlng;
    const countryCoords = country.latlng;
    return {
      name: country.name?.common || "Sin nombre",
      flag: country.flags?.svg || "",
      capital: country.capital ? country.capital[0] : "N/A",
      region: country.region || "N/A",
      population: country.population || 0,
      cca2: country.cca2 || "",
      lat: (capitalCoords && capitalCoords[0]) || (countryCoords && countryCoords[0]) || null,
      lon: (capitalCoords && capitalCoords[1]) || (countryCoords && countryCoords[1]) || null
    };
  }
  // 🌦️ Obtener clima actual del país usando OpenWeatherMap
const WEATHER_KEY = "86f9138a09eb87bc2671de035b662612";

async function getWeather(countryName) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${countryName}&appid=${WEATHER_KEY}&units=metric&lang=es`
    );
    const data = await response.json();

    if (data.cod === 200) {
      return {
        temp: data.main.temp,
        desc: data.weather[0].description,
        icon: data.weather[0].icon
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error al obtener clima:", error);
    return null;
  }
}



  // Mostrar los países en cards
  function displayCountries(countries) {
    container.innerHTML = "";

    if (countries.length === 0) {
      container.innerHTML = `
        <div class="col-12">
          <div class="alert alert-info" role="alert">
            <h5 class="alert-heading">No se encontraron resultados</h5>
            <p class="mb-0">Intenta con otro término de búsqueda.</p>
          </div>
        </div>
      `;
      return;
    }

    countries.forEach((country) => {
      const card = document.createElement("div");
      card.classList.add("col-md-4", "col-lg-3");
      
      const data = getCountryData(country);

      card.innerHTML = `
        <div class="card h-100">
          <img src="${data.flag}" class="card-img-top" alt="${data.name} flag" style="height: 150px; object-fit: cover;">
          <div class="card-body">
            <h5 class="card-title">${data.name}</h5>
            <p class="card-text">
              <strong>Capital:</strong> ${data.capital}<br>
              <strong>Región:</strong> ${data.region}<br>
              <strong>Población:</strong> ${data.population.toLocaleString()}
            </p>
            <button class="btn btn-outline-primary btn-sm view-weather" data-name="${data.name}" data-lat="${data.lat ?? ''}" data-lon="${data.lon ?? ''}">Ver clima</button>
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  }
  
  // Filtro de búsqueda mejorado
  searchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();
    
    console.log("Buscando:", searchTerm);
    
    if (searchTerm === "") {
      displayCountries(allCountries);
      return;
    }

    const filteredCountries = allCountries.filter((country) => {
      const data = getCountryData(country);
      const name = data.name.toLowerCase();
      const capital = data.capital ? data.capital.toLowerCase() : "";
      const region = data.region ? data.region.toLowerCase() : "";
      
      return name.includes(searchTerm) || 
             capital.includes(searchTerm) || 
             region.includes(searchTerm);
    });

    console.log("Resultados encontrados:", filteredCountries.length);
    displayCountries(filteredCountries);
  });
  
  // Ejecutar al cargar la página
  getCountries();

  // Delegación de eventos para botón "Ver clima"
  container.addEventListener('click', async (e) => {
    const btn = e.target.closest('.view-weather');
    if (!btn) return;
    const name = btn.getAttribute('data-name');
    const lat = parseFloat(btn.getAttribute('data-lat'));
    const lon = parseFloat(btn.getAttribute('data-lon'));

    const titleEl = document.getElementById('weatherModalTitle');
    const bodyEl = document.getElementById('weatherModalBody');
    titleEl.textContent = `Clima en ${name}`;
    bodyEl.innerHTML = `Cargando clima...`;

    const modal = new bootstrap.Modal(document.getElementById('weatherModal'));
    modal.show();

    try {
      let weather;
      if (!isNaN(lat) && !isNaN(lon)) {
        weather = await getWeatherByCoords(lat, lon);
      } else {
        weather = await getWeather(name);
      }

      if (!weather) {
        bodyEl.innerHTML = `<div class="alert alert-warning">No fue posible obtener el clima.</div>`;
        return;
      }

      const iconUrl = `https://openweathermap.org/img/wn/${weather.icon}@2x.png`;
      bodyEl.innerHTML = `
        <div class="d-flex align-items-center">
          <img src="${iconUrl}" alt="icono clima" width="60" height="60" class="me-2"/>
          <div>
            <div class="fs-4 fw-semibold">${Math.round(weather.temp)}°C</div>
            <div class="text-capitalize">${weather.desc}</div>
          </div>
        </div>
      `;
    } catch (err) {
      console.error(err);
      bodyEl.innerHTML = `<div class="alert alert-danger">Error al cargar clima.</div>`;
    }
  });
}

// Obtener clima por coordenadas
async function getWeatherByCoords(lat, lon) {
  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_KEY}&units=metric&lang=es`);
    const data = await response.json();
    if (data.cod === 200) {
      return {
        temp: data.main.temp,
        desc: data.weather[0].description,
        icon: data.weather[0].icon
      };
    }
    return null;
  } catch (e) {
    return null;
  }
}
