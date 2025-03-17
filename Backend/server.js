import { config } from "dotenv";
import express, { json } from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import destinationRoutes from "./routes/destinationRoutes.js";

const app = express();
app.use(json());
app.use(cors());

config();

const PORT = process.env.PORT || 3000;
// connect to MongoDB
connectDB();

app.get("/", (_req, res) => {
  res.send("Welcome to Inspire API");
});

app.use("/api/users", userRoutes);
app.use("/api/destination", destinationRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
