const mongoose = require("mongoose");
const User = require("./models/user.js");

require("dotenv").config();

const dbUrl = process.env.ATLASDB_URL;
const username = process.env.TARGET_USERNAME;
const newPassword = process.env.NEW_PASSWORD;

if (!dbUrl || !username || !newPassword || process.env.CONFIRM_PASSWORD_RESET !== "yes") {
    throw new Error(
        "Set ATLASDB_URL, TARGET_USERNAME, NEW_PASSWORD, and CONFIRM_PASSWORD_RESET=yes before running this script."
    );
}

async function reset() {
    await mongoose.connect(dbUrl);
    console.log("Connected to Database!");

    const targetUser = await User.findOne({ username });

    if (!targetUser) {
        console.log(`No user found with username '${username}'.`);
    } else {
        await targetUser.setPassword(newPassword);
        await targetUser.save();
        console.log(`Password reset for '${targetUser.username}'.`);
    }

    await mongoose.connection.close();
}

reset().catch(async (err) => {
    console.error(err.message);
    await mongoose.connection.close();
    process.exitCode = 1;
});
