import express, { Request, Response } from "express";
import { Pool } from "pg";
import { userRoute } from "./modules/user/user.route";
import { initDB } from "./config/db";

const app = express();
app.use(express.json()); // parse korte hoise na hole body undefined asbe

initDB();

app.use("/api/v1/users", userRoute);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "This is the root route of the server",
    path: "req.path",
  });
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
