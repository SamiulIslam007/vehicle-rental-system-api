import express from "express";
import { initDB } from "./config/db";
import app from "./app";

const startServer = async () => {
  try {
    await initDB(); // Database

    app.listen("5000", () => {
      console.log("Server is running on port 5000");
    });
  } catch (error) {
    console.error("Failed to start the server", error);
    process.exit(1);
  }
};

startServer();
