var queryWeather = function(){
    var cityName = $('#city-selected').val();
    cityName.replace(" ", '+');
    console.log(cityName);
    // var apiUrl = "https://api.openweathermap.org/data/2.5/weather?q="+ cityName +"&appid=8abfb1fec87fdcfb0046a4eafb7171fb";
    // console.log(apiUrl);
}

$('#city-submit').on("click", queryWeather);