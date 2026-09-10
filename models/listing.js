



const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    url: String,
    filename: String,
  },
  // Owner Payment QR Code Scanner
  qrCode: {
    url: {
      type: String,
      default: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=deepsikhabusiness@upi&pn=deepsikhaWander"
    },
    filename: String,
  },
  price: Number,
  location: String,
  country: String,
  category: {
    type: String,
    enum: ['trending', 'rooms', 'iconic cities', 'mountains', 'castles', 'pools', 'camping', 'farms', 'domes', 'arctic', 'boats', 'beach', 'islands', 'tropical', 'deserts', 'golfing', 'skiing', 'houseboats']
  },
  geometry: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;