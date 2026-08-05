const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer = require('multer');
const { storage } = require("../cloudConfig.js");

// Allow uploading BOTH Property Image & QR Code Image
const upload = multer({ storage }).fields([
    { name: 'listing[image]', maxCount: 1 },
    { name: 'listing[qrCode]', maxCount: 1 }
]);

// 1. Path: "/" (Index & Create)
router
    .route("/")
    .get(wrapAsync(listingController.index))
    .post(
        isLoggedIn, 
        upload, 
        validateListing, 
        wrapAsync(listingController.createListing)
    );

// 2. New Route
router.get("/new", isLoggedIn, listingController.renderNewForm);

// 3. Path: "/:id" (Show, Update & Delete)
router
    .route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(
        isLoggedIn, 
        isOwner, 
        upload, 
        validateListing, 
        wrapAsync(listingController.updateListing)
    )
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

// 4. Edit Route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

module.exports = router;