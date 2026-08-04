const express = require("express");
const router = express.Router({ mergeParams: true });
const Listing = require("../models/listing");
const Booking = require("../models/booking");
const { isLoggedIn } = require("../middleware");

// 🎟️ Create Booking Route (Always 18% GST Included)
router.post("/", isLoggedIn, async (req, res) => {
    try {
        let { id } = req.params;
        let { checkIn, checkOut, guests } = req.body.booking;

        let listing = await Listing.findById(id);
        if (!listing) {
            req.flash("error", "Listing not found!");
            return res.redirect("/listings");
        }

        // 1. Calculate duration (Number of nights)
        let startDate = new Date(checkIn);
        let endDate = new Date(checkOut);
        let timeDiff = endDate.getTime() - startDate.getTime();
        let nights = Math.ceil(timeDiff / (1000 * 3600 * 24));

        if (nights <= 0) {
            req.flash("error", "Checkout date must be after Check-in date!");
            return res.redirect(`/listings/${id}`);
        }

        // 2. Base Price & Mandatory 18% GST Calculation
        let basePrice = listing.price * nights;
        let gstAmount = Math.round(basePrice * 0.18); // Mandatory 18% GST
        let totalPrice = basePrice + gstAmount;       // Final Payable Amount

        // 3. Save Booking
        let newBooking = new Booking({
            listing: id,
            user: req.user._id,
            checkIn: startDate,
            checkOut: endDate,
            guests: guests,
            totalPrice: totalPrice
        });

        await newBooking.save();

        req.flash("success", `Booking confirmed! Base: ₹${basePrice.toLocaleString("en-IN")} + GST (18%): ₹${gstAmount.toLocaleString("en-IN")} | Total: ₹${totalPrice.toLocaleString("en-IN")}`);
        res.redirect(`/listings/${id}`);
    } catch (err) {
        console.log("Booking Error:", err);
        req.flash("error", "Something went wrong with your booking.");
        res.redirect(`/listings/${req.params.id}`);
    }
});

module.exports = router;