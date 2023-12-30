import express from "express";
import sessionRoute from './session.routes';
import patientRoute from './patients.routes';
import therapistRoute from './therapist.routes';

const router = express.Router();

router.use("/session", sessionRoute);
router.use("/patient", patientRoute);
router.use("/therapist", therapistRoute);

export default router;
