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
      $('#search-history ul').append("<li class='bg-secondary rounded py-2 my-2'>"+ history[i].cityName +"</li>");
    }
  }
}

//will be called every time a search is made to add and remove li's as needed
//parameters take - cityname, lat, lon - values
var updateHistory = function(historyItem){
  var savedArr = loadHistory();  

  //prepend history item to beginning of li elements in history sidebar
  $('#search-history ul').prepend("<li id='history' class='bg-secondary rounded py-2 my-2'>"+ historyItem.cityName +"</li>");
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
      console.log('something');
      return i;
    }
  }
  return false;
}

//when a new city is searched this will be called. used to update history localstorage and call api using lat lon coords
var coordCall = function(data){  

  //gives error if invalid city and stops function
  if (data.cod == 404) {
    $('#city-selected').val('City not found!');
    setTimeout(function(){
      $('#city-selected').val('');
    }, 1000);    
    return;
  }

  var apiKey = '8abfb1fec87fdcfb0046a4eafb7171fb';
  var newHistory ={
    cityName: data.name,
    lat: Math.trunc(data.coord.lat),
    lon: Math.trunc(data.coord.lon)
  };
  var forecastUrl = "https://api.openweathermap.org/data/2.5/onecall?lat="+ newHistory.lat +"&lon="+ newHistory.lon +"&exclude=minutely,hourly,alerts&units=imperial&appid="+ apiKey;
  
  updateHistory(newHistory);
  
  fetch(forecastUrl)
    .then(response => response.json())
    .then(data => forecastCall(data, newHistory.cityName));
}

// gets all the good stuff and fills in the actual dashboard elements
var forecastCall = function(data, cityName){
  dashboardEl(data, cityName);
  forecastEl(data.daily);
}

var convertDate = function(num){
  var myDate = new Date(num * 1000);
  var date = myDate.toLocaleString().split(',')[0];
  return date;
}

var uvIndex = function (uv){
  var color;
  if (uv <= 2) {
    color = 'bg-green';
  }
  else if (uv >= 3 && uv <= 5) {
    color = 'bg-yellow';
  }
  else if (uv >= 6 && uv <= 7) {
    color = 'bg-orange';
  }
  else if (uv >= 8 && uv <= 10) {
    color = 'bg-red';
  }
  else if (uv >= 11) {
    color = 'bg-violet';
  }
  return color;
}

var dashboardEl = function(data, cityName){
  var date = convertDate(data.current.dt);
  var temp = data.current.temp;
  var wind = data.current.wind_speed;
  var humidity = data.current.humidity;
  var uv = data.current.uvi;
  console.log(data);
  $('#weather-city')
    .empty()
    .append("<h2>"+ cityName +" "+ date +"</h2><p>Temp: "+ temp +"</p><p>Wind: "+ wind +" MPH</p><p>Humidity: "+ humidity +"</p><p>UV Index: <span class='rounded "+ uvIndex(uv) +" p-1'>"+ uv +"</span></p>");
  
  
}
var forecastEl = function (daily){

}

// when search is submitted first check history array
var searchHandler = function(event){
  event.preventDefault();

  var userInput = $('#city-selected').val();
  if (userInput == ''){return;}//if user made no input nothing happens
  $('#city-selected').val('');

  var apiKey = '8abfb1fec87fdcfb0046a4eafb7171fb';
  var coordUrl = "https://api.openweathermap.org/data/2.5/weather?q="+ userInput.replace(/\s/g, "+") +"&appid="+ apiKey;  
  
  var check = checkHistory(userInput);
  if (check === false) {
    fetch(coordUrl)
        .then(response => response.json())
        .then(data => coordCall(data));    
  }
  else {
    var load = loadHistory();
    var forecastUrl = "https://api.openweathermap.org/data/2.5/onecall?lat="+ load[check].lat +"&lon="+ load[check].lon +"&exclude=minutely,hourly,alerts&units=imperial&appid="+ apiKey;
    var cityName = load[check].cityName;
    
    fetch(forecastUrl)
    .then(response => response.json())
    .then(data => forecastCall(data, cityName));
  }
}


createHistory();
$('#city-submit').on("click", searchHandler);