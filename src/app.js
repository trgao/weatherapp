var countries = require('i18n-iso-countries');
countries.registerLocale(require('i18n-iso-countries/langs/en.json'));
var moment = require('moment');

function searchURL(city) {
    return `https://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=20f7632ffc2c022654e4093c6947b4f4&units=metric`;
}

async function locationURL() {
    try {
        const location = await getLocation();
        return `https://api.openweathermap.org/data/2.5/weather?lat=${location.coords.latitude}&lon=${location.coords.longitude}&APPID=20f7632ffc2c022654e4093c6947b4f4&units=metric`;
    } catch(e) {
        console.log(e);
    }
}

function getLocation() {
    if (navigator.geolocation) {
        return new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej));
    } else {
        return {coords: {latitude: 1.3521, longitude: 103.8198}};
    }
}

async function fetchData(url) {
    try {
        const response = await fetch(url, {mode: 'cors'});
        const data = await response.json();
        
        if (!response.ok) {
            return 0;
        }

        return parseData(data);
    } catch(e) {
        console.log(e);
    }
}

export async function fetchLocation() {
    return await fetchData(await locationURL());
}

export async function fetchSearch(city) {
    return await fetchData(searchURL(city));
}

class dataObject {
    constructor(weather, city, country, temp, feels, humidity, wind, icon, time) {
        this.weather = weather;
        this.city = city;
        this.country = country;
        this.temp = temp;
        this.feels = feels;
        this.humidity = humidity;
        this.wind = wind;
        this.icon = icon;
        this.time = time;
    }
}

function parseData(data) {
    const weather = data.weather[0].description.toUpperCase();
    const city = data.name.toUpperCase();
    const country = countries.getName(data.sys.country, 'en').toUpperCase();
    const temp = data.main.temp.toFixed(1);
    const feels = data.main.feels_like.toFixed(1);
    const humidity = data.main.humidity;
    const wind = data.wind.speed;
    const icon = 'http://openweathermap.org/img/wn/' + data.weather[0].icon + '.png';
    const time = daynight(data.timezone, data.sys.sunrise, data.sys.sunset);

    const newdata = new dataObject(weather, city, country, temp, feels, humidity, wind, icon, time);
    if (storageAvailable('localStorage')) {
        localStorage.setItem('data', JSON.stringify(newdata));
    }
    return newdata;
}

export function daynight(offset, sunrise, sunset) {
    const time = moment().utc(true).utcOffset(offset).format('HH:mm').toString()
    const day = moment.unix(sunrise).utc(true).utcOffset(offset).format('HH:mm').toString();
    const night = moment.unix(sunset).utc(true).utcOffset(offset).format('HH:mm').toString();
    console.log(time);
    if (parseInt(time.slice(0, 2)) < parseInt(day.slice(0, 2)) || 
        (parseInt(time.slice(0, 2)) === parseInt(day.slice(0, 2)) && parseInt(time.slice(-2)) < parseInt(day.slice(-2))) ||
        parseInt(time.slice(0, 2)) > parseInt(night.slice(0, 2)) ||
        (parseInt(time.slice(0, 2)) === parseInt(night.slice(0, 2)) && parseInt(time.slice(-2)) > parseInt(night.slice(-2)))) {
        return 'night';
    } else {
        return 'day';
    }
}

//localStorage
function storageAvailable(type) {
    let storage;
    try {
        storage = window[type];
        const x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch (e) {
        return false;
    }
}

export function savedLocation() {
    if (storageAvailable('localStorage')) {
        return JSON.parse(localStorage.getItem('data'));
    }
}