const Listing = require("../models/listing");
const mbxGeocoding=require('@mapbox/mapbox-sdk/services/geocoding')
const mapToken=process.env.MAP_TOKEN;
const geocodingClient=mbxGeocoding({accessToken:mapToken})


// Index Route with Search & Category Filter
module.exports.index = async (req, res) => {
    const { category, q } = req.query; // q = search query
    
    let filter = {};

    // 1. Category Filter
    if (category) {
        filter.category = category.toLowerCase();
    }

    // 2. Search Filter (Title, Location, Country)
    if (q) {
        filter.$or = [
            { title: { $regex: q, $options: "i" } },
            { location: { $regex: q, $options: "i" } },
            { country: { $regex: q, $options: "i" } }
        ];
    }

    const allListings = await Listing.find(filter);
    
    res.render("listings/index.ejs", { 
        allListings, 
        activeCategory: category, 
        searchQuery: q || "" 
    });
};

// 2. Render New Form
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

// 3. Show Listing
module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            },
        })
        .populate("owner");
        
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
};



// Create Listing Controller
module.exports.createListing = async (req, res) => {
    let url = req.file.path;
    let filename = req.file.filename;

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id; 
    newListing.image = { url, filename };

    // Dynamic Location Search using OpenStreetMap
    try {
        let locationQuery = encodeURIComponent(`${req.body.listing.location}, ${req.body.listing.country || ''}`);
        
        let geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${locationQuery}`, {
            headers: {
                'User-Agent': 'WanderLustApp/1.0' // Essential Header for OpenStreetMap
            }
        });
        let geoData = await geoRes.json();

        if (geoData && geoData.length > 0) {
            let lat = parseFloat(geoData[0].lat);
            let lon = parseFloat(geoData[0].lon);
            
            // Save exact coordinates in GeoJSON format: [longitude, latitude]
            newListing.geometry = {
                type: "Point",
                coordinates: [lon, lat]
            };
        } else {
            // Default: West Bengal (Kolkata) Coordinates instead of Delhi
            newListing.geometry = {
                type: "Point",
                coordinates: [88.3639, 22.5726] 
            };
        }
    } catch (err) {
        console.log("Geocoding Error:", err);
        newListing.geometry = {
            type: "Point",
            coordinates: [88.3639, 22.5726] // Default Kolkata, West Bengal
        };
    }

    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};




module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    // Cloudinary URL থেকে উইডথ ২৫০ পিক্সেল করে ছবির সাইজ কমাবে
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");

    res.render("listings/edit.ejs", { listing, originalImageUrl });
};



// 6. Update Listing Controller
module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    
    // 1. Find the listing first
    let listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing does not exist!");
        return res.redirect("/listings");
    }

    // 2. Update basic fields using Object.assign or direct assignment
    Object.assign(listing, req.body.listing);

    // 3. Fetch NEW Coordinates if Location/Country was updated
    try {
        let locationQuery = encodeURIComponent(`${req.body.listing.location}, ${req.body.listing.country || ''}`);
        let geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${locationQuery}`, {
            headers: { 'User-Agent': 'WanderLustApp/1.0' }
        });
        let geoData = await geoRes.json();

        if (geoData && geoData.length > 0) {
            let lat = parseFloat(geoData[0].lat);
            let lon = parseFloat(geoData[0].lon);
            
            listing.geometry = {
                type: "Point",
                coordinates: [lon, lat]
            };
        }
    } catch (err) {
        console.log("Geocoding Update Error:", err);
    }

    // 4. Update Image if a new file was uploaded
    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
    }

    // 5. Save the document with updated fields (including category)
    await listing.save();

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};


// 7. Destroy Listing
module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deleteListing = await Listing.findByIdAndDelete(id);
    console.log(deleteListing);
    req.flash("success", "Listing Deleted!");
    return res.redirect("/listings");
};