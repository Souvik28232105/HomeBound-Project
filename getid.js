const mongoose = require("mongoose");
const User = require("./models/user.js");

async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/homebound");
    const user = await User.findOne({ username: "DeepsikhaPani" });
    console.log("=========================================");
    console.log("YOUR USER ID IS:", user._id.toString());
    console.log("=========================================");
    mongoose.connection.close();
}

main();
