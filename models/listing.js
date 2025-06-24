const mongoose = require("mongoose");
const review = require("./review");
const Schema = mongoose.Schema;

const imageSchema = new Schema({
  filename: {
    type: String,
    default: "default",
  },
  url: {
    type: String,
    default: "https://via.placeholder.com/600x400?text=No+Image",
    set: (v) => v && v.trim() !== "" ? v : "https://via.placeholder.com/600x400?text=No+Image",
  }
});

const listingSchema = new Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Description is required"],
    trim: true,
  },
  image: {
    type: imageSchema,
    default: () => ({}),
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
    min: [0, "Price must be positive"],
  },
  location: {
    type: String,
    required: [true, "Location is required"],
  },
  country: {
    type: String,
    required: [true, "Country is required"],
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
});

listingSchema.post("findOneAndDelete", async (listing)=> {
  if (listing) {
    await review.deleteMany({
      _id: {
        $in: listing.reviews,
      },
    });
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
