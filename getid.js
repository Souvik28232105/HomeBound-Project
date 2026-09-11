const mongoose = require("mongoose");
const User = require("./models/user.js");

async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/homebound");
    const username = process.env.OWNER_USERNAME || "homebound_owner";
    const user = await User.findOne({ username });

    if (!user) {
        console.log(`No user found for username: ${username}`);
        mongoose.connection.close();
        return;
    }

    console.log("=========================================");
    console.log("YOUR USER ID IS:", user._id.toString());
    console.log("=========================================");
    mongoose.connection.close();
}

main();
