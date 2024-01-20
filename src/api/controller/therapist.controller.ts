import { Request, Response } from "express";
import { apiError, apiSuccess, anonymousErrors, checkExistence } from "../utils/helper";
import { therapistDocument, therapistModel } from "../../db/model/therapist.model";
import config from "../../../config";
import { sessionModel } from "../../db/model/session.model";

export const addTherapist = async (req: Request, res: Response) => {
    try {
        const data: therapistDocument = req.body;

        /** check whether therapist already exist based on email and mobile no  */
        const checkEmailExistence = await checkExistence("email", data.email, therapistModel);
        if (checkEmailExistence) {
            anonymousErrors(409, config.THERAPIST.EMAILALREADYEXIST, res);
            return;
        }

        const checkMobileAlreadyExist = await checkExistence("mobile", data.mobile, therapistModel);
        if (checkMobileAlreadyExist) {
            anonymousErrors(409, config.THERAPIST.MOBILEALREADYEXIST, res);
            return;
        }

        const newPatient = new therapistModel({
            ...data
        })
        await newPatient.save();
        apiSuccess(201, config.THERAPIST.ADD, res, { _id: newPatient._id });
        return;
    } catch (error: any) {
        apiError(config.SOMETHINGWENTWRONG, res, error, __filename, "addTherapist");
        return;
    }
}

export const getTherapist = async (req: Request, res: Response) => {
    try {
        const therapist = await therapistModel.find({ isActive: true }).select("-isActive -createdAt -updatedAt");
        apiSuccess(200, config.THERAPIST.FETCH, res, therapist);
        return;
    } catch (error: any) {
        apiError(config.SOMETHINGWENTWRONG, res, error, __filename, "getTherapist");
        return;
    }
}

export const getTherapistByID = async (req: Request, res: Response) => {
    try {
        const therapistId = req.params.id;
        const therapist = await therapistModel.findOne({ _id: therapistId, isActive: true }).select("-isActive -createdAt -updatedAt");
        if (!therapist) {
            anonymousErrors(404, config.THERAPIST.NOTFOUND, res);
            return;
        }
        apiSuccess(200, config.THERAPIST.FETCH, res, therapist);
        return;
    } catch (error: any) {
        apiError(config.SOMETHINGWENTWRONG, res, error, __filename, "getTherapistByID");
        return;
    }
}

export const updateTherapist = async (req: Request, res: Response) => {
    try {
        const therapistId = req.params.id;
        const updateData = req.body;

        /** checking whether patient exists */
        const isExists = await therapistModel.findOne({ _id: therapistId, isActive: true });
        if (!isExists) {
            anonymousErrors(404, config.THERAPIST.NOTFOUND, res);
            return;
        }

        /** checking whether updatedEmail or mobileNo already exist */
        if (isExists.email.toLowerCase() != updateData.email.toLowerCase()) {
            const checkEmailExistence = await checkExistence("email", updateData.email, therapistModel);
            if (checkEmailExistence) {
                anonymousErrors(409, config.THERAPIST.EMAILALREADYEXIST, res);
                return;
            }
        }

        if (isExists.mobile != updateData.mobile) {
            const checkMobileAlreadyExist = await checkExistence("mobile", updateData.mobile, therapistModel);
            if (checkMobileAlreadyExist) {
                anonymousErrors(409, config.THERAPIST.MOBILEALREADYEXIST, res);
                return;
            }
        }

        await therapistModel.updateOne(
            { _id: therapistId },
            { $set: { ...updateData } }
        )
        apiSuccess(200, config.THERAPIST.UPDATE, res);
        return;
    } catch (error: any) {
        apiError(config.SOMETHINGWENTWRONG, res, error, __filename, "updateTherapist");
        return;
    }
}

export const deleteTherapist = async (req: Request, res: Response) => {
    try {
        const therapistId = req.params.id;
        const isExists = await therapistModel.findOne({ _id: therapistId, isActive: true });
        if (!isExists) {
            anonymousErrors(404, config.THERAPIST.NOTFOUND, res);
            return;
        }

        /** 
         * checking whether therapist having live or upcoming session
         * Restricting the deletion of therapist if the live or upcoming session exists with the patient
         *  */
        const session = await sessionModel.find({
            isActive: true,
            therapistId,
            endTime: {
                $gte: new Date()
            }
        })
        if (session.length) {
            anonymousErrors(400, config.THERAPIST.SESSIONLINKEDTOTHERAPIST, res);
            return;
        }

        await therapistModel.updateOne(
            { _id: therapistId },
            { $set: { isActive: false } }
        )
        apiSuccess(200, config.THERAPIST.DELETE, res);
        return;
    } catch (error: any) {
        apiError(config.SOMETHINGWENTWRONG, res, error, __filename, "deleteTherapist");
        return;
    }
}