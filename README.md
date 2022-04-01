# weatherDashboard
This project is made to understand API's. API used is OpenWeather: https://openweathermap.org/ 
## Features
- user can search a city by name and API will return weather as well as 5 day forecast
- safety checks to stop funciton if city name doesnt exist
- user searches are saved in local storage (10 max)
- user can click a history item to search again without having to retype a city
## User Story
```
AS A traveler
I WANT to see the weather outlook for multiple cities
SO THAT I can plan a trip accordingly
```
## Acceptance Criteria
```
GIVEN a weather dashboard with form inputs
WHEN I search for a city
THEN I am presented with current and future conditions for that city and that city is added to the search history
WHEN I view current weather conditions for that city
THEN I am presented with the city name, the date, an icon representation of weather conditions, the temperature, the humidity, the wind speed, and the UV index
WHEN I view the UV index
THEN I am presented with a color that indicates whether the conditions are favorable, moderate, or severe
WHEN I view future weather conditions for that city
THEN I am presented with a 5-day forecast that displays the date, an icon representation of weather conditions, the temperature, the wind speed, and the humidity
WHEN I click on a city in the search history
THEN I am again presented with current and future conditions for that city
```
## Live page 
https://uhmammoth.github.io/weatherDashboard/
## Mock-up
![example](./assets/images/06-server-side-apis-homework-demo.png)