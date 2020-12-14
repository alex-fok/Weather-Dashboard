const formatCityName = (name) => {
    let copy = name.slice(1).split("");
    copy = copy.map((char, i) => name[i] === " " ? char.toUpperCase() : char)
    return [name[0].toUpperCase(), ...copy].join("");
}

const arrangeMenuHeight = () => {
    const menu = document.getElementById("menu");
    const weatherInfo = document.getElementById("weatherInfo");

    if (weatherInfo.hasChildNodes() && menu.classList.contains("h-100"))
        menu.classList.remove("h-100");
    else
        menu.classList.add("h-100");
}

const updateCitiesDisplay = (cities, handleWeatherUpdate, selected = "") => {
    const list = document.getElementById("cityList");
    
    // Clear current list elements
    while (list.hasChildNodes())
        list.removeChild(list.firstChild)
    
    // Add children
    cities.forEach(city => {
        const entry = document.createElement("a");
        entry.classList.add("list-group-item", "list-group-item-action", "city-list-item");
        if (city === selected)
            entry.classList.add("active");

        entry.setAttribute("data-city", city);
        entry.setAttribute("style", "cursor: pointer");
        entry.textContent = formatCityName(city);

        entry.addEventListener("click", (event) => {
            handleWeatherUpdate(event.target.dataset.city);
            const active = document.querySelector(".list-group .city-list-item.active");
            if (active)
                active.classList.remove("active");
            event.target.classList.add("active");
        });
        list.append(entry);
    })
}

const updateWeatherDisplay = (weatherObj) => {
    const info = document.getElementById("weatherInfo");
    
    // Clear child elements before update
    while (info.hasChildNodes())
        info.removeChild(info.firstChild)
    
    // Create element that holds information
    const createLayoutEl = (tag, attr) => {
        const el = document.createElement(tag);
        const keys = Object.keys(attr);
        keys.forEach(key => {
            el.setAttribute(key, attr[key])
        })
        return el;
    }
    // Create Element that displays text
    const createTextEl = (tag, text, attr={}) => {
        const el = document.createElement(tag);
        el.textContent = text;
        const keys = Object.keys(attr);
        keys.forEach(key => {
            el.setAttribute(key, attr[key])
        })
        return el;
    }
    // Create img element for icon
    const createIcon = (src) => {
        const img = document.createElement("img");
        img.setAttribute("src", src);
        img.setAttribute("style", "width: max-content; height: max-content");
        return img;
    }
    // Create badge for UV Index
    const createUVIBadge = (uvi) => {
        const badge = document.createElement("span");
        const bgStyle = uvi < 3 ? "bg-success" : uvi < 8 ? "bg-warning" : "bg-danger";
        badge.classList.add("badge", bgStyle);
        badge.textContent = uvi;
        return badge;
    }

    // Update display for current weather
    const updateWeatherCurrent = (today) => {
        const {name, date, icon, temp, humidity, windSpeed, uvi} = today;

        // Wrapper for card
        const currentRow = createLayoutEl("div", {"class": "row mx-0"});
        const currentCol = createLayoutEl("div", {"class": "col-sm px-0"});
        
        // Card as container for current weather
        const card = createLayoutEl("div", {"class": "card"});
        const cardBody = createLayoutEl("div", {"class": "card-body"});

        // City name, date, weather icon as title
        const titleEl = createTextEl("h2", `${formatCityName(name)} (${date}) `, {"class": "card-title"});
        titleEl.appendChild(createIcon(icon));

        // Other weather info
        const temperatureEl = createTextEl("p", `Temperature: ${temp} \u2109`, {"class": "card-text"});
        const humidityEl = createTextEl("p", `Humidity: ${humidity} %`, {"class": "card-text"});
        const windSpeedEl = createTextEl("p", `Wind Speed: ${windSpeed} MPH`, {"class": "card-text"});
        const uviEl = createTextEl("p", `UV Index: `, {"class": "card-text"});
        uviEl.appendChild(createUVIBadge(uvi));

        // Append elements to their parent
        cardBody.append(titleEl, temperatureEl, humidityEl, windSpeedEl, uviEl)
        card.appendChild(cardBody);
        currentCol.appendChild(card);
        currentRow.appendChild(currentCol);
        info.appendChild(currentRow);
    }
    // Update display for weather forecast
    const updateWeatherForecast = (forecast) => {
        // Wrapper for forecast
        const forecastRow = createLayoutEl("div", {"class": "row mx-0"});
        const forecastCol = createLayoutEl("div", {"class": "col-sm mt-3 p-0"});

        // Inner container for forecast
        const innerContainer = createLayoutEl("div", {"class": "container-fluid px-0 mt-3"});

        // Title for forecast
        const titleRow = createLayoutEl("div", {"class": "row mx-0"});
        const titleCol = createLayoutEl("div", {"class": "col px-0"});
        const title = createTextEl("h3", "5-Day Forecast:", {"class": "px-0"});

        // Card set, a collection of cards
        const cardSet = createLayoutEl("div", {"class": "row row-cols-2 mx-0 justify-content-between"});
        forecast.forEach((day)=> {
            const {date, icon, temp, humidity} = day;

            // Wrapper, the card and the card body
            const cardWrapper = createLayoutEl("div", {"class": "col-sm-2 p-0 mx-0"});
            const card = createLayoutEl("div", {"class": "card bg-primary"});
            const cardBody = createLayoutEl("div", {"class": "card-body p-2"});
            
            // Date and weather info
            const dateEl = createTextEl("h6", date, {"class": "card-title"});
            const iconEl = createIcon(icon);
            const tempEl = createTextEl("p", `Temp: ${temp} \u2109`, {"class": "card-text"});
            const humidityEl = createTextEl("p", `Humidity: ${humidity}%`, {"class": "card-text"});

            // Append card to card set
            cardBody.append(dateEl, iconEl, tempEl, humidityEl);
            card.append(cardBody);
            cardWrapper.appendChild(card);
            cardSet.appendChild(cardWrapper);
        })

        // Append elements to their parent
        titleCol.appendChild(title);
        titleRow.appendChild(titleCol);
        innerContainer.append(titleRow, cardSet);
        forecastCol.appendChild(innerContainer);
        forecastRow.appendChild(forecastCol);
        info.appendChild(forecastRow);
    }

    // Call functions for updating weather info (current, forecast)
    updateWeatherCurrent(weatherObj.today);
    updateWeatherForecast(weatherObj.forecast);
    // Display weather info block
    info.setAttribute("style", "display: block");
}

