const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const path = require("path");
const { log } = require("console");
const methodOverride = require("method-override");
const ejsMate = require('ejs-mate');
// const wrapAsync = require('./utils/wrapAsync.js');
// const ExpressError = require('./utils/ExpressError.js');
// const {listingSchema} = require("./schema.js");
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
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended : true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

app.get("/", (req, res) => {
  res.send("root page");
});
// index route 
app.get("/listings", async (req, res) => {
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs",{allListings})
});

//create route
app.get("/listings/new", (req,res)=>{
    res.render("./listings/new.ejs");
})
app.post("/listings", async (req, res) => {
  try {
    const { listing } = req.body;

    // Ensure image is in correct format for schema
    const formattedListing = {
      ...listing,
      image: {
        url: listing.image || "some link",
        filename: "default", // default filename
      },
    };

    const newListing = new Listing(formattedListing);
    await newListing.save();
    res.redirect("/listings");
  } catch (err) {
    console.error("Error creating listing:", err);
    res.send("Error creating listing: " + err.message);
  }
});


//show route
app.get("/listings/:id",(async( req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("./listings/show.ejs",{listing});
}));
//edit route
app.get("/listings/:id/edit",( async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("./listings/edit.ejs",{listing});
}));
//update route
app.put("/listings/:id",(async( req,res)=>{
  console.log(req.body);
  let { id } = req.params;
   const data = req.body.listing;
  if (typeof data.image === "string") {
   data.image = { url: data.image };
 }
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  res.redirect(`/listings/${id}`);
}));
//delete route
app.delete("/listings/:id",(async(req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}));
app.listen(8080, () => {
  console.log("server is running on port 8080");
});
