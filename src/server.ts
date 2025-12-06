import express from "express";
import { initDB } from "./config/db";
import { userRoute } from "./modules/user/user.route";
import verify from "./middleware/verify";
import { authRoute } from "./modules/auth/auth.route";

const app = express();
app.use(express.json()); // parse korte hoise na hole body undefined asbe

// connecting database
initDB();

// All routes
app.use("/api/v1/users", verify, userRoute);

app.use("/api/v1/auth", authRoute);

// 404 Route - Not Found Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
    path: req.originalUrl,
  });
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
