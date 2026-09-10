const Listing = require("../models/listing");

function getUploadedFileUrl(file) {
    return file.path.startsWith("http") ? file.path : `/uploads/${file.filename}`;
}

// 1. Index Route with Search & Category Filter
module.exports.index = async (req, res) => {
    const { category, q } = req.query; // q = search query
    let filter = {};

    // Category Filter
    if (category) {
        filter.category = category.toLowerCase();
    }

    // Search Filter (Title, Location, Country)
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

// 4. Create Listing Controller
module.exports.createListing = async (req, res) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id; 

    // Handle Property Image Upload (Multer req.files)
    if (req.files && req.files['listing[image]']) {
        let url = getUploadedFileUrl(req.files['listing[image]'][0]);
        let filename = req.files['listing[image]'][0].filename;
        newListing.image = { url, filename };
    }

    // Handle Owner Payment QR Code Upload (Multer req.files)
    if (req.files && req.files['listing[qrCode]']) {
        let url = getUploadedFileUrl(req.files['listing[qrCode]'][0]);
        let filename = req.files['listing[qrCode]'][0].filename;
        newListing.qrCode = { url, filename };
    }

    // Dynamic Location Search using OpenStreetMap Geocoding
    try {
        let locationQuery = encodeURIComponent(`${req.body.listing.location}, ${req.body.listing.country || ''}`);
        
        let geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${locationQuery}`, {
            headers: {
                'User-Agent': 'HomeBoundApp/1.0'
            }
        });
        let geoData = await geoRes.json();

        if (geoData && geoData.length > 0) {
            let lat = parseFloat(geoData[0].lat);
            let lon = parseFloat(geoData[0].lon);
            
            newListing.geometry = {
                type: "Point",
                coordinates: [lon, lat]
            };
        } else {
            // Default Kolkata Coordinates
            newListing.geometry = {
                type: "Point",
                coordinates: [88.3639, 22.5726] 
            };
        }
    } catch (err) {
        console.log("Geocoding Error:", err);
        newListing.geometry = {
            type: "Point",
            coordinates: [88.3639, 22.5726]
        };
    }

    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};

// 5. Render Edit Form
module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image ? listing.image.url : "";
    if (originalImageUrl) {
        originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    }

    res.render("listings/edit.ejs", { listing, originalImageUrl });
};

// 6. Update Listing Controller
module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    
    let listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing does not exist!");
        return res.redirect("/listings");
    }

    Object.assign(listing, req.body.listing);

    // Fetch NEW Coordinates if Location/Country was updated
    try {
        let locationQuery = encodeURIComponent(`${req.body.listing.location}, ${req.body.listing.country || ''}`);
        let geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${locationQuery}`, {
            headers: { 'User-Agent': 'HomeBoundApp/1.0' }
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

    // Update Property Image if uploaded
    if (req.files && req.files['listing[image]']) {
        let url = getUploadedFileUrl(req.files['listing[image]'][0]);
        let filename = req.files['listing[image]'][0].filename;
        listing.image = { url, filename };
    }

    // Update QR Code Image if uploaded
    if (req.files && req.files['listing[qrCode]']) {
        let url = getUploadedFileUrl(req.files['listing[qrCode]'][0]);
        let filename = req.files['listing[qrCode]'][0].filename;
        listing.qrCode = { url, filename };
    }

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
