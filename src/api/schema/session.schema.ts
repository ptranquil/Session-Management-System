import { object, string, ZodIssueCode } from 'zod';
import config from '../../../config';
import { checkObjectId } from '../utils/helper';
import { patientModel } from '../../db/model/patient.model';
import { therapistModel } from '../../db/model/therapist.model';
import mongoose from 'mongoose';

const dateValidityCheck = (date: string) => {
    const dateParts = date.split('/');
    const [day, month, year] = dateParts.map(Number);
    const inputDate = new Date(year, month - 1, day);

    /** Validating that the date is a future date */
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    return currentDate > inputDate;
}

const timeValidity = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
}

export const getSessionStartTime = ((date: string, timeSlot: string) => {
    const [day, month, year] = date.split('/').map(Number);
    const [hours, minutes] = timeSlot.split(':').map(Number);
    return new Date(year, month - 1, day, hours, minutes);
})

const sessionPayload = {
    body: object({
        type: string().refine(value => {
            return config.SESSIONS.SESSIONTYPEENUMS.includes(value.toLowerCase());
        }, { message: `Unexpected value, Expected: ${config.SESSIONS.SESSIONTYPEENUMS.join(',')}` }),
        date: string().refine((value) => {
            return !dateValidityCheck(value);
        }, {
            message: 'Invalid date format or not a future date. Use dd/mm/yyyy.',
        }),
        timeSlot: string().refine((value) => {
            return timeValidity(value);
        }, {
            message: 'Invalid time slot format',
        }),
        patientId: string().refine(
            async (value) => {
                return await checkObjectId(value, patientModel);
            },
            { message: "Invalid patient Id" }
        ),
        therapistId: string().refine(
            async (value) => {
                return checkObjectId(value, therapistModel);
            },
            { message: "Invalid therapist Id" }
        ),
        details: string().min(3),
        onlineSessionLink: string().optional()
    }).superRefine((val, ctx) => {
        if (val.type.toLocaleLowerCase() === config.SESSIONS.TYPEENUM2 && !val.onlineSessionLink) {
            ctx.addIssue({
                message: `Required for session type ${config.SESSIONS.TYPEENUM2}`,
                code: ZodIssueCode.custom,
                path: ["onlineSessionLink"]
            })
        }

        /** To check whether the time is not past time if date is today */
        const currentDateTime = new Date();
        const sessionStartTime = getSessionStartTime(val.date, val.timeSlot);
        if (sessionStartTime < currentDateTime) {
            ctx.addIssue({
                message: `Invalid time slot, should be future time`,
                code: ZodIssueCode.custom,
                path: ["timeSlot"]
            })
        }
    })
};


const sessionParamPayload = {
    params: object({
        id: string().refine((value) => {
            return mongoose.Types.ObjectId.isValid(value)
        }, {
            message: 'Invalid session Id in params'
        })
    })
};

export const sessionSchema = object({
    ...sessionPayload
});


export const sessionParamSchema = object({
    ...sessionParamPayload
});

export const sessionUpdateSchema = object({
    ...sessionPayload,
    ...sessionParamPayload,
});
