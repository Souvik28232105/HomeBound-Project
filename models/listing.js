// const mongoose = require("mongoose");
// const Schema = mongoose.Schema;
// const Review = require("./review.js");

// const DEFAULT_IMAGE_URL = "https://images.unsplash.com/photo-1625244724120-1fd1d34d00f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

// const listingSchema = new Schema({
//     title: {
//         type: String,
//         required: true,
//     },
//     description: String,
//     image: {
//         url:String,
//         filename:String,
//     },
//     price: Number,
//     location: String,
//     country: String,
//     reviews: [
//         {
//             type: Schema.Types.ObjectId,
//             ref: "Review",
//         },
//     ],
//     owner: {
//         type: Schema.Types.ObjectId, // 👈 Fixed typo: ObjectId
//         ref: "User",
//     },
//     geometry:{
//     type: {
//       type: String, // Don't do `{ location: { type: String } }`
//       enum: ['Point'], // 'location.type' must be 'Point'
//       required: true
//     },
//     coordinates: {
//       type: [Number],
//       required: true
//     }
//   },
//   category: {
//     type: String,
//     enum: [
//         "trending", "rooms", "iconic cities", "mountains", "castles", 
//         "pools", "camping", "farms", "domes", "arctic", 
//         "boats", "beach", "islands", "tropical", "deserts", 
//         "golfing", "skiing", "houseboats"
//     ],
//     required: true
// }
// });

// Middleware to cascade delete reviews when a listing is deleted
// listingSchema.post("findOneAndDelete", async (listing) => {
//     if (listing) {
//         await Review.deleteMany({ _id: { $in: listing.reviews } });
//     }
// });

// const Listing = mongoose.model("Listing", listingSchema);
// module.exports = Listing;



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
  // 💳 Owner Payment QR Code Scanner
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