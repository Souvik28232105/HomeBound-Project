// // 1. Check if listing geometry coordinates exist
// // GeoJSON array formats coordinates as [Longitude, Latitude]
// let lat = 28.6139;  // Default Delhi Latitude
// let lng = 77.2090;  // Default Delhi Longitude

// if (
//     listing.geometry && 
//     listing.geometry.coordinates && 
//     listing.geometry.coordinates.length === 2
// ) {
//     lng = listing.geometry.coordinates[0];
//     lat = listing.geometry.coordinates[1];
// }

// // 2. Initialize Leaflet Map with [lat, lng]
// const map = L.map('map').setView([lat, lng], 10);

// // 3. OpenStreetMap Tiles
// L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
//     maxZoom: 19,
//     attribution: '&copy; OpenStreetMap'
// }).addTo(map);

// // 4. Add Marker and Popup for the exact location
// L.marker([lat, lng]).addTo(map)
//     .bindPopup(`<b>${listing.title}</b><br>${listing.location}`)
//     .openPopup();







let locationStr = listing.location || "";
let countryStr = listing.country || "";
let searchQuery = `${locationStr}, ${countryStr}`.trim();

// Initialize Leaflet Map
const map = L.map('map').setView([22.5726, 88.3639], 10);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
}).addTo(map);

const redIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

function renderMap(lat, lng) {
    map.setView([lat, lng], 10);
    
    L.marker([lat, lng], { icon: redIcon }).addTo(map)
        .bindPopup(
            `<h4>${listing.location || listing.title}</h4><p>Exact Location provided after booking</p>`
        );
}

if (
    listing.geometry && 
    listing.geometry.coordinates && 
    listing.geometry.coordinates.length === 2 &&
    listing.geometry.coordinates[0] !== 0
) {
    let lng = listing.geometry.coordinates[0];
    let lat = listing.geometry.coordinates[1];
    renderMap(lat, lng);
} else {
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`)
        .then(res => res.json())
        .then(data => {
            if (data && data.length > 0) {
                let lat = parseFloat(data[0].lat);
                let lon = parseFloat(data[0].lon);
                renderMap(lat, lon);
            } else {
                renderMap(22.5726, 88.3639);
            }
        })
        .catch(err => {
            console.log("Map Geocoding Error:", err);
            renderMap(22.5726, 88.3639);
        });
}