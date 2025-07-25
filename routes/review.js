const express = require("express");
const wrapAsync = require("../utils/wrapAsync");
const router = express.Router({ mergeParams: true });
const ExpressError = require('../utils/ExpressError.js');
const { reviewSchema } = require("../schema.js");
const Review= require("../models/review");
const Listing = require("../models/listing.js");


const validateReview = (req,res,next)=>{
     const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(", ");
        throw new ExpressError(400, msg);              
    } else {
        next();
    }
}

// reviews
router.post("/",validateReview, wrapAsync(async (req, res) => {
  let listing = await Listing.findById(req.params.id).populate("reviews");
  let newReview = new Review(req.body.review);
  listing.reviews.push(newReview);
  await newReview.save();
  await listing.save();
    req.flash("success", "New review added successfully!");
  res.redirect(`/listings/${listing._id}`);
}));

// delete review 
router.delete("/:reviewId", wrapAsync(async (req, res) => {
  let { id, reviewId } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review deleted successfully!");
  res.redirect(`/listings/${id}`);
}));

module.exports = router;