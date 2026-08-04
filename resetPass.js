const mongoose = require("mongoose");
const User = require("./models/user.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

async function reset() {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to Database!\n");

    // ১. ডাটাবেসে থাকা সব ইউজার খুঁজে বের করা
    const users = await User.find({});
    
    if (users.length === 0) {
        console.log("No users found in Database! Please signup on the website first.");
    } else {
        console.log("================ ALL USERS IN DB ================");
        users.forEach((u, index) => {
            console.log(`${index + 1}. Username: ${u.username} | Email: ${u.email}`);
        });
        console.log("=================================================\n");

        // ২. প্রথম ইউজারের পাসওয়ার্ড বদলে '12345' করে দেওয়া
        const targetUser = users[0];
        await targetUser.setPassword("12345");
        await targetUser.save();

        console.log(` SUCCESS!`);
        console.log(`Username: '${targetUser.username}'`);
        console.log(`New Password set to: 12345`);
    }

    mongoose.connection.close();
}

reset();