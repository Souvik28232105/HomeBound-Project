// DNS lookup error correction
const dns = require("dns");
const crypto = require("crypto");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

if (process.env.NODE_ENV != "production") {
    require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");

// Safe MongoStore Import (CommonJS / v5+ Fix)
const connectMongo = require("connect-mongo");
const MongoStore = connectMongo.default || connectMongo;

const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const bookingRouter = require("./routes/booking.js");

const isProduction = process.env.NODE_ENV === "production";

// Fallback logic for local development database
const dbUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/homebound";

if (isProduction && !process.env.ATLASDB_URL) {
    throw new Error("ATLASDB_URL must be set in production.");
}

if (isProduction && !process.env.SECRET) {
    throw new Error("SECRET must be set in production.");
}

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

// Configuration & Basic Middleware
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

// Session Store Setup
// An ephemeral secret is acceptable for local development only. Production
// requires a stable, private SECRET so sessions remain secure across restarts.
const secretKey = process.env.SECRET || crypto.randomBytes(32).toString("hex");

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: secretKey,
    },
    touchAfter: 24 * 3600,
});

store.on("error", (err) => {
    console.log("ERROR in MONGO SESSION STORE:", err);
});

// Session Configuration
const sessionOptions = {
    store: store,
    secret: secretKey,
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "lax",
        secure: isProduction,
    }
};

app.use(session(sessionOptions));
app.use(flash());

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash & Local Variables Middleware
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    res.locals.mapToken = process.env.MAP_TOKEN;
    next();
});

// Root Route
app.get("/", (req, res) => {
    res.redirect("/listings");
});

// Router Mounting
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/listings/:id/book", bookingRouter);
app.use("/", userRouter);

// 404 Catch-All Route
app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

// Global Error Handler
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error.ejs", { message });
});

// Port setup
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