const getWeatherObj = (city, data) => {
    const {current, daily} = data;
    const getDate = (unixTime) => new Date(parseInt(unixTime)*1000).toLocaleDateString('en-US');

    return ({
        today: {
            "name": city,
            "date": getDate(current.dt),
            "icon": `http://openweathermap.org/img/wn/${current.weather[0].icon}.png`,
            "temp": `${current.temp}`,
            "humidity": `${current.humidity}`,
            "windSpeed": `${current.wind_speed}`,
            "uvi": `${current.uvi}`
        },
        forecast: daily.slice(1, 6).map(day => {
            return({
                "date": getDate(day.dt),
                "icon": `http://openweathermap.org/img/wn/${day.weather[0].icon}.png`,
                "temp": `${day.temp.day}`,
                "humidity": `${day.humidity}`
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
            requestWeatherInfo(cities[city], config.APIKey, resolve, reject);
        }).then(data => {
            updateWeatherDisplay(getWeatherObj(city, data));
        }).catch(msg => {
            console.log(msg);
        });
    }

    const updateList = (option, city) => {
        if (option === "add") {
            const i = cityList.indexOf(city) + 1;
            cityList.unshift(city);
            if (i)
                cityList = [...cityList.slice(0, i), ...cityList.slice(i + 1)];
            else if (cityList.length > 10)
                cityList.pop();
        } else {
            const i = cityList.indexOf(city);
            cityList = [...cityList.slice(0, i), ...cityList.slice(i + 1)];
        }
        localStorage.setItem("cityList", cityList.toString());
        updateCitiesDisplay(cityList, handleWeatherUpdate, city);
    }

    const initEventListeners = () => {
        // Handle event where user searches for a city
        document.getElementById("searchBtn").addEventListener("click", () => {
            const city = document.getElementById("searchInput").value.toLocaleLowerCase("en-us").trim();
            //const city = "seattle";
            if (!cities[city]) return;
       
            // Update local storage
            updateList("add", city);
            // Initialize ajax call
            handleWeatherUpdate(city);
            document.getElementById("searchInput").blur();
        });
        document.getElementById("searchInput").addEventListener("keydown", (event) => {
            if (event.key === "Enter")
                document.getElementById("searchBtn").click();
        }) 
    }
    updateCitiesDisplay(cityList, handleWeatherUpdate);
    initEventListeners();
})();