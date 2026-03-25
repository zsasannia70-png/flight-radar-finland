# Finland Flight Radar

A premium, real-time flight radar application specifically designed for the Finland airspace. Built using the OpenSky Network API and Leaflet, this application provides detailed flight information with a modern, glassmorphic user interface.

![Finland Flight Radar](https://img.shields.io/badge/Status-Active-success?style=for-the-badge&logo=air-force)
![Finland Only](https://img.shields.io/badge/Region-Finland%20Only-blue?style=for-the-badge)

## 🌟 Features

- **Real-time Tracking**: Live updates of airplane positions every 10 seconds.
- **Finland Specific**: Automatic filtering to show only flights within Finnish coordinates.
- **Premium Glassmorphism Design**: sleek dark-themed UI with backdrop-blur and responsive panels.
- **Detailed Flight Info**: Select any airplane to view:
    - Callsign & ICAO24
    - Real-time Speed (km/h)
    - Altitude (m)
    - Heading (Degrees)
    - Last Contact Timestamp
    - Flight Origin & Destination (where available)
- **Robust API Handling**: Seamless proxy fallback for CORS and rate-limit handling.
- **Mock Data Fallback**: Ensuring the application remains interactive even when the OpenSky API is unavailable.

## 🚀 Getting Started

1. **Clone the repository** (or download the files).
2. **Open `index.html`** in any modern web browser.
3. No build step or installation required!

*Note: For optimal performance and to avoid CORS issues locally, it is recommended to serve the folder using a local server like `npx serve` or Live Server.*

## 🛠️ Built With

- **[Leaflet](https://leafletjs.com/)**: Mobile-friendly interactive maps.
- **[OpenSky Network API](https://opensky-network.org/)**: Open-source flight tracking data.
- **[CartoDB Dark Matter](https://carto.com/basemaps/)**: Premium dark-themed map tiles.
- **[Google Fonts (Outfit)](https://fonts.google.com/specimen/Outfit)**: Modern geometric sans-serif typography.
- **Vanilla JavaScript & CSS**: Performance-oriented, dependency-free core logic and styling.

## 🌍 Region Specifics

The application is strictly bounded to the following coordinates covering Finland:
- **South**: 59.7°N
- **North**: 70.2°N
- **West**: 19.1°E
- **East**: 31.7°E

## 📄 License & Attribution

- **Data Attribution**: Flight data provided by [The OpenSky Network](https://opensky-network.org/).
- **Map Attribution**: &copy; [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors &copy; [CARTO](https://carto.com/attributions).
