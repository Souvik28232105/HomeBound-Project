const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const User = require("./models/user.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

async function makeOwner() {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to Database!");

    // 'hello world' ইউজারকে খুঁজে বের করা হচ্ছে
    const user = await User.findOne({ username: "hello world" });

    if (!user) {
        console.log("❌ 'hello world' নামের কোনো ইউজার পাওয়া যায়নি! আগে ওয়েবসাইটে গিয়ে Sign Up করো।");
    } else {
        // সব লিস্টিংয়ের owner হিসেবে 'hello world' কে সেট করে দেওয়া হলো
        await Listing.updateMany({}, { owner: user._id });
        console.log("\n==================================================");
        console.log(" SUCCESS! All listings are now owned by: 'hello world'");
        console.log("==================================================\n");
    }

    mongoose.connection.close();
}

makeOwner();