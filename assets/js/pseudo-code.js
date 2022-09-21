var apiKey = "767baab1ba615005b7b57e268ed513fe";

var cityInput = $("#city-input");

var fiveDay = [0, 1, 2, 3, 4];
var cityListEl = $("div.cityList");
var searchBtn = $("#search-btn");
var uvIndexEl = $("#uv-index");
var previousCities = JSON.parse(localStorage.getItem("previousCities")) || [];

function handleUserInput(event) {
  event.preventDefault();
  var cityName = cityInput.val();
  fetchByCityName(cityName);

  console.log(cityName);
}

function fetchByCityName(city) {
  var apiURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`;
  fetch(apiURL)
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
    // Get previous cities from local storage, read through the data and check if data.name exists in that list. If it does, you don't wanna push to previous cities, otherwise you do want to push to previous cities. Theres an Array called the include.
      previousCities.push(data.name);
      localStorage.setItem("previousCities", JSON.stringify(previousCities));
      displayCities();

      var lat = data.coord.lat;
      var lon = data.coord.lon;
      fetchByLatLon(lat, lon, data.name);
    });
}
function fetchByLatLon(lat, lon, city) {
  var apiURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;
  fetch(apiURL)
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      console.log(data.current.weather[0].icon);

      renderTodayCard(data, city);
    });

  //This is the data i want to put on the page
}

function renderTodayCard(data, city) {
  // $("#date").text(data.current.date);
  var imageURL = `http://openweathermap.org/img/wn/${data.current.weather[0].icon}@2x.png`;
  $("#city").text(city);
  $("#temperature").text(data.current.temp);
  $("#humidity").text(data.current.humidity);
  $("#wind").text(data.current.wind);
  $("#uv-index").text(data.current.uvi);
  $("#5dayforecast").empty();

  for (var i = 1; i <= 5; i++) {
    console.log(data.daily[i]);

    var cardTemplate = `
        <div class="col-sm-10 col-md-4 offset-lg-1 col-lg-2 p-1">
        <div class="card day-0 m-0 text-center">
            <div class="card-body p-1">
                <p class="card-title">${moment
                  .unix(data.daily[i].dt)
                  .format("MM/DD/YYYY")}</p>
                <img class="fiveDay-img mb-2" src="${imageURL}" />
                <p class="card-subtitle mb-2 text-muted">Temp: ${
                  data.daily[i].temp.max
                }<span
                class="fiveDay-temp"></span>
                &deg;F</p>
                <p class="card-subtitle mb-2 text-muted">Humidity: ${
                  data.daily[i].humidity
                } <span
                class="fiveDay-humid"></span>%</p>
            </div>
        </div>
    </div>`;
    $("#5dayforecast").append(cardTemplate);
    // $("#5dayforecast").text(renderTodayCard);

    // this(function (res) {
    //     return res.json();
    // })
    // this(function (data) {
    //     console.log(data);
    //     displayCities(data);
    // });
    // return;
  }
}

//     if (data.daily[i].selected){
//         fiveDay++;
//         document.getElementByClass("fiveDay").innerHTML = text;
//         console.log(i)
//     };
//   } if (previousCities[0]) {
//         previousCities = $.grep(previousCities, function (savedCities) {
//           return id !== storedCity.id;
//         });
//       }

function displayCities() {
  cityListEl.empty();
  var previousCities = JSON.parse(localStorage.getItem("previousCities")) || [];

  previousCities.forEach(function (city) {
    var cityEl = document.createElement("div");
    cityEl.setAttribute("class", "col-12 city");
    cityEl.textContent = city;
    cityListEl.append(cityEl);
  });

  // previousCities.splice(8);
  // var sortedCities = [...previousCities];
  // sortedCities.sort(compare);
  // sortedCities.forEach(function (location) {
  //     var cityDiv = $("<div>").addClass("col-12 city");
  //     var cityBtn = $("<button>")
  //         .addClass("btn btn-light city-btn")
  //         .text(location.city);
  //     cityDiv.append(cityBtn);
  //     cityListEl.append(cityDiv);
  //     var savedCities = JSON.parse(localStorage.getItem("previousCities"));
  //     if (savedCities) {
  //         previousCities = savedCities;
  //     }
  // });
}

// function savedCities(cityInput) {
//     localStorage.setItem("previousCities", JSON.stringify(previousCities));
// }

// function fetchByUVIndexColor(){
//     // var apiURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}`
//      fetch()
//      .then(function(res){
//         return res.json()
//      })
//      .then(function(data){
//         console.log(data)
//         var uvi = data.current.uvi;
//         fetchByUVIndexColor(uvi);
//         console.log(data.current.uvi)
//      })}

//      .then(function(data){
//     var uvIndex = response.current.uvi;
//     var uvColor = setUVIndexColor(uvIndex);
//     uvIndexEl.text(response.current.uvi);
//     uvIndexEl.attr('style', `background-color: ${uvColor}; color: ${uvColor === "yellow" ? "black" : "white"}`);
//     $.ajax({
//         url: apiURL,
//         method: "GET",
//     }).then(function (res) {
//         var uvI = res.value;
//         $(".uvIndex").text("UV Index: " + uvI)})
// var fiveDay = response.daily;
// function setUVIndexColor(){
//     if (uvi < 3) {
//         return 'green';
//     } else if (uvi >= 3 && uvi < 6) {
//         return 'yellow';
//     } else if (uvi >= 6 && uvi < 8) {
//         return 'orange';
//     } else if (uvi >= 8 && uvi < 11) {
//         return 'red';
//     } else return 'purple';
// }

searchBtn.on("click", handleUserInput);
displayCities();

cityListEl.on("click", function(event){
let city = event.target.textContent
fetchByCityName(city)
});
''