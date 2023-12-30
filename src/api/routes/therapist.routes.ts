import express from "express";
import { checkbody } from "../middleware/checkPostRequestBody";
import { therapistPostRequestbody } from "../utils/reqBody";
import validateZod from "../validator/zod";
import { therapistParamSchema, therapistSchema, therapistUpdateSchema } from "../schema/therapist.schema";
import { addTherapist, deleteTherapist, getTherapist, getTherapistByID, updateTherapist } from "../controller/therapist.controller";

const router = express.Router();

router.post(
    '/',
    checkbody(therapistPostRequestbody),
    validateZod(therapistSchema),
    addTherapist
);

router.get(
    '/',
    getTherapist
);

router.get(
    '/:id',
    validateZod(therapistParamSchema),
    getTherapistByID
);

router.put(
    '/:id',
    validateZod(therapistUpdateSchema),
    updateTherapist
)

router.delete(
    '/:id',
    validateZod(therapistParamSchema),
    deleteTherapist
)

export default router;
