require("dotenv").config();

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");

const dbUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/homebound";
const ownerUsername = process.env.SEED_OWNER_USERNAME || "Souvik Dey";

async function seedDatabase() {
  await mongoose.connect(dbUrl);

  try {
    const existingListings = await Listing.countDocuments();
    if (existingListings > 0) {
      console.log(`Seed skipped: HomeBound already has ${existingListings} listing(s).`);
      return;
    }

    const owner = await User.findOne({ username: ownerUsername });
    if (!owner) {
      throw new Error(
        `No user named '${ownerUsername}' exists. Sign up with that username first, or set SEED_OWNER_USERNAME.`
      );
    }

    const listings = initData.data.map((listing) => ({
      ...listing,
      owner: owner._id,
    }));

    await Listing.insertMany(listings);
    console.log(`Seeded ${listings.length} HomeBound listings owned by '${ownerUsername}'.`);
  } finally {
    await mongoose.disconnect();
  }
}

seedDatabase().catch((err) => {
  console.error(`Seeding failed: ${err.message}`);
  process.exitCode = 1;
});
