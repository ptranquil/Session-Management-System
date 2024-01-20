import { object, string, ZodIssueCode } from 'zod';
import config from '../../../config';
import { checkObjectId } from '../utils/helper';
import { patientModel } from '../../db/model/patient.model';
import { therapistModel } from '../../db/model/therapist.model';
import mongoose from 'mongoose';

const dateValidityCheck = (date: string) => {
    const dateParts = date.split('/');
    const [day, month, year] = dateParts.map(Number);
    if (
        isNaN(day) || day < 1 || day > 31 ||
        isNaN(month) || month < 1 || month > 12 ||
        isNaN(year) || year < 2022 || year > 3001
    ) {
        return false;
    }
    /** Validating that the date is a future date */
    // let currentday = new Date().getDate();
    // let currentMonth = new Date().getMonth() + 1;
    // let currentYear = new Date().getFullYear();
    // console.log(currentday, day, currentMonth, month, currentYear, year)
    // if (currentday < day || currentMonth < month || currentYear < year) {
    //     console.log("I entered heeeeere")
    //     return false;
    // }
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    let sessionDate = new Date(date);
    if (sessionDate < currentDate) {
        return false
    }
    return true;
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
            return dateValidityCheck(value);
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

const sessionQueryPayload = {
    query: object({
        date: string().refine((value) => {
            const dateParts = value.split('/');
            const [day, month, year] = dateParts.map(Number);
            if (
                isNaN(day) || day < 1 || day > 31 ||
                isNaN(month) || month < 1 || month > 12 ||
                isNaN(year) || year < 2022 || year > 3001
            ) {
                return false;
            }
            return true;
        }, { message: 'Invalid date format or not a future date. Use dd/mm/yyyy.' }).optional()
    })
}

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

export const sessionQuerySchema = object({
    ...sessionQueryPayload
})
