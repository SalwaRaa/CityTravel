const fetchWeatherKey = "ec4664d38e3b79b848bd5c211b6c69bf";
const attractionClientID = "4BW4Z1VVYDITXLBFWAOJCD5H1BI310NT3UFAAYS5GMZWQTTQ";
const attractionClientSecret = "GR22135U0U2JE3SHAKSNGXLZJKPBEXK4MNH2KWGVO3F4BFEI";
const fourSquareDate = "20210224";
//hämtar weather-container, attraction-container, error-container, form
const form = document.querySelector("form");
const weatherContainer = document.querySelector('#weather-container');
const attractionContainer = document.querySelector("#attraction-container");
const errorContainer = document.querySelector('#error-container')

class Weather {
    constructor(name, temp, desc, iconUrl) {
        this._name = name;
        this._temp = temp;
        this._desc = desc;
        this._iconUrl = iconUrl;
    }
}

class Attraction {
    constructor(name, address, iconUrl) {
        this._name = name;
        this._adress = address;
        this._iconUrl = iconUrl;
    }
}

const executeSearch = async () => {
    //rensar sidan varje gång en ny search görs, alltså får weatherContainer en tom sträng
    weatherContainer.innerHTML = "";
    attractionContainer.innerHTML = "";
    errorContainer.innerHTML = "";
    //value = gives u the text that is written in the elemnt right now
    const search = form.elements[0].value;
    console.log(search)
    //skickar in värdet av det jag skriver i search-baren
    const onlyWeather = document.querySelector("#weather-checkbox").checked;
    const onlyAttractions = document.querySelector("#attractions-checkbox").checked;
    const filter = document.querySelector("#filter-checkbox").checked;

    if (onlyWeather === true & onlyAttractions === true || onlyWeather === false & onlyAttractions === false) {
        await fetchWeather(search)
        await fetchAttraction(search, filter)
    }
    else if (onlyWeather === true & onlyAttractions === false) {
        await fetchWeather(search)
    }
    else if (onlyWeather === false & onlyAttractions === true) {
        await fetchAttraction(search, filter)
    }
}

const fetchWeather = async (search) => {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${search}&units=metric&appid=${fetchWeatherKey}`)
    const data = await response.json();
    console.log(data);
    try {
        //vi hämtar info från API och lagrar det i mitt weather objekt och sparar det sedan i variabeln weatherInfo
        const weatherInfo = new Weather(data.name, data.main.temp, data.weather[0].description, `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`);
        console.log(weatherInfo);
        //skickar in weatherInfo som skrivs ut på DOM elementen som skapas
        createWeatherElement(weatherInfo);
    }
    catch (error) {
        console.log(error);
        createErrorElement();
    }
}

const fetchAttraction = async (search, filter) => {
    const response = await fetch(`https://api.foursquare.com/v2/venues/explore?client_id=${attractionClientID}&client_secret=${attractionClientSecret}&near=${search}&v=${fourSquareDate}&limit=5`);
    const data = await response.json();
    console.log(data);

    //eftersom det är en array med items så skapade jag en lista med items för att få ut det itemet jag vill åt som finns på position 0
    //eftersom jag bara vill åt 3 element i arrayn så använder jag mig av .map för att retunera en ny arry med dem specifika itemsen
    //sedan lagrar jag datan i mitt attraktion objekt
    try {
        let attractionList = data.response.groups[0].items.map(item => {
            let name = item.venue.name;
            let address = item.venue.location.address;
            let iconUrl = `${item.venue.categories[0].icon.prefix}64${item.venue.categories[0].icon.suffix}`;
            return new Attraction(name, address, iconUrl)
        })
        console.log(attractionList);
        if (filter === true) {
            attractionList = attractionList.sort((a, b) => {
                let nameA = a._name.toLowerCase(), nameB = b._name.toLowerCase();
                if (nameA < nameB) //leaves the list unchanged
                    return -1;
                if (nameA > nameB) // changed list where b is sorted before a
                    return 1;
                return 0; // list unchanged with respect to each other (a equal to b), but sorted with respect to all different elements.  
            });
        }
        attractionList.forEach(attraction => createAttractionElement(attraction._name, attraction._adress, attraction._iconUrl));
    }
    catch (error) {
        console.log(error);
        createErrorElement();
    }
}

const createWeatherElement = async weatherInfo => {
    const tmpWeatherContainer = document.createElement("div");
    const weatherName = document.createElement("h3");
    const weatherTemp = document.createElement("p");
    const weatherDesc = document.createElement("p");
    const weatherIcon = document.createElement("img");
    weatherIcon.src = weatherInfo._iconUrl;
    //innerHTML = reads and replaces a given DOM element (HTML-tag)
    weatherName.innerHTML = weatherInfo._name;
    weatherTemp.innerHTML = `Temperature: ${weatherInfo._temp} Celsius`;
    weatherDesc.innerHTML = `Description: ${weatherInfo._desc}`;
    tmpWeatherContainer.appendChild(weatherName);
    tmpWeatherContainer.appendChild(weatherTemp);
    tmpWeatherContainer.appendChild(weatherDesc);
    tmpWeatherContainer.appendChild(weatherIcon);
    weatherContainer.appendChild(tmpWeatherContainer);
}

const createAttractionElement = async (name, address, iconUrl) => {
    const tmpattractionContainer = document.createElement("div");
    const attractionName = document.createElement("h3");
    const attractionAddress = document.createElement("p");
    const attractionIcon = document.createElement("img");
    attractionName.innerHTML = name;
    attractionAddress.innerHTML = address;
    attractionIcon.src = iconUrl;
    tmpattractionContainer.appendChild(attractionName);
    tmpattractionContainer.appendChild(attractionAddress);
    tmpattractionContainer.appendChild(attractionIcon);
    attractionContainer.appendChild(tmpattractionContainer);
}

const createErrorElement = async () => {
    const tmpErrorContainer = document.createElement("div");
    const errorMessage = document.createElement("h3");
    errorMessage.innerHTML = "Sorry the service is currently down, please try again later";
    tmpErrorContainer.appendChild(errorMessage);
    errorContainer.appendChild(tmpErrorContainer);
}


