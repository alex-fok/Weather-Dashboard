const updateWeatherDisplay = (weatherObj) => {
    console.log(weatherObj);
}

const getWeatherObj = (city, data) => {
    const {current, daily} = data;

    const getDate = (unixTime) => new Date(parseInt(unixTime)*1000).toLocaleDateString('en-US');

    return ({
        today: {
            "name": city,
            "date": getDate(current.dt),
            "icon": `http://openweathermap.org/img/wn/${current.weather[0].icon}.png`,
            "temp": `${current.temp} \u2109`,
            "humidity": `${current.humidity} %`,
            "windSpeed": `${current.wind_speed} MPH`,
            "uvi": `${current.uvi}`
        },
        forecast: daily.slice(1, 6).map(day => {
            return({
                "date": getDate(day.dt),
                "icon": `http://openweathermap.org/img/wn/${day.weather[0].icon}.png`,
                "temp": `${day.temp.day} \u2109`,
                "humidity": `${day.humidity} %`
            })
        })
    })
}

const requestWeatherInfo = (coord, APIKey, resolve, reject) => {
    const httpRequest = new XMLHttpRequest();
    const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${coord.lat}&lon=${coord.lon}&exclude=minutely,hourly,alerts&appid=${APIKey}&units=imperial`;

    httpRequest.onreadystatechange = () => {
        if (httpRequest.readyState !== XMLHttpRequest.DONE) return;

        httpRequest.status !== 200 ? reject("Weather info not available. Please try again.") : resolve(JSON.parse(httpRequest.responseText)); 
    };
    httpRequest.open("GET", url, true);
    httpRequest.send();
}

(() => {
    document.getElementById("searchBtn").addEventListener("click", () => {
        const city = document.getElementById("searchInput").value.toLocaleLowerCase("en-us").trim();
        
        if (!cities[city]) return;

        new Promise((resolve, reject) =>{
            requestWeatherInfo(cities[city], config.APIKey, resolve, reject);
        }).then(data => {
            updateWeatherDisplay(getWeatherObj(city, data));
        }).catch(msg => {
            console.log(msg);
        });
    });
})();