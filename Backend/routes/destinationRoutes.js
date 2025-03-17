import express from "express";
import { createDestination } from "../controllers/destination.controller.js";

const router = express.Router();

// Create a destination
router.post("/create-destination", createDestination);

export default router;
