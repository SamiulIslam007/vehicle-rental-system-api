import express from "express";
import { initDB } from "./config/db";

const app = express();
app.use(express.json());

// database
initDB();

app.listen(5000, () => {
  console.log("server is running on port 5000");
});
