const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const path = require("path");
const { log } = require("console");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require('./utils/ExpressError.js');
const {listingSchema} = require("./schema.js");
const bodyParser = require("body-parser");

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

app.get("/", (req, res) => {
  res.send("root page");
});

const validateListing = (req,res,next)=>{
     const { error } = listingSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(", ");
        throw new ExpressError(400, msg);              
    } else {
        next();
    }
}

// index route
app.get("/listings",wrapAsync( async (req, res) => {
  const allListings = await Listing.find({});
  res.render("./listings/index.ejs", { allListings });
}));

//create route
app.get("/listings/new", (req, res) => {
  res.render("./listings/new.ejs");
});
app.post("/listings",validateListing, wrapAsync( async (req, res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
}));


//show route
app.get("/listings/:id",wrapAsync( async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("./listings/show.ejs", { listing });
}));

//edit route
app.get("/listings/:id/edit",wrapAsync( async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("./listings/edit.ejs", { listing });
}));

//update route
app.put("/listings/:id",validateListing, wrapAsync( async (req, res) => {
  console.log(req.body);
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  res.redirect(`/listings/${id}`);
}));

//delete route
app.delete("/listings/:id", wrapAsync( async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  res.redirect("/listings");
}));

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
