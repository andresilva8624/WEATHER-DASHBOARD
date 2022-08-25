$(document).ready(function () {

  // OpenWeather API
  var apiKey = '767baab1ba615005b7b57e268ed513fe';

  // Selectors for HTML elements to display weather information
  var cityEl = $('h2#city');
  var dateEl = $('h3#date');
  var weatherIconEl = $('img#weather-icon');
  var temperatureEl = $('span#temperature');
  var humidityEl = $('span#humidity');
  var windEl = $('span#wind');
  var uvIndexEl = $('span#uv-index');
  var cityListEl = $('div.cityList');

 // Selectors for form elements
 var cityInput = $('#city-input');

 // Store past searched cities
 var pastCities = [];

 // Helper function to sort cities from https://www.sitepoint.com/sort-an-array-of-objects-in-javascript/
//  function compare(a, b) {
//      // Use toUpperCase() to ignore character casing
//      var cityA = a.city.toUpperCase();
//      var cityB = b.city.toUpperCase();

//      var comparison = 0;
//      if (cityA > cityB) {
//          comparison = 1;
//      } else if (cityA < cityB) {
//          comparison = -1;
//      }
//      return comparison;
//  }

 // Local storage functions for past searched cities

  // Load events from local storage
  function loadCities() {
      var storedCities = JSON.parse(localStorage.getItem('pastCities'));
      if (storedCities) {
          pastCities = storedCities;
      }
  }

  // Store searched cities in local storage
  function storeCities() {
      localStorage.setItem('pastCities', JSON.stringify(pastCities));
  }

 // Functions to build the URL for the OpenWeather API call

  function buildURLFromInputs(city) {
      if (city) {
          return `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
      }
  }

  function buildURLFromId(id) {
      return `https://api.openweathermap.org/data/2.5/weather?id=${id}&appid=${apiKey}`;
  }

   // Function to display the last 5 searched cities
   function displayCities(pastCities) {
      cityListEl.empty();
      pastCities.splice(8);
      var sortedCities = [...pastCities];
    //   sortedCities.sort(compare);
      sortedCities.forEach(function (location) {
          var cityDiv = $('<div>').addClass('col-12 city');
          var cityBtn = $('<button>').addClass('btn btn-light city-btn').text(location.city);
          cityDiv.append(cityBtn);
          cityListEl.append(cityDiv);
      });
  }
  
  // Function to color the UV Index based on EPA color scale: https://www.epa.gov/sunsafety/uv-index-scale-0
  function setUVIndexColor(uvi) {
      if (uvi < 3) {
          return 'green';
      } else if (uvi >= 3 && uvi < 6) {
          return 'yellow';
      } else if (uvi >= 6 && uvi < 8) {
          return 'orange';
      } else if (uvi >= 8 && uvi < 11) {
          return 'red';
      } else return 'purple';
  }

  // Search for weather conditions by calling the OpenWeather API
  function searchWeather(queryURL) {

      // Create an AJAX call to retrieve weather data
      $.ajax({
          url: queryURL,
          method: 'GET'
      }).then(function (response) {

          // Store current city in past cities
          var city = response.name;
          var id = response.id;
          // Remove duplicate cities
        //   if (pastCities[0]) {
        //       pastCities = $.grep(pastCities, function (storedCity) {
        //           return id !== storedCity.id;
        //       })
        //   }
          pastCities.unshift({ city, id });
          storeCities();
          displayCities(pastCities);
          
          // Display current weather in DOM elements
          cityEl.text(response.name);
          var formattedDate = moment.unix(response.dt).format('L');
          dateEl.text(formattedDate);
          var weatherIcon = response.weather[0].icon;
          weatherIconEl.attr('src', `http://openweathermap.org/img/wn/${weatherIcon}.png`).attr('alt', response.weather[0].description);
          temperatureEl.html(((response.main.temp - 273.15) * 1.8 + 32).toFixed(1));
          humidityEl.text(response.main.humidity);
          windEl.text((response.wind.speed * 2.237).toFixed(1));

          // Call OpenWeather API OneCall with lat and lon to get the UV index and 5 day forecast
          var lat = response.coord.lat;
          var lon = response.coord.lon;
          var queryURLAll = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}`;
          $.ajax({
              url: queryURLAll,
              method: 'GET'
          }).then(function (response) {
              var uvIndex = response.current.uvi;
              var uvColor = setUVIndexColor(uvIndex);
              uvIndexEl.text(response.current.uvi);
              uvIndexEl.attr('style', `background-color: ${uvColor}; color: ${uvColor === "yellow" ? "black" : "white"}`);
              var fiveDay = response.daily;

              // Display 5 day forecast in DOM elements
              for (var i = 0; i <= 5; i++) {
                  var currDay = fiveDay[i];
                  $(`div.day-${i} .card-title`).text(moment.unix(currDay.dt).format('L'));
                  $(`div.day-${i} .fiveDay-img`).attr(
                      'src',
                      `http://openweathermap.org/img/wn/${currDay.weather[0].icon}.png`
                  ).attr('alt', currDay.weather[0].description);
                  $(`div.day-${i} .fiveDay-temp`).text(((currDay.temp.day - 273.15) * 1.8 + 32).toFixed(1));
                  $(`div.day-${i} .fiveDay-humid`).text(currDay.humidity);
              }
          });
      });
  }

   // Function to display the last searched city
//    function displayLastSearchedCity() {
//       if (pastCities[0]) {
//           var queryURL = buildURLFromId(pastCities[0].id);
//           searchWeather(queryURL);
//       } else {
//           // if no past searched cities, load Los Angeles weather data
//           var queryURL = buildURLFromInputs("Los Angeles");
//           searchWeather(queryURL);
//       }
//   }

  // Click handler for search button
  $('#search-btn').on('click', function (event) {
      // Preventing the button from trying to submit the form
      event.preventDefault();

      // Retrieving and scrubbing the city from the inputs
      var city = cityInput.val().trim();
      city = city.replace(' ', '%20');

      // Clear the input fields
      cityInput.val('');

      // Build the query url with the city and searchWeather
      if (city) {
          var queryURL = buildURLFromInputs(city);
          searchWeather(queryURL);
      }
  }); 
  
  // Click handler for city buttons to load that city's weather
  $(document).on("click", "button.city-btn", function (event) {
      var clickedCity = $(this).text();
      var foundCity = $.grep(pastCities, function (storedCity) {
          return clickedCity === storedCity.city;
      })
      var queryURL = buildURLFromId(foundCity[0].id)
      searchWeather(queryURL);
  });

// Initialization - when page loads

  // load any cities in local storage into array
  loadCities();
  displayCities(pastCities);

  // Display weather for last searched city
//   displayLastSearchedCity();

});