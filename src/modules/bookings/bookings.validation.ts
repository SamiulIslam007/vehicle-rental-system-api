import { z } from 'zod';

export const createBookingSchema = z.object({
  body: z.object({
    customer_id: z.number().int().positive('Customer ID must be a positive number').optional(),
    vehicle_id: z.number().int().positive('Vehicle ID must be a positive number'),
    rent_start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    rent_end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  }).refine(
    (data) => {
      const startDate = new Date(data.rent_start_date);
      const endDate = new Date(data.rent_end_date);
      return endDate > startDate;
    },
    {
      message: 'Rent end date must be after rent start date',
    }
  ),
});

export const updateBookingSchema = z.object({
  params: z.object({
    bookingId: z.string().regex(/^\d+$/, 'Booking ID must be a number'),
  }),
  body: z.object({
    status: z.enum(['cancelled', 'returned']),
  }),
});

