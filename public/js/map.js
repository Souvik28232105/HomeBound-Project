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







// 1. Fetch listing data safely from HTML data-attribute
const listingDataElement = document.getElementById("listing-data");
let listing = {};

if (listingDataElement && listingDataElement.dataset.listing) {
    try {
        listing = JSON.parse(listingDataElement.dataset.listing);
    } catch (e) {
        console.error("Error parsing listing data for map:", e);
    }
}

// 2. Prepare location query
let locationStr = listing.location || "";
let countryStr = listing.country || "";
let searchQuery = `${locationStr}, ${countryStr}`.trim();

// 3. Initialize Leaflet Map (Default center: Kolkata)
const map = L.map('map').setView([22.5726, 88.3639], 10);

// 4. OpenStreetMap Tile Layer
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
}).addTo(map);

// 5. Red Marker Icon Definition
const redIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Function to Render Marker & Popup
function renderMap(lat, lng) {
    map.setView([lat, lng], 10);
    
    L.marker([lat, lng], { icon: redIcon }).addTo(map)
        .bindPopup(
            `<h4>${listing.location || listing.title || "Location"}</h4><p>Exact Location provided after booking</p>`
        );
}

// 6. Check Coordinates or Geocode Location
if (
    listing.geometry && 
    listing.geometry.coordinates && 
    listing.geometry.coordinates.length === 2 &&
    listing.geometry.coordinates[0] !== 0
) {
    let lng = listing.geometry.coordinates[0];
    let lat = listing.geometry.coordinates[1];
    renderMap(lat, lng);
} else if (searchQuery) {
    // Dynamic Fetch using OpenStreetMap Nominatim Geocoding API
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
} else {
    renderMap(22.5726, 88.3639);
}