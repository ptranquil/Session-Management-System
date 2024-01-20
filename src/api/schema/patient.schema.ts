import mongoose from 'mongoose';
import { object, string, ZodIssueCode, boolean } from 'zod';
import { validateMobileNumber } from '../utils/helper';

const patientPayload = {
    body: object({
        name: string().min(3),
        mobile: string()
            .refine((value) => {
                return validateMobileNumber(value)
            }, { message: "Invalid mobile " }),
        whatsApp: string().optional(),
        isContactSame: boolean(),
        email: string().email(),
        address: string().min(3),
    }).superRefine((val, ctx) => {
        if (!val.isContactSame && !val.whatsApp) {
            ctx.addIssue({
                message: `whatsApp no is required`,
                code: ZodIssueCode.custom,
                path: ["whatsApp"]
            })
        }

        if (val.whatsApp && !validateMobileNumber(val.whatsApp)) {
            ctx.addIssue({
                message: `Invalid whatsApp no`,
                code: ZodIssueCode.custom,
                path: ["whatsApp"]
            })
        }
    })
};

const patientParamPayload = {
    params: object({
        id: string().refine((value) => {
            return mongoose.Types.ObjectId.isValid(value)
        }, {
            message: 'Invalid patient Id in params',
        })
    })
};

export const patientSchema = object({
    ...patientPayload
});

export const patientParamSchema = object({
    ...patientParamPayload
});

export const patientUpdateSchema = object({
    ...patientPayload,
    ...patientParamPayload
});