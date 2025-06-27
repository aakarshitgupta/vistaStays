const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const { log } = require("console");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require('./utils/ExpressError.js');
const bodyParser = require("body-parser");
const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");
const session = require("express-session");
const flash = require("connect-flash");

main()
  .then(() => {
    console.log("connected to db");
  })
  .catch((err) => {
    console.log(err);
  });
async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/vistastays");
}

app.use(bodyParser.urlencoded({ extended: true }));
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

const sessionOptions = {
  secret: "mySuperSecretCode",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, 
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.get("/", (req, res) => {
  res.send("root page");
});

app.use(session(sessionOptions));
app.use(flash());
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.use("/listings", listings);
app.use("/listings/:id/reviews",reviews)

// app.all("*",(req,res,next)=>{
//     next(new ExpressError(404,"Page not found"));
// });

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "error occured" } = err;
  res.status(statusCode).render("error.ejs", { message }); 
});

app.listen(8080, () => {
  console.log("server is running on port 8080");
});
