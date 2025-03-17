import mongoose from "mongoose";

const destinationDetails = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please Enter a title."],
  },
  summary: {
    type: String,
    max: 150,
    required: [true, "Please Enter a Summary."],
  },
  fullDescription: {
    type: String,
    required: [true, "Please Enter a Description."],
  },
});

const location = new mongoose.Schema({
  from: { type: String, required: [true, "Please add a from description."] },
  to: { type: String, required: [true, "Please add a from description."] },
  detailedAddress: String,
  googleMapsLink: String,
});

const duration = new mongoose.Schema({
  days: {
    type: String,
    required: [true, "Please Enter Days."],
  },
  nights: Number,
  flexibleDuration: Boolean,
});

const transportation = new mongoose.Schema({
  transportationType: String,
  transportationDetails: String,
});

const accomodation = new mongoose.Schema({
  accomodationType: String,
  rating: Number,
  accomodationDetails: String,
});

const meals = new mongoose.Schema({
  mealDetails: String,
});

const groupSize = new mongoose.Schema({
  basePrice: { type: Number, required: [true, "Please enter a price."] },
  discountedPrice: String,
  currencyType: String,
  priceType: String,
});

const availableDates = new mongoose.Schema({
  startDate: { type: Date, required: [true, "Please enter a start date."] },
  endDate: { type: Date, required: [true, "Please enter a end date."] },
  bookingDeadline: {
    type: Date,
    required: [true, "Please enter a booking deadline."],
  },
});

const advantagesAndDetails = new mongoose.Schema({
  advantages: [{ type: String, required: [true, "Please enter advantages."] }],
  features: [{ type: String, required: [true, "Please enter features."] }],
  activities: [{ type: String, required: [true, "Please enter activities."] }],
});

const visibility = {
  featured: Boolean,
  popular: Boolean,
  status: { type: String, enum: ["Draft", "Active", "Inactive"] },
};

const destinationSchema = new mongoose.Schema({
  destinationDetails,
  categories: {
    type: [String],
    enum: [
      "Beach",
      "Adventure",
      "Budget",
      "Mountain",
      "Romantic, Wildlife",
      "City",
      "Family-Friendly",
      "Historical",
      "Cultural",
      "Luxury",
      "Food & Wine",
    ],
  },
  location,
  duration,
  transportation,
  accomodation,
  meals,
  groupSize,
  availableDates,
  advantagesAndDetails,
  ameneties: [String],
  mediaImages: [String],
  visibility,
});

const Destination = mongoose.model("Destination", destinationSchema);

export default Destination;
