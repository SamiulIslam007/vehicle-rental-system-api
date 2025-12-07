import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middlewares/auth";
import { bookingServices } from "./bookings.service";

export const createBookingController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let customerId: number;
    if (req.user!.role === "customer") {
      customerId = req.user!.id;
    } else {
      if (!req.body.customer_id) {
        res.status(400).json({
          success: false,
          message: "Customer ID is required for admin bookings",
          errors: "customer_id is required",
        });
        return;
      }
      customerId = req.body.customer_id;
    }

    const booking = await bookingServices.createBookingIntoDB({
      ...req.body,
      customer_id: customerId,
    });

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllBookingsController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const bookings = await bookingServices.getAllBookingsFromDB(
      userId,
      userRole
    );

    const message =
      userRole === "admin"
        ? "Bookings retrieved successfully"
        : "Your bookings retrieved successfully";

    res.status(200).json({
      success: true,
      message,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

export const updateBookingController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const bookingId = parseInt(req.params.bookingId as string);
    const status = req.body.status;
    const userRole = req.user!.role;
    const userId = req.user!.id;

    const booking = await bookingServices.updateBookingIntoDB(
      bookingId,
      status,
      userRole,
      userId
    );

    let message = "";
    if (status === "cancelled") {
      message = "Booking cancelled successfully";
    } else if (status === "returned") {
      message = "Booking marked as returned. Vehicle is now available";
    }

    res.status(200).json({
      success: true,
      message,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};
