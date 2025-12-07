import { z } from "zod";

export const updateUserSchema = z.object({
  params: z.object({
    userId: z.string().regex(/^\d+$/, "User ID must be a number"),
  }),
  body: z.object({
    name: z.string().optional(),
    email: z.string().email("Invalid email format").toLowerCase().optional(),
    phone: z.string().optional(),
    role: z.enum(["admin", "customer"]).optional(),
  }),
});

export const deleteUserSchema = z.object({
  params: z.object({
    userId: z.string().regex(/^\d+$/, "User ID must be a number"),
  }),
});
