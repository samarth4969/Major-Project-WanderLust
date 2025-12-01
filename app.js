if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const methodoverride = require("method-override");
const path = require("path");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const ListingRouter = require("./routes/listing.js");
const categoryRouter = require("./routes/category.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const searchRouter = require("./routes/search.js");

// ---------- MONGODB ----------
main()
  .then(() => console.log("Successfully connected"))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(process.env.DATABASE_URL);
}

// ---------- VIEWS ----------
app.set("view engine", "ejs");   // 🔥 FIXED (must have space)
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// ---------- MIDDLEWARE ----------
app.use(express.urlencoded({ extended: true }));
app.use(methodoverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

const sessionOption = {
  secret: "mysupersecrtecode",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
};

app.use(session(sessionOption));
app.use(flash());

// ---------- PASSPORT (MUST BE IN THIS ORDER) ----------
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));  // authentication

passport.serializeUser(User.serializeUser());          // 🔥 required for session
passport.deserializeUser(User.deserializeUser());      // 🔥 required for session

// ---------- GLOBAL FLASH & USER LOCALS ----------
app.use((req, res, next) => {
  res.locals.currUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// ---------- ROUTES ----------
app.use("/listings", ListingRouter);
app.use("/listings/:id", reviewRouter);
app.use("/", userRouter);
app.use("/", categoryRouter);
app.use("/search", searchRouter);

// ---------- ERROR ----------
app.all("*", (req, res) => {
  res.status(404).render("error.ejs", { message: "Page Not Found" });
});

// ---------- SERVER ----------
app.listen(3003, () => console.log("server started on port 3003"));
