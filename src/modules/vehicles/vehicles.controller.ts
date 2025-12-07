import { Request, Response, NextFunction } from "express";
import { vehicleServices } from "./vehicles.service";

export const createVehicleController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const vehicle = await vehicleServices.createVehicleIntoDB(req.body);

    res.status(201).json({
      success: true,
      message: "Vehicle created successfully",
      data: vehicle,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllVehiclesController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const vehicles = await vehicleServices.getAllVehiclesFromDB();

    const message =
      vehicles.length > 0
        ? "Vehicles retrieved successfully"
        : "No vehicles found";

    res.status(200).json({
      success: true,
      message,
      data: vehicles,
    });
  } catch (error) {
    next(error);
  }
};

export const getVehicleByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const vehicleId = parseInt(req.params.vehicleId as string);
    const vehicle = await vehicleServices.getVehicleByIdFromDB(vehicleId);

    res.status(200).json({
      success: true,
      message: "Vehicle retrieved successfully",
      data: vehicle,
    });
  } catch (error) {
    next(error);
  }
};

export const updateVehicleController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const vehicleId = parseInt(req.params.vehicleId as string);
    const vehicle = await vehicleServices.updateVehicleIntoDB(
      vehicleId,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Vehicle updated successfully",
      data: vehicle,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteVehicleController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const vehicleId = parseInt(req.params.vehicleId as string);
    await vehicleServices.deleteVehicleFromDB(vehicleId);

    res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
