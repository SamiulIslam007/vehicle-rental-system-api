import { Router } from 'express';
import {
  createBookingController,
  getAllBookingsController,
  updateBookingController,
} from './controller';
import { authenticate } from '../../middlewares/auth';
import { validate } from '../../middlewares/validate';
import { createBookingSchema, updateBookingSchema } from './validation';

const router = Router();

router.post(
  '/',
  authenticate,
  validate(createBookingSchema),
  createBookingController
);

router.get('/', authenticate, getAllBookingsController);

router.put(
  '/:bookingId',
  authenticate,
  validate(updateBookingSchema),
  updateBookingController
);

export default router;

