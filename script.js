/* Global Variable
 */
const CITY_LIST_MAX_LENGTH = 8;

/* Helper functions
 */
// Update list and return it
const updateList = (option, cityArr, city) => {

    const i = cityArr.indexOf(city);
    let arr = option === "add" ? 
        // if city already existed, move city to top
        i >= 0 ?
            [city, ...cityArr.slice(0, i), ...cityArr.slice(i + 1)]
        // else if list is already full, remove oldest record on list and add in new entry
        : cityArr.length === CITY_LIST_MAX_LENGTH ?
            [city,...cityArr.slice(0, CITY_LIST_MAX_LENGTH - 1)]
            // else combine 
        : [city, ...cityArr]
    // option === delete
    : [...cityArr.slice(0, i), ...cityArr.slice(i + 1)];
    
    return arr; 
}
// Get weather object for rendering weather info
const getWeatherObj = (city, data) => {
    const {current, daily} = data;
    const getDate = (unixTime) => new Date(parseInt(unixTime)*1000).toLocaleDateString("en-US");

    return ({
        today: {
            "name": city,
            "date": getDate(current.dt),
            "icon": `https://openweathermap.org/img/wn/${current.weather[0].icon}.png`,
            "temp": `${current.temp}`,
            "humidity": `${current.humidity}`,
            "windSpeed": `${current.wind_speed}`,
            "uvi": `${current.uvi}`
        },
        forecast: daily.slice(1, 6).map(day => {
            return({
                "date": getDate(day.dt),
                "icon": `https://openweathermap.org/img/wn/${day.weather[0].icon}.png`,
                "temp": `${day.temp.day}`,
                "humidity": `${day.humidity}`
            })
        })
    })
}
// Capitalize every word in city name
const formatCityName = (name) => {
    let copy = name.slice(1).split("");
    copy = copy.map((char, i) => name.charAt(i) === " " ? char.toUpperCase() : char)
    return [name.charAt(0).toUpperCase(), ...copy].join("");
}
// Create element that holds information
const createLayoutEl = (tag, attr={}) => {
    const el = document.createElement(tag);
    const keys = Object.keys(attr);
    keys.forEach(key => {
        el.setAttribute(key, attr[key])
    })
    return el;
}
// Create element that displays text
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

/* Event handlers
 */
// Show close button when mouse is over entry
const handleEntryMouseOver = (event) => {
    const closeBtn = event.currentTarget.childNodes.item(1);
    closeBtn.style.visibility = "visible";
}
// Hide close button when mouse leaves entry
const handleEntryMouseLeave = (event) => {
    const closeBtn = event.currentTarget.childNodes.item(1);
    closeBtn.style.visibility = "hidden";
}
// Show weather info when entry is clicked
const handleEntryClick = (event) => {
    if (event.target.nodeName === "BUTTON") return;

    const name = event.currentTarget.dataset.city;
    const active = document.querySelector(".list-group .city-list-item.active");
    if (active)
        active.classList.remove("active");
    event.currentTarget.classList.add("active");
    startWeatherUpdate(name);
}
// Remove entry from list when close button inside is clicked
const handleEntryCloseBtnClick = (event, getCityList, setCityList) => {
    
    const parentNode = event.currentTarget.parentNode;
    const isActive = parentNode.classList.contains("active");
    const currentCity = parentNode.dataset.city;
    
    // Remove city list item from list 
    parentNode.parentNode.removeChild(parentNode);

    // If currently removed item is active, update display and clear lastViewed
    if (isActive){
        updateWeatherDisplay(null);
        localStorage.setItem("lastViewed", "");
    }
    // Remove city from city list
    setCityList(updateList("delete", getCityList(), currentCity));
}
// Search for weather of city when search button is clicked
const handleSearchBtnClick = (getCityList, setCityList) => {
    document.getElementById("searchInput").blur();
    const city = document.getElementById("searchInput").value.toLocaleLowerCase("en-us").trim();
    //const city = "seattle";
    if (!cities[city]) return;

    // Update local storage
    setCityList(updateList("add", getCityList(), city));
    // Update HTML
    updateCitiesDisplay(getCityList, setCityList, startWeatherUpdate, city);
    // Initialize ajax call
    startWeatherUpdate(city);
};
// Trigger search for weather when "Enter" is pressed and input field in focus
const handleEnterKeyPressed = (event) => {
    if (event.key === "Enter")
        document.getElementById("searchBtn").click();
}

