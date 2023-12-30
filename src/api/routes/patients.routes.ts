import express from "express";
import { checkbody } from "../middleware/checkPostRequestBody";
import { patientPostRequestbody } from "../utils/reqBody";
import { patientParamSchema, patientSchema, patientUpdateSchema } from "../schema/patient.schema";
import { addPatient, deletePatient, getPatientByID, getPatients, updatePatient } from "../controller/patients.controller";
import validateZod from "../validator/zod";

const router = express.Router();

router.post(
    '/',
    checkbody(patientPostRequestbody),
    validateZod(patientSchema),
    addPatient
);

router.get(
    '/',
    getPatients
);

router.get(
    '/:id',
    validateZod(patientParamSchema),
    getPatientByID
);

router.put(
    '/:id',
    validateZod(patientUpdateSchema),
    updatePatient
);

router.delete(
    '/:id',
    validateZod(patientParamSchema),
    deletePatient
);

export default router;
