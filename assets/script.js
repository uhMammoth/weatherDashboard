// loadhistory from local storage otherwise set to empty
// local storage stores city name and lat lon coords
// create history elements using local storage city names
// if search is a history item pull lat lon and make api forecast call
// if search is new city make 2 api calls. one for coords one for forecast
// after every search save city name and lat lon coords to local storage
// after every search return load dashboard and 5 day forecast elements with new data
// only create dashboard elements once per page load


//load local storage for history items
var loadHistory = function(){
  var historyArr = JSON.parse(localStorage.getItem('history'));

  if(historyArr == null){
    historyArr = [];
  }
  return historyArr;  
}

//create history list elements on page load
var createHistory = function(){
  var history = loadHistory();
  if(history.length === 0){
    return;
  }
  else {
    for (let i = 0; i < history.length; i++) {
      $('#search-history ul').append("<li class='historyEl bg-secondary rounded py-2 my-2'>"+ history[i].cityName +"</li>");
    }
  }
}

//will be called every time a search is made to add and remove li's as needed
//parameters take - cityname, lat, lon - values
var updateHistory = function(historyItem){
  var savedArr = loadHistory();  

  //prepend history item to beginning of li elements in history sidebar
  $('#search-history ul').prepend("<li class='historyEl bg-secondary rounded py-2 my-2'>"+ historyItem.cityName +"</li>");
  savedArr.unshift(historyItem);

  //check if li elements are over 10 del extra from sidebar and loaded local storage
  if($('#search-history ul li').length >= 11){
    $('#search-history ul').children().last().remove();
    savedArr.pop();
  }
  localStorage.setItem('history', JSON.stringify(savedArr));  
}

//checks user input against localstorage history to see if a search has already been made of that city before to reduce api calls since we have been storing previous lat and lon coords
var checkHistory = function(input){
  var load = loadHistory();
  
  if (load.length === 0) {
    return false;
  }
  for (let i = 0; i < load.length; i++) {
    
    if (load[i].cityName.toLowerCase() === input.toLowerCase()) {
      return i;
    }
  }
  return false;
}

//when a new city is searched this will be called. used to update history localstorage and call api using lat lon coords
var coordCall = function(data, apiKey){  

  console.log(data);
  //gives error if invalid city and stops function
  if (data.cod == 404) {
    $('#city-selected').val('City not found!');
    setTimeout(function(){
      $('#city-selected').val('');
    }, 1000);    
    return;
  }
  var newHistory ={
    cityName: data.name,
    lat: Math.trunc(data.coord.lat),
    lon: Math.trunc(data.coord.lon)
  };
  fetchHandler(newHistory, apiKey);  
}

// handles the actual forecast and current weather call from either a new city or history city
var fetchHandler = function(newHistory, apiKey){
  var forecastUrl = "https://api.openweathermap.org/data/2.5/onecall?lat="+ newHistory.lat +"&lon="+ newHistory.lon +"&exclude=minutely,hourly,alerts&units=imperial&appid="+ apiKey;
  
  updateHistory(newHistory);
  
  fetch(forecastUrl)
    .then(response => response.json())
    .then(data => forecastCall(data, newHistory.cityName));
}

// gets all the good stuff and fills in the actual dashboard elements
var forecastCall = function(data, cityName){
  dashboardEl(data, cityName);
  forecastCards(data.daily);
}

//api returns epoch/unix time so this converts it to an actual date format without the time just the date
var convertDate = function(num){
  var myDate = new Date(num * 1000);
  var date = myDate.toLocaleString().split(',')[0];
  return date;
}

//returns css color for UV index scale
var uvIndex = function (uv){  
  var color;
  if (uv < 2) {
    color = 'bg-green';
  }
  else if ((uv >= 2) && (uv < 5)) {
    color = 'bg-yellow';
  }
  else if ((uv >= 5) && (uv < 7)) {
    color = 'bg-orange';
  }
  else if ((uv >= 7) && (uv < 10)) {
    color = 'bg-red';
  }
  else if (uv >= 10) {
    color = 'bg-violet';
  }  
  return color;
}

// updates main dashboard for that city
var dashboardEl = function(data, cityName){
  var date = convertDate(data.current.dt);
  var temp = data.current.temp;
  var wind = data.current.wind_speed;
  var humidity = data.current.humidity;
  var uv = data.daily[0].uvi;
  console.log(data);
  $('#weather-city')
    .empty()
    .append("<h2>"+ cityName +" "+ date +"</h2><p>Temp: "+ temp +"</p><p>Wind: "+ wind +" MPH</p><p>Humidity: "+ humidity +"</p><p>UV Index: <span class='rounded "+ uvIndex(uv) +" p-1'>"+ uv +"</span></p>");
  
}

// creates the 5 daily forecast cards. api also returns an icon number that you can plug into an existing url for the website. used those to fill cards as well
var forecastCards = function (daily){
  $('#cards').empty();
  for (let i = 1; i < 6; i++) {
    var day = daily[i];
    $('#cards')
      .append("<div class='card bg-dark text-light w-100 mx-1'><img class='card-img-top w-50 mt-2 mx-auto border rounded-circle' src='http://openweathermap.org/img/wn/"+ day.weather[0].icon +".png' alt=''><div class='p-2'><h3 class='text-center'>"+ convertDate(day.dt) +"</h3><p class='card-text'>Temp: "+ day.temp.day +"</p><p class='card-text'>Wind: "+ day.wind_speed +" MPH</p><p class='card-text'>Humidity: "+ day.humidity +"</p></div></div>");
  }
}

// when search is submitted first check history array
var searchHandler = function(event){  
  event.preventDefault();

  var userInput;
  if($(this).attr('id') === 'city-submit'){
    userInput = $('#city-selected').val();
    $('#city-selected').val('');
  }  
  else if($(this).is('li')){
    userInput = $(this).text();
  }
  if (userInput == ''){return;}//if user made no input nothing happens  

  var apiKey = '8abfb1fec87fdcfb0046a4eafb7171fb';
  var coordUrl = "https://api.openweathermap.org/data/2.5/weather?q="+ userInput.replace(/\s/g, "+") +"&appid="+ apiKey;  
  
  var check = checkHistory(userInput);
  if (check === false) {
    fetch(coordUrl)
        .then(response => response.json())
        .then(data => coordCall(data, apiKey));    
  }
  else {
    var load = loadHistory();
    var newHistory ={
      cityName: load[check].cityName,
      lat: load[check].lat,
      lon: load[check].lon
    };
    fetchHandler(newHistory, apiKey);    
  }
}

//history sidebar created on page load if there is any
createHistory();

//when submit or a history element is clicked start whole aapi calls and fill in data
$('#city-submit').on("click", searchHandler);
$(document).on("click", ".historyEl", searchHandler);