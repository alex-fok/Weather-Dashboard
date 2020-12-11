const updateCity = (temperature, humidity, windSpeed, UVIndex) => {
        
}

const updateForecast = () => {

}

(() => {

    let weatherInfo;

    const setWeatherInfo = (obj) => {
        console.log(obj);
    };

    const requestWeatherInfo = (coord, APIKey, resolve) => {
            const httpRequest = new XMLHttpRequest();
            const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${coord.lat}&lon=${coord.lon}&exclude=minutely,hourly,alerts&appid=${APIKey}`;

            const retrieveWeather = () => {
                if (httpRequest.readyState !== XMLHttpRequest.DONE)
                    return;
                
                httpRequest.status !== 200 ? resolve(null) : resolve(JSON.parse(httpRequest.responseText));
            }
            httpRequest.onreadystatechange = retrieveWeather;
            httpRequest.open("GET", url, true);
            httpRequest.send();
    }

    const requestCoordinatesInfo = (city, APIKey, resolve) => {
            const httpRequest = new XMLHttpRequest();
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${APIKey}`;

            const retrieveCoordinates = () => {
                if (httpRequest.readyState !== XMLHttpRequest.DONE)
                    return;
                httpRequest.status !== 200 ? resolve(null) : resolve(JSON.parse(httpRequest.responseText).coord);
            }

            httpRequest.onreadystatechange = retrieveCoordinates;
            httpRequest.open("GET", url, true);
            httpRequest.send();
    }

    document.getElementById("searchBtn").addEventListener("click", () => {
        // const city = document.getElementById("searchInput").value;
        const {APIKey} = config;
        const city = "tokyo";

        // Set Weather by making 2 api calls
        new Promise((resolve) =>{
            requestCoordinatesInfo(city, APIKey, resolve)
        }).then((coord) => {
            return new Promise((resolve) => {
                requestWeatherInfo(coord, APIKey, resolve)
            })
        }).then(setWeatherInfo)
    });
})();