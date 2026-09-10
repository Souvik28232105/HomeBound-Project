const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const User = require("./models/user.js");

require("dotenv").config();

const dbUrl = process.env.ATLASDB_URL;
const username = process.env.TARGET_USERNAME;

if (!dbUrl || !username || process.env.CONFIRM_MAKE_OWNER !== "yes") {
    throw new Error(
        "Set ATLASDB_URL, TARGET_USERNAME, and CONFIRM_MAKE_OWNER=yes before running this script."
    );
}

async function makeOwner() {
    await mongoose.connect(dbUrl);
    console.log("Connected to Database!");

    const user = await User.findOne({ username });

    if (!user) {
        console.log(`No user found with username '${username}'.`);
    } else {
        await Listing.updateMany({}, { owner: user._id });
        console.log(`All listings are now owned by '${username}'.`);
    }

    await mongoose.connection.close();
}

makeOwner().catch(async (err) => {
    console.error(err.message);
    await mongoose.connection.close();
    process.exitCode = 1;
});
