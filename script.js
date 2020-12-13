const updateCitiesDisplay = (cities) => {
    const list = document.getElementById("cityList");
    
    // Clear current elements
    while (list.hasChildNodes())
        list.removeChild(list.firstChild)
    
    // Add children
    cities.forEach(city => {
        const entry = document.createElement("a");
        entry.classList.add("list-group-item", "list-group-item-action", "city-list-item");
        entry.setAttribute("href", `#${city}`);
        entry.setAttribute("value", city);
        entry.textContent = `${city.charAt(0).toUpperCase()}${city.slice(1)}`;
        list.append(entry);
    })
}

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
    // Get cityLlist variable from storage
    const cityListString = localStorage.getItem("cityList");
    let cityList = cityListString ? cityListString.split(",") : [];

    const handleWeatherUpdate = (city) => {
        new Promise((resolve, reject) =>{
            requestWeatherInfo(city, config.APIKey, resolve, reject);
        }).then(data => {
            updateWeatherDisplay(getWeatherObj(city, data));
        }).catch(msg => {
            console.log(msg);
        });
    }

    const initEventListeners = () => {
        const updateList = (option, city) => {
            if (option === "add") {
                const length = cityList.unshift(city);

                if (length > 10)
                    cityList.pop();
            } else {
                const i = cityList.indexOf(city);

                cityList = 
                    i === 0 ? 
                        cityList.shift(city)
                    : i === cityList.length-1 ?
                        cityList.pop(city) 
                    : [...cityList.slice(0, i), ...cityList.slice(i + 1)];
            }
            localStorage.setItem("cityList", cityList.toString());
            updateCitiesDisplay(cityList);
        }

        document.getElementById("searchBtn").addEventListener("click", () => {
            const city = document.getElementById("searchInput").value.toLocaleLowerCase("en-us").trim();
            
            if (!cities[city]) return;
       
            // Update local storage
            if (!cityList.includes(city))
                updateList("add", city);

            // Initialize ajax call
            handleWeatherUpdate(city);            
        });
    }
    updateCitiesDisplay(cityList);
    initEventListeners();
})();