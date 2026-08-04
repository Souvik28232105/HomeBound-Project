const Listing = require("../models/listing");
const Review = require("../models/review");

// Create Review Controller
module.exports.createReview = async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    
    newReview.author = req.user._id;
    listing.reviews.push(newReview);

    // 1. First save the review document
    await newReview.save();

    // 2. Save listing WITHOUT running full validation on existing fields
    await listing.save({ validateBeforeSave: false });

    req.flash("success", "New Review Created!");
    res.redirect(`/listings/${listing._id}`);
};

// 2. Destroy Review
module.exports.destroyReview = async (req, res) => {
    let { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Review Deleted!");
    res.redirect(`/listings/${id}`);
};