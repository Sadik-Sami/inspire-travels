import Destination from "../models/Destination.js";

export const createDestination = async (req, res) => {
  const destination = req.body;
  const {
    destinationDetails,
    categories,
    location,
    duration,
    groupSize,
    availableDates,
    advantagesAndDetails,
  } = destination;

  if (
    !destinationDetails.title ||
    !destinationDetails.summary ||
    !destinationDetails.fullDescription ||
    !categories ||
    !location.from ||
    !location.to ||
    !duration.days ||
    !groupSize.basePrice ||
    !availableDates.startDate ||
    !availableDates.endDate ||
    !availableDates.bookingDeadline ||
    !advantagesAndDetails.advantages ||
    !advantagesAndDetails.features ||
    !advantagesAndDetails.activities
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all fields" });
  }

  const newDestination = new Destination(destination);

  try {
    await newDestination.save();
    res.status(201).json({ success: true, data: newDestination });
  } catch (err) {
    console.log("Error in creating Destination. " + err.message);
    res
      .status(500)
      .json({ success: false, message: "Error in creating destination." });
  }
};
