// const Listing=require("./models/listing")

// module.exports.isLoggedIn = (req, res, next) => {
//     if (!req.isAuthenticated()) {
//         req.session.redirectUrl=req.originalUrl;
//         req.flash("error", "You must be logged in to do that!");
//         return res.redirect("/login");
//     }
//     next();
// };


// module.exports.saveRedirectUrl=(req,res,next)=>{
//     if(req.session.redirectUrl){
//         res.locals.redirectUrl=req.session.redirectUrl;
//     }
//     next();
// }


// module.exports.isOwner=async(req,res,next)=>{
//     let { id } = req.params;
//     let listing=await Listing.findById(id);
//     if(!listing.owner._id.equals(res.locals.currUser._id)){
//         req.flash("error","You are not the owner of this listing");
//         return res.redirect(`/listings/${id}`);
//     }
//     next();
// }


// // Validation Middleware
// const validateListing = (req, res, next) => {
//     let { error } = listingSchema.validate(req.body);
//     if (error) {
//         let errMsg = error.details.map((el) => el.message).join(",");
//         throw new ExpressError(400, errMsg);
//     } else {
//         next();
//     }
// };





// const Listing = require("./models/listing");
// const ExpressError = require("./utils/ExpressError.js");
// const { listingSchema,reviewSchema } = require("./schema.js");

// // 1. Is Logged In Middleware
// module.exports.isLoggedIn = (req, res, next) => {
//     if (!req.isAuthenticated()) {
//         req.session.redirectUrl = req.originalUrl;
//         req.flash("error", "You must be logged in to do that!");
//         return res.redirect("/login");
//     }
//     next();
// };

// // 2. Save Redirect URL Middleware
// module.exports.saveRedirectUrl = (req, res, next) => {
//     if (req.session.redirectUrl) {
//         res.locals.redirectUrl = req.session.redirectUrl;
//     }
//     next();
// };

// // 3. Is Owner Middleware (FIXED)
// module.exports.isOwner = async (req, res, next) => {
//     let { id } = req.params;
//     let listing = await Listing.findById(id);
    
//     // 👈 FIX: listing.owner সরাসরি Check করা
//     if (!listing.owner.equals(res.locals.currUser._id)) {
//         req.flash("error", "You are not the owner of this listing");
//         return res.redirect(`/listings/${id}`);
//     }
//     next();
// };

// // 4. Validate Listing Middleware
// module.exports.validateListing = (req, res, next) => {
//     let { error } = listingSchema.validate(req.body);
//     if (error) {
//         let errMsg = error.details.map((el) => el.message).join(",");
//         throw new ExpressError(400, errMsg);
//     } else {
//         next();
//     }
// };


// module.exports.validateReview=(req,res,next)=>{
//     let { error } = reviewSchema.validate(req.body);
//     if (error) {
//         let errMsg = error.details.map((el) => el.message).join(",");
//         throw new ExpressError(400, errMsg);
//     } else {
//         next();
//     }
// };






const Listing = require("./models/listing");
const Review = require("./models/review"); // 👈 Review মডেল ইম্পোর্ট করা হলো
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");

// 1. Is Logged In Middleware
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in to do that!");
        return res.redirect("/login");
    }
    next();
};

// 2. Save Redirect URL Middleware
module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

// 3. Is Listing Owner Middleware (Safer Version)
module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    
    // Safety check: লিস্টিং ডাটাবেসে না থাকলে
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }

    if (!listing.owner.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not the owner of this listing");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

// 4. Validate Listing Middleware
module.exports.validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

// 5. Validate Review Middleware
module.exports.validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

// 6. Is Review Author Middleware (রিভিউ ডিলিট করার সিকিউরিটির জন্য)
module.exports.isReviewAuthor = async (req, res, next) => {
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);

    if (!review) {
        req.flash("error", "Review does not exist!");
        return res.redirect(`/listings/${id}`);
    }

    if (!review.author.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not the author of this review");
        return res.redirect(`/listings/${id}`);
    }
    next();
};