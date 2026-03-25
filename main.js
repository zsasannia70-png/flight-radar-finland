// Finland Bounding Box (Refined)
const LAMIN = 59.7;
const LOMIN = 19.1;
const LAMAX = 70.2;
const LOMAX = 31.7;

// Elements
const infoPanel = document.getElementById('info-panel');
const closeBtn = document.getElementById('close-btn');
const elCallsign = document.getElementById('flight-callsign');
const elStatus = document.getElementById('flight-status');
const elOrigin = document.getElementById('flight-origin');
const elDestination = document.getElementById('flight-destination');
const elSpeed = document.getElementById('flight-speed');
const elHeight = document.getElementById('flight-height');
const elTrack = document.getElementById('flight-track');
const elIcao24 = document.getElementById('flight-icao24');
const elLastContact = document.getElementById('last-contact');

// State
let map;
let airplaneMarkers = {}; // map icao24 -> marker
let selectedIcao24 = null;
let updateInterval;

function initMap() {
    // Center of Finland
    map = L.map('map', {
        zoomControl: false,
        attributionControl: false
    }).setView([65.0, 26.0], 5);

    L.control.zoom({
        position: 'bottomleft'
    }).addTo(map);

    // Dark theme tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 20
    }).addTo(map);

    L.control.attribution({ position: 'bottomright' }).addTo(map);
}

function closePanel() {
    infoPanel.classList.add('hidden');
    infoPanel.setAttribute('aria-hidden', 'true');
    if (selectedIcao24 && airplaneMarkers[selectedIcao24]) {
        const element = airplaneMarkers[selectedIcao24].getElement();
        if (element) {
            element.classList.remove('selected');
        }
    }
    selectedIcao24 = null;
}

closeBtn.addEventListener('click', closePanel);

// Create custom plane icon
function createPlaneIcon(rotation, isSelected) {
    return L.divIcon({
        html: `<div class="plane-icon" style="transform: rotate(${rotation}deg)"></div>`,
        className: `plane-icon-container${isSelected ? ' selected' : ''}`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
    });
}

function renderFlights(states) {
    const currentIcao24s = new Set();

    states.forEach(state => {
        const icao24 = state[0];
        const lat = state[6];
        const lon = state[5];
        const trueTrack = state[10] || 0; 
        
        if (lat === null || lon === null) return;
        
        // Finland bounds
        if (lat < LAMIN || lat > LAMAX || lon < LOMIN || lon > LOMAX) return;

        currentIcao24s.add(icao24);
        const isSelected = (icao24 === selectedIcao24);
        
        if (airplaneMarkers[icao24]) {
            airplaneMarkers[icao24].setLatLng([lat, lon]);
            airplaneMarkers[icao24].setIcon(createPlaneIcon(trueTrack, isSelected));
            airplaneMarkers[icao24].flightData = state;
        } else {
            const marker = L.marker([lat, lon], {
                icon: createPlaneIcon(trueTrack, isSelected)
            }).addTo(map);
            
            marker.flightData = state;
            marker.on('click', () => {
                selectFlight(icao24);
            });
            
            airplaneMarkers[icao24] = marker;
        }

        if (isSelected) {
            updateInfoPanelData(state);
        }
    });

    // Remove old markers
    Object.keys(airplaneMarkers).forEach(icao24 => {
        if (!currentIcao24s.has(icao24)) {
            map.removeLayer(airplaneMarkers[icao24]);
            delete airplaneMarkers[icao24];
            
            if (icao24 === selectedIcao24) {
                closePanel();
            }
        }
    });
}

