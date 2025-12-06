import express from "express";
import { initDB } from "./config/db";
import { userRoute } from "./modules/user/user.route";

const app = express();
app.use(express.json()); // parse korte hoise na hole body undefined asbe

// connecting database
initDB();

app.use("/api/v1/users", userRoute);

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
