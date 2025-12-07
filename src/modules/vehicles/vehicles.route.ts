import { Router } from 'express';
import {
  createVehicleController,
  getAllVehiclesController,
  getVehicleByIdController,
  updateVehicleController,
  deleteVehicleController,
} from './controller';
import { authenticate } from '../../middlewares/auth';
import { authorize } from '../../middlewares/authorize';
import { validate } from '../../middlewares/validate';
import {
  createVehicleSchema,
  getVehicleSchema,
  updateVehicleSchema,
  deleteVehicleSchema,
} from './validation';

const router = Router();

router.post(
  '/',
  authenticate,
  authorize('admin'),
  validate(createVehicleSchema),
  createVehicleController
);

router.get('/', getAllVehiclesController);

router.get(
  '/:vehicleId',
  validate(getVehicleSchema),
  getVehicleByIdController
);

router.put(
  '/:vehicleId',
  authenticate,
  authorize('admin'),
  validate(updateVehicleSchema),
  updateVehicleController
);

router.delete(
  '/:vehicleId',
  authenticate,
  authorize('admin'),
  validate(deleteVehicleSchema),
  deleteVehicleController
);

export default router;

