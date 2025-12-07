import jwt from "jsonwebtoken";
import { config } from "../config/env";

export interface JWTPayload {
  id: number;
  email: string;
  role: string;
}

export const generateToken = (payload: JWTPayload): string => {
  const secret = String(config.jwt.secret);
  const expiresIn = String(config.jwt.expiresIn);

  return jwt.sign(payload, secret, {
    expiresIn: expiresIn,
  } as jwt.SignOptions);
};

export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, config.jwt.secret) as JWTPayload;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};
