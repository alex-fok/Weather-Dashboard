const updateCurrentWeather = (current) => {

}

const updateWeatherForecast = (forecast) => {

}

(() => {
    let weatherInfo;

    const requestWeatherInfo = (coord, APIKey, resolve) => {
        const httpRequest = new XMLHttpRequest();
        const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${coord.lat}&lon=${coord.lon}&exclude=minutely,hourly,alerts&appid=${APIKey}&units=imperial`;

        const retrieveWeather = () => {
            if (httpRequest.readyState !== XMLHttpRequest.DONE)
                return;
            httpRequest.status !== 200 ? resolve(null) : resolve(JSON.parse(httpRequest.responseText));
        }
        httpRequest.onreadystatechange = retrieveWeather;
        httpRequest.open("GET", url, true);
        httpRequest.send();
    }
    
    document.getElementById("searchBtn").addEventListener("click", () => {
        const city = document.getElementById("searchInput").value.toLocaleLowerCase("en-us");
        const {APIKey} = config;
        
        if (!cities[city]) return;
        new Promise((resolve) =>{requestWeatherInfo(cities[city], APIKey, resolve)
        }).then(data => {
            const date = new Date(parseInt(data.current.dt)*1000).toLocaleDateString('en-US');
            console.log(date);
            
        });
    });
    
})();