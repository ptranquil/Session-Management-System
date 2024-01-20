import { Request, Response } from "express";
import { apiError, apiSuccess, anonymousErrors, checkExistence } from "../utils/helper";
import { patientDocument, patientModel } from "../../db/model/patient.model";
import config from "../../../config";
import { sessionModel } from "../../db/model/session.model";

export const addPatient = async (req: Request, res: Response) => {
    try {
        const data: patientDocument = req.body;

        /** check whether patient already exist based on email and mobile no  */
        const checkEmailExistence = await checkExistence("email", data.email, patientModel);
        if (checkEmailExistence) {
            anonymousErrors(409, config.PATIENT.EMAILALREADYEXIST, res);
            return;
        }

        const checkMobileAlreadyExist = await checkExistence("mobile", data.mobile, patientModel);
        if (checkMobileAlreadyExist) {
            anonymousErrors(409, config.PATIENT.MOBILEALREADYEXIST, res);
            return;
        }
        const whatsAppNo = data.isContactSame ? data.mobile : data.whatsApp;
        const newPatient = new patientModel({
            ...data,
            whatsApp: whatsAppNo,
        })
        await newPatient.save();
        apiSuccess(201, config.PATIENT.ADD, res, { _id: newPatient._id });
        return;
    } catch (error: any) {
        apiError(config.SOMETHINGWENTWRONG, res, error, __filename, "addPatient");
        return;
    }
}

export const getPatients = async (req: Request, res: Response) => {
    try {
        const patients = await patientModel.find({ isActive: true }).select("-isActive -createdAt -updatedAt");
        apiSuccess(200, config.PATIENT.FETCH, res, patients);
        return;
    } catch (error: any) {
        apiError(config.SOMETHINGWENTWRONG, res, error, __filename, "getPatients");
        return;
    }
}

export const getPatientByID = async (req: Request, res: Response) => {
    try {
        const patientId = req.params.id;
        const patients = await patientModel.findOne({ _id: patientId, isActive: true }).select("-isActive -createdAt -updatedAt");;
        if (!patients) {
            anonymousErrors(404, config.PATIENT.NOTFOUND, res);
            return;
        }
        apiSuccess(200, config.PATIENT.FETCH, res, patients);
        return;
    } catch (error: any) {
        apiError(config.SOMETHINGWENTWRONG, res, error, __filename, "getPatientByID");
        return;
    }
}

export const updatePatient = async (req: Request, res: Response) => {
    try {
        const patientId = req.params.id;
        const updateData = req.body;

        /** checking whether patient exists */
        const isExists = await patientModel.findOne({ _id: patientId, isActive: true });
        if (!isExists) {
            anonymousErrors(404, config.PATIENT.NOTFOUND, res);
            return;
        }

        /** checking whether updatedEmail or mobileNo already exist */
        if (isExists.email.toLowerCase() != updateData.email.toLowerCase()) {
            const checkEmailExistence = await checkExistence("email", updateData.email, patientModel);
            if (checkEmailExistence) {
                anonymousErrors(409, config.PATIENT.EMAILALREADYEXIST, res);
                return;
            }
        }

        if (isExists.mobile != updateData.mobile) {
            const checkMobileAlreadyExist = await checkExistence("mobile", updateData.mobile, patientModel);
            if (checkMobileAlreadyExist) {
                anonymousErrors(409, config.PATIENT.MOBILEALREADYEXIST, res);
                return;
            }
        }
        const whatsAppNo = updateData.isContactSame ? updateData.mobile : updateData.whatsApp;
        await patientModel.updateOne(
            { _id: patientId },
            {
                $set: {
                    ...updateData,
                    whatsApp: whatsAppNo
                }
            }
        )
        apiSuccess(200, config.PATIENT.UPDATE, res);
        return;
    } catch (error: any) {
        apiError(config.SOMETHINGWENTWRONG, res, error, __filename, "updatePatient");
        return;
    }
}

export const deletePatient = async (req: Request, res: Response) => {
    try {
        const patientId = req.params.id;
        const isExists = await patientModel.findOne({ _id: patientId, isActive: true });
        if (!isExists) {
            anonymousErrors(404, config.PATIENT.NOTFOUND, res);
            return;
        }

        /** 
         * checking whether patient having live or upcoming session
         * Restricting the deletion of session if the live or upcoming session exists with the patient
         *  */
        const session = await sessionModel.find({
            isActive: true,
            patientId,
            endTime: {
                $gte: new Date()
            }
        })
        if (session.length) {
            anonymousErrors(400, config.PATIENT.SESSIONLINKEDTOPATIENT, res);
            return;
        }

        await patientModel.updateOne(
            { _id: patientId },
            { $set: { isActive: false } }
        )
        apiSuccess(200, config.PATIENT.DELETE, res);
        return;
    } catch (error: any) {
        apiError(config.SOMETHINGWENTWRONG, res, error, __filename, "deletePatient");
        return;
    }
}