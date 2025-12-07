import { z } from "zod";

export const createVehicleSchema = z.object({
  body: z.object({
    vehicle_name: z.string().min(1, "Vehicle name is required"),
    type: z
      .enum(["car", "bike", "van", "SUV"])
      .refine((val) => ["car", "bike", "van", "SUV"].includes(val), {
        message: "Type must be car, bike, van, or SUV",
      }),

    registration_number: z.string().min(1, "Registration number is required"),
    daily_rent_price: z.number().positive("Daily rent price must be positive"),
    availability_status: z.enum(["available", "booked"]).default("available"),
  }),
});

export const getVehicleSchema = z.object({
  params: z.object({
    vehicleId: z.string().regex(/^\d+$/, "Vehicle ID must be a number"),
  }),
});

export const updateVehicleSchema = z.object({
  params: z.object({
    vehicleId: z.string().regex(/^\d+$/, "Vehicle ID must be a number"),
  }),
  body: z.object({
    vehicle_name: z.string().optional(),
    type: z.enum(["car", "bike", "van", "SUV"]).optional(),
    registration_number: z.string().optional(),
    daily_rent_price: z.number().positive().optional(),
    availability_status: z.enum(["available", "booked"]).optional(),
  }),
});

export const deleteVehicleSchema = z.object({
  params: z.object({
    vehicleId: z.string().regex(/^\d+$/, "Vehicle ID must be a number"),
  }),
});
