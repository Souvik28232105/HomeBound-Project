// Windows DNS Lookup Fix
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");

// Atlas DB Connection String
const dbUrl = process.env.ATLASDB_URL || "mongodb+srv://panideepsikha2006_db_user:dyQ8m7WJgNLkge0d@cluster0.uxr4zy5.mongodb.net/wanderlust?retryWrites=true&w=majority";

main()
  .then(() => {
    console.log("Connected to DB successfully!");
  })
  .catch((err) => {
    console.log("DB Connection Error:", err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}

const initDB = async () => {
  // ১. আগের সব লিস্টিং এবং ইউজার পরিষ্কার করা
  await Listing.deleteMany({});
  await User.deleteMany({ username: "deepsikhaWander" });

  // ২. deepsikhaWander ইউজার তৈরি করা (Password: hello123)
  const newUser = new User({
    email: "deepsikha@gmail.com",
    username: "deepsikhaWander"
  });
  
  const registeredOwner = await User.register(newUser, "hello123");
  console.log("Created Owner Account -> Username: deepsikhaWander | Password: hello123");

  // ৩. ১৫টি লিস্টিং-এ deepsikhaWander এর ID যুক্ত করা
  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: registeredOwner._id,
  }));

  await Listing.insertMany(initData.data);
  console.log("Data was initialized with 15 listings owned by deepsikhaWander!");
  
  mongoose.connection.close();
};

initDB();