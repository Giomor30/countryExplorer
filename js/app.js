// 🌍 Countries App - Consumo de REST Countries API

const container = document.getElementById("countriesContainer");
const searchInput = document.getElementById("searchInput");

// URL base de la API REST Countries con campos específicos
const API_URL = "https://restcountries.com/v3.1/all?fields=name,capital,region,population,flags";

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
  return {
    name: country.name.common,
    flag: country.flags.svg,
    capital: country.capital ? country.capital[0] : "N/A",
    region: country.region,
    population: country.population
  };
}

// Mostrar los países en cards
function displayCountries(countries) {
  container.innerHTML = "";

  if (countries.length === 0) {
    container.innerHTML = `
      <div class="col-12">
        <div class="alert alert-info" role="alert">
          No se encontraron países con ese criterio de búsqueda.
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
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// Filtro de búsqueda mejorado
searchInput.addEventListener("input", (e) => {
  const searchTerm = e.target.value.toLowerCase().trim();
  
  if (searchTerm === "") {
    displayCountries(allCountries);
    return;
  }

  const filteredCountries = allCountries.filter((country) => {
    const data = getCountryData(country);
    const name = data.name.toLowerCase();
    const capital = data.capital.toLowerCase();
    const region = data.region.toLowerCase();
    
    return name.includes(searchTerm) || 
           capital.includes(searchTerm) || 
           region.includes(searchTerm);
  });

  displayCountries(filteredCountries);
});

// Ejecutar al cargar la página
getCountries();
