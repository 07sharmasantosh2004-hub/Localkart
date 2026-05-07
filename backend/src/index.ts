import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "LocalKart API is running" });
});

app.get("/api/salons", (req, res) => {
  res.json({ salons: [] });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
