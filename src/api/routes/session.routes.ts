import express from "express";
import { checkbody } from "../middleware/checkPostRequestBody";
import { sessionPostRequestBody } from "../utils/reqBody";
import { addSession, deleteSession, getSession, getSessionByID, updateSession } from "../controller/sessions.controller";
import { sessionParamSchema, sessionSchema, sessionUpdateSchema } from "../schema/session.schema";
import validateZod from "../validator/zod";

const router = express.Router();

router.post(
    '/',
    checkbody(sessionPostRequestBody),
    validateZod(sessionSchema),
    addSession
);

router.get(
    '/',
    getSession
);

router.get(
    '/:id',
    validateZod(sessionParamSchema),
    getSessionByID
);

router.put(
    '/:id',
    validateZod(sessionUpdateSchema),
    updateSession
);

router.delete(
    '/:id',
    validateZod(sessionParamSchema),
    deleteSession
);

export default router;
