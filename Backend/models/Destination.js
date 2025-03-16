const mongoose = require("mongoose")

const destinationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    summary: {
      type: String,
      required: [true, "Summary is required"],
      trim: true,
      maxlength: [150, "Summary cannot be more than 150 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    location: {
      from: {
        type: String,
        required: [true, "Origin location is required"],
        trim: true,
      },
      to: {
        type: String,
        required: [true, "Destination location is required"],
        trim: true,
      },
      address: {
        type: String,
        trim: true,
      },
      mapLink: {
        type: String,
        trim: true,
      },
    },
    pricing: {
      basePrice: {
        type: Number,
        required: [true, "Base price is required"],
        min: [0, "Price cannot be negative"],
      },
      discountedPrice: {
        type: Number,
        min: [0, "Discounted price cannot be negative"],
      },
      currency: {
        type: String,
        default: "USD",
        enum: ["USD", "EUR", "GBP", "JPY", "AUD", "CAD"],
      },
      priceType: {
        type: String,
        default: "perPerson",
        enum: ["perPerson", "perCouple", "perGroup"],
      },
    },
    duration: {
      days: {
        type: Number,
        required: [true, "Duration in days is required"],
        min: [1, "Duration must be at least 1 day"],
      },
      nights: {
        type: Number,
        default: 0,
        min: [0, "Nights cannot be negative"],
      },
      flexible: {
        type: Boolean,
        default: false,
      },
    },
    dates: {
      startDate: {
        type: Date,
      },
      endDate: {
        type: Date,
      },
      availableDates: [Date],
      bookingDeadline: {
        type: Date,
      },
    },
    transportation: {
      included: {
        type: Boolean,
        default: true,
      },
      type: {
        type: String,
        enum: ["flight", "train", "bus", "cruise", "self", "mixed"],
        default: "flight",
      },
      details: {
        type: String,
        trim: true,
      },
    },
    accommodation: {
      type: {
        type: String,
        enum: ["hotel", "resort", "villa", "apartment", "hostel", "mixed"],
        default: "hotel",
      },
      rating: {
        type: Number,
        min: 1,
        max: 5,
        default: 3,
      },
      details: {
        type: String,
        trim: true,
      },
    },
    meals: {
      included: {
        type: Boolean,
        default: true,
      },
      details: {
        type: String,
        trim: true,
      },
    },
    groupSize: {
      min: {
        type: Number,
        default: 1,
        min: [1, "Minimum group size must be at least 1"],
      },
      max: {
        type: Number,
        default: 20,
        min: [1, "Maximum group size must be at least 1"],
      },
      privateAvailable: {
        type: Boolean,
        default: false,
      },
    },
    activities: [String],
    advantages: {
      type: [String],
      required: [true, "At least one advantage is required"],
    },
    features: {
      type: [String],
      required: [true, "At least one feature is required"],
    },
    amenities: {
      wifi: { type: Boolean, default: false },
      airConditioning: { type: Boolean, default: false },
      parking: { type: Boolean, default: false },
      pool: { type: Boolean, default: false },
      spa: { type: Boolean, default: false },
      gym: { type: Boolean, default: false },
      restaurant: { type: Boolean, default: false },
      bar: { type: Boolean, default: false },
      roomService: { type: Boolean, default: false },
      laundry: { type: Boolean, default: false },
      accessibility: { type: Boolean, default: false },
    },
    categories: [String],
    images: [
      {
        public_id: String,
        url: String,
      },
    ],
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["draft", "active", "inactive"],
      default: "draft",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Virtual for calculating discount percentage
destinationSchema.virtual("discountPercentage").get(function () {
  if (this.pricing.discountedPrice && this.pricing.basePrice) {
    const discount = ((this.pricing.basePrice - this.pricing.discountedPrice) / this.pricing.basePrice) * 100
    return Math.round(discount)
  }
  return 0
})

// Index for search functionality
destinationSchema.index({
  title: "text",
  summary: "text",
  description: "text",
  "location.from": "text",
  "location.to": "text",
})

module.exports = mongoose.model("Destination", destinationSchema)

