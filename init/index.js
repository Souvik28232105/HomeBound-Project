// const mongoose = require("mongoose");
// const initData = require("./data.js");
// const Listing = require("../models/listing.js");
// const User = require("../models/user.js");

// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

// main()
//   .then(() => {
//     console.log("connected to DB");
//   })
//   .catch((err) => {
//     console.log(err);
//   });

// async function main() {
//   await mongoose.connect(MONGO_URL);
// }

// const initDB = async () => {
//   // ১. পুরনো সব Listing এবং wanderDeepsikha ইউজার থাকলে তা পরিষ্কার করা হচ্ছে
//   await Listing.deleteMany({});
//   await User.deleteMany({ username: "wanderDeepsikha" });

//   // ২. Passport দিয়ে সঠিকভাবে 'wanderDeepsikha' ইউজার তৈরি করা হচ্ছে
//   const newUser = new User({
//     email: "wanderdeepsikha@gmail.com",
//     username: "wanderDeepsikha",
//   });
  
//   const registeredUser = await User.register(newUser, "wander");
//   console.log("👤 New User Registered: wanderDeepsikha");

//   // ৩. সব sample listings-এর Owner হিসেবে wanderDeepsikha-কে লিঙ্ক করা হচ্ছে
//   initData.data = initData.data.map((obj) => ({
//     ...obj,
//     owner: registeredUser._id,
//   }));

//   await Listing.insertMany(initData.data);
//   console.log("✅ All listings are now owned by wanderDeepsikha!");
  
//   mongoose.connection.close();
// };

// initDB();


const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const dbUrl = "mongodb+srv://panideepsikha2006_db_user:dyQ8m7WJgNLkge0d@cluster0.uxr4zy5.mongodb.net/wanderlust?retryWrites=true&w=majority";

async function main() {
  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(dbUrl);
    console.log("Connected to Atlas DB successfully!");
    
    await initDB();
  } catch (err) {
    console.log("DB Connection Error:", err);
  }
}

const initDB = async () => {
  try {
    await Listing.deleteMany({});
    
    initData.data = initData.data.map((obj) => ({
      ...obj,
      owner: "664b4bc3c2d49c690a7d2e85", // Valid User ID
    }));
    
    await Listing.insertMany(initData.data);
    console.log("Data was successfully initialized to Cloud Atlas!");
    process.exit(0);
  } catch (err) {
    console.log("Data Insert Error:", err);
  }
};

main();