async function selectFlight(icao24) {
    if (selectedIcao24 && airplaneMarkers[selectedIcao24]) {
        const element = airplaneMarkers[selectedIcao24].getElement();
        if (element) element.classList.remove('selected');
    }
    
    selectedIcao24 = icao24;
    
    if (airplaneMarkers[icao24]) {
        const element = airplaneMarkers[icao24].getElement();
        if (element) element.classList.add('selected');
        
        const state = airplaneMarkers[icao24].flightData;
        updateInfoPanelData(state);
        
        const callsign = (state[1] || '').trim();
        
        elOrigin.textContent = '...';
        elOrigin.classList.add('loading');
        elDestination.textContent = '...';
        elDestination.classList.add('loading');
        
        infoPanel.classList.remove('hidden');
        infoPanel.setAttribute('aria-hidden', 'false');

        if (callsign) {
            await fetchRouteDetails(callsign);
        } else {
            elOrigin.textContent = 'N/A';
            elOrigin.classList.remove('loading');
            elDestination.textContent = 'N/A';
            elDestination.classList.remove('loading');
        }
    }
}

function updateInfoPanelData(state) {
    const icao24 = state[0];
    const callsign = (state[1] || '').trim();
    const baroAltitude = state[7]; 
    const onGround = state[8];
    const velocity = state[9]; 
    const trueTrack = state[10];
    const timePosition = state[3]; 
    
    let alt = baroAltitude !== null ? Math.round(baroAltitude) : 0;
    let speedKmh = velocity !== null ? Math.round(velocity * 3.6) : 0;

    elCallsign.textContent = callsign !== '' ? callsign : icao24.toUpperCase();
    elIcao24.textContent = icao24;
    elSpeed.textContent = `${speedKmh} km/h`;
    elHeight.textContent = `${alt} m`;
    elTrack.textContent = trueTrack !== null ? `${Math.round(trueTrack)}°` : 'N/A';
    
    const lastSeen = new Date((timePosition || Date.now()/1000) * 1000);
    elLastContact.textContent = lastSeen.toLocaleTimeString();

    if (onGround) {
        elStatus.textContent = 'On Ground';
        elStatus.classList.add('ground');
    } else {
        elStatus.textContent = 'Airborne';
        elStatus.classList.remove('ground');
    }
}

async function fetchRouteDetails(callsign) {
    try {
        const url = `https://opensky-network.org/api/routes?callsign=${callsign}`;
        let response = await fetch(url);
        
        if (!response.ok) {
            // Fallback to proxy
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
            response = await fetch(proxyUrl);
            const proxyData = await response.json();
            const data = JSON.parse(proxyData.contents);
            updateRouteDisplay(data);
        } else {
            const data = await response.json();
            updateRouteDisplay(data);
        }
    } catch (e) {
        elOrigin.textContent = 'Unavailable';
        elDestination.textContent = 'Unavailable';
    } finally {
        elOrigin.classList.remove('loading');
        elDestination.classList.remove('loading');
    }
}

function updateRouteDisplay(data) {
    if (data && data.route && data.route.length >= 2) {
        elOrigin.textContent = data.route[0];
        elDestination.textContent = data.route[data.route.length - 1];
    } else {
        elOrigin.textContent = 'Unknown';
        elDestination.textContent = 'Unknown';
    }
}

async function fetchFlightData() {
    try {
        const url = `https://opensky-network.org/api/states/all?lamin=${LAMIN}&lomin=${LOMIN}&lamax=${LAMAX}&lomax=${LOMAX}`;
        let response = await fetch(url);
        
        if (!response.ok) {
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
            response = await fetch(proxyUrl);
            const proxyData = await response.json();
            const data = JSON.parse(proxyData.contents);
            if (data && data.states) renderFlights(data.states);
        } else {
            const data = await response.json();
            if (data && data.states) renderFlights(data.states);
        }
    } catch (e) {
        console.warn('Using mock data due to API limits/connectivity');
        const mockTime = Math.floor(Date.now() / 1000);
        renderFlights([
            ["43be5c", "FIN726", "Finland", mockTime, mockTime, 24.9, 60.1, 10000, false, 250, 45, 0, null, 10000],
            ["43be5d", "NOR123", "Finland", mockTime, mockTime, 23.7, 61.5, 8500, false, 210, 120, 0, null, 8500],
            ["43be5e", "HEL45", "Finland", mockTime, mockTime, 25.5, 65.0, 5000, false, 180, 270, 0, null, 5000]
        ]);
    }
}

// Init
initMap();
fetchFlightData();
setInterval(fetchFlightData, 10000);