/* Functions to make change on webpage
 */
// Update city list in HTML
const updateCitiesDisplay = (getCityList, setCityList, startWeatherUpdate, selected) => {
    const cityListEl = document.getElementById("cityList");
    
    // Clear current entries
    while (cityListEl.hasChildNodes())
        cityListEl.removeChild(cityListEl.firstChild)
    
    // Add entries
    getCityList().forEach(city => {
        const entry = createLayoutEl("a", {
            "class": "list-group-item list-group-item-action city-list-item",
            "data-city": city,
            "style": "cursor: pointer"
        });
        if (city === selected)
            entry.classList.add("active");

        // Add displaying text (city name) and close button
        const cityTextEl = createTextEl("div", formatCityName(city),{"style": "display: inline"});
        const closeButton = createLayoutEl("button", {
            "type": "button",
            "class": "btn-close btn-sm float-end",
            "style": "visibility: hidden"
        });
        
        entry.addEventListener("click", handleEntryClick);
        entry.addEventListener("mouseover", handleEntryMouseOver);
        entry.addEventListener("mouseleave", handleEntryMouseLeave);

        closeButton.addEventListener("click", (event) => {
            handleEntryCloseBtnClick(event, getCityList, setCityList)
        });

        entry.append(cityTextEl, closeButton);
        cityListEl.append(entry);
    })
}
// Update Weather Display in HTML
const updateWeatherDisplay = (weatherObj) => {
    const info = document.getElementById("weatherInfo");
    
    // Clear child elements before update
    while (info.hasChildNodes())
        info.removeChild(info.firstChild)

    // Return if weatherObj is empty
    if (!weatherObj) return;

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

        // Weather info
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
        const forecastRow = createLayoutEl("div", {"class": "row mx-0 my-3"});
        const forecastCol = createLayoutEl("div", {"class": "col-sm p-0"});

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
            const card = createLayoutEl("div", {"class": "card bg-primary h-100"});
            const cardBody = createLayoutEl("div", {"class": "card-body p-2"});
            
            // Date and weather info
            const dateEl = createTextEl("h6", date, {"class": "card-title"});
            const iconEl = createIcon(icon);
            const tempEl = createTextEl("p", `Temp: ${temp} \u2109`, {"class": "card-text"});
            const humidityEl = createTextEl("p", `Humidity: ${humidity}%`, {"class": "card-text"});

            // Append content to card, card to card set
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
    info.style.display = "block";
}

/* Make AJAX call and update DOM
 */
// Request weather info, then update display
const startWeatherUpdate = (city) => {

    // Make AJAX call to retrieve weather info
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
    new Promise((resolve, reject) =>{
        requestWeatherInfo(cities[city], config.APIKey, resolve, reject);
    }).then(data => {
        updateWeatherDisplay(getWeatherObj(city, data));
        localStorage.setItem("lastViewed", city);
    }).catch(msg => {
        console.error(msg);
    });
}

(() => {
    // Get cityLlist variable from storage
    const cityListString = localStorage.getItem("cityList");
    let cityListArr = cityListString ? cityListString.split(",") : [];
    let lastViewed = localStorage.getItem("lastViewed");

    const getCityList = () => cityListArr;
    const setCityList = (arr) => {
        cityListArr = arr;
        localStorage.setItem("cityList", arr);
    }
    const initEventListeners = () => {
        // Handle event where user searches for a city
        document.getElementById("searchBtn").addEventListener("click", () => {
           handleSearchBtnClick(getCityList, setCityList)
        });
        // Handle event where user clicks "Enter" when search input field is in focus
        document.getElementById("searchInput").addEventListener("keydown", handleEnterKeyPressed);
    }
    if (lastViewed)
        startWeatherUpdate(lastViewed);
    updateCitiesDisplay(getCityList, setCityList, startWeatherUpdate, lastViewed);
    initEventListeners();
})();