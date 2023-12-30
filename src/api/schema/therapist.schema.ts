import mongoose from 'mongoose';
import { object, string } from 'zod';
import { validateMobileNumber } from '../utils/helper';

const therapistPayload = {
    body: object({
        name: string().min(3),
        mobile: string()
            .refine((value) => {
                return validateMobileNumber(value)
            }, { message: "Invalid mobile no" }),
        email: string().email(),
    })
};

const therapistParamPayload = {
    params: object({
        id: string().refine((value) => {
            return mongoose.Types.ObjectId.isValid(value)
        }, {
            message: 'Invalid objectId in params'
        })
    })
};

export const therapistSchema = object({
    ...therapistPayload
});

export const therapistParamSchema = object({
    ...therapistParamPayload
});

export const therapistUpdateSchema = object({
    ...therapistPayload,
    ...therapistParamPayload
});