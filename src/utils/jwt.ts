import jwt from "jsonwebtoken";
import { config } from "../config/env";

export interface JWTPayload {
  id: number;
  email: string;
  role: string;
}

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, config.jwt.secret as string, {
    expiresIn: config.jwt.expiresIn as string,
  }) as string;
};

export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, config.jwt.secret) as JWTPayload;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};
