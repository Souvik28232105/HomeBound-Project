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







(function () {
    // Leaflet CSS Dynamically Injecting to stop blank/white tile glitch
    if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
    }

    window.addEventListener("load", function () {
        const listingDataElement = document.getElementById("listing-data");
        let listing = {};

        if (listingDataElement && listingDataElement.dataset.listing) {
            try {
                listing = JSON.parse(listingDataElement.dataset.listing);
            } catch (e) {
                console.error("Error parsing listing data:", e);
            }
        }

        const mapContainer = document.getElementById("map");
        if (!mapContainer || typeof L === "undefined") return;

        // Default Kolkata fallback coordinates [lat, lng]
        let defaultLat = 22.5726;
        let defaultLng = 88.3639;

        // 1. Initialize Leaflet Map
        const map = L.map('map', {
            center: [defaultLat, defaultLng],
            zoom: 10,
            scrollWheelZoom: false
        });

        // 2. OpenStreetMap Tile Layer
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        // 3. Custom Red Marker Icon
        const redIcon = L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });

        function plotMarker(lat, lng) {
            map.setView([lat, lng], 11);
            L.marker([lat, lng], { icon: redIcon }).addTo(map)
                .bindPopup(`<b>${listing.title || listing.location || 'Location'}</b><br>Exact location provided after booking.`)
                .openPopup();
            
            // Force Leaflet to recalculate container size & render tiles instantly
            setTimeout(() => {
                map.invalidateSize();
            }, 500);
        }

        // 4. Check Database Coordinates or Fetch Geocode
        if (
            listing.geometry && 
            listing.geometry.coordinates && 
            listing.geometry.coordinates.length === 2 &&
            (listing.geometry.coordinates[0] !== 0 || listing.geometry.coordinates[1] !== 0)
        ) {
            let lng = listing.geometry.coordinates[0];
            let lat = listing.geometry.coordinates[1];
            plotMarker(lat, lng);
        } else {
            let locationStr = listing.location || "";
            let countryStr = listing.country || "";
            let searchQuery = `${locationStr}, ${countryStr}`.trim();

            if (searchQuery) {
                fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data && data.length > 0) {
                            plotMarker(parseFloat(data[0].lat), parseFloat(data[0].lon));
                        } else {
                            plotMarker(defaultLat, defaultLng);
                        }
                    })
                    .catch(() => plotMarker(defaultLat, defaultLng));
            } else {
                plotMarker(defaultLat, defaultLng);
            }
        }
    });
})();