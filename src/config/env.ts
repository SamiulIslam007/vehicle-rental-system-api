import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  jwt: {
    secret:
      process.env.JWT_SECRET ||
      "your-super-secret-jwt-key-change-this-in-production",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },
  database: {
    url: process.env.DATABASE_URL || "",
  },
};
