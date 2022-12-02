import './style.css';
import { fetchLocation, fetchSearch, savedLocation } from './app';

async function init() {
    const container = document.createElement('div');
    container.id = 'container';
    container.innerHTML = `
        <span><h1 id="temp" class="temp">-</h1><p class="temp">&#8451</p></span>
        <div id="section">
            <h1 id="weather">-</h1>
            <h1 id="location">-, -</h1>
            </br>
            <div id="info">
                <div>
                    <h1 id="feels">FEELS LIKE: -&#8451</h1>
                    <h1 id="humidity">HUMIDITY: -%</h1>
                    <h1 id="wind">WIND SPEED: -m/s</h1>
                </div>
            </div>
        </div>
    `;

    const search = document.createElement('input');
    search.type = 'search';
    search.placeholder = 'Search City';
    search.id = 'search';
    search.addEventListener('input', () => search.setCustomValidity(''));

    const alert = document.createElement('p');
    alert.textContent = 'LOADING CURRENT LOCATION WEATHER...';
    alert.id = 'alert';

    document.body.append(alert, search, container);

    if (savedLocation() !== null) {
        updateText(savedLocation());
    }
    const refresh = await updateLocation();
    document.getElementById('alert').style.display = 'none';

    document.addEventListener('keypress', async (event) => {
        if (event.key === 'Enter') {
            const data = await fetchSearch(search.value);
            if (data === 0) {
                search.setCustomValidity("No results found");
                search.reportValidity();
            } else {
                search.value = '';
                search.blur();
                clearInterval(refresh);
                updateText(data);
            }
        }
    });
}

function updateText(data) {
    document.getElementById('weather').innerText = data.weather;
    document.getElementById('location').innerText = data.city + ', ' + data.country;
    document.getElementById('temp').innerText = data.temp;
    document.getElementById('feels').innerHTML = 'FEELS LIKE: ' + data.feels + '&#8451';
    document.getElementById('humidity').innerText = 'HUMIDITY: ' + data.humidity + '%';
    document.getElementById('wind').innerText = 'WIND SPEED: ' + data.wind + 'm/s';

    const icon = !document.getElementById('icon') ? document.createElement('img') : document.getElementById('icon');
    icon.id = 'icon';
    icon.src = data.icon;
    document.getElementById('info').append(icon);
    updateBackground(data.time);
}

function updateBackground(time) {
    if (time === 'night') {
        document.documentElement.style.setProperty('--color1', '#272727');
        document.documentElement.style.setProperty('--color2', '#F3EFDE');
        document.querySelector('img').style.filter = 'none';
    } else {
        document.documentElement.style.setProperty('--color1', '#F3EFDE');
        document.documentElement.style.setProperty('--color2', '#272727');
        document.querySelector('img').style.filter = 'invert(1)';
    }
}

async function updateLocation() {
    document.getElementById('alert').style.display = 'block';
    const location = await fetchLocation();
    if (location) {
        updateText(location);
        const refresh = setInterval(updateLocation, 60000);
        return refresh;
    }
}

init();