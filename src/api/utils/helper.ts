import { Response } from "express";
import logger from "../../logger";
import mongoose from "mongoose";
import * as _ from "lodash";

/**
 * 
 * @param statusCode The status code to be thrown with the response object
 * @param errorMessage The error message to be thrown if found invalid
 * @param res  Express Response Object
 * @returns response object based on the specified condition
 */
export const anonymousErrors = (
    statusCode: number,
    errorMessage: string | string[],
    res: Response
) => {
    return res.status(statusCode).send({
        status: false,
        message: errorMessage,
    });
};

/**
 * 
 * @param errorMessage The message to be return within the api error response
 * @param res Express Response Object
 * @param error The error message thrown
 * @param fileName The file name where the error has been thrown
 * @param functionName The function name where the error appeared
 * @returns response object based on the specified condition
 */
export const apiError = (
    errorMessage: string,
    res: Response,
    error: any,
    fileName: any,
    functionName: string
) => {
    logger(fileName).error(`Func(): ${functionName} message : ${error.message}`);
    return res.status(500).send({
        status: false,
        message: errorMessage,
    });
};

/**
 * 
 * @param statusCode The status code to be thrown with the response object
 * @param message The hardcoded message with the success response
 * @param res Express Response Object 
 * @param data The data with the success response
 * @returns response object based on the specified condition
 */
export const apiSuccess = (
    statusCode: number,
    message: string,
    res: Response,
    data?: any
) => {
    return res.status(statusCode).json({
        status: true,
        message,
        data: data || []
    });
};

/**
 * 
 * @param toCheck email or mobile as of now
 * @param data email or mobile
 * @param model The model where the query will be fired
 * @returns length of records if found
 */
export const checkExistence = async (toCheck: string, data: string, model: any) => {
    if (toCheck == "email") {
        const isEmailAreadyExist = await model.find({
            isActive: true,
            email: data
        })
        return isEmailAreadyExist.length;
    }

    if (toCheck == "mobile") {
        const isEmailAreadyExist = await model.find({
            isActive: true,
            mobile: data
        })
        return isEmailAreadyExist.length;
    }
}

/**
 * 
 * @param value Any object ID to be whether it is a valid mongoose object ID
 * @param model The model where the query will be fired
 * @returns boolean value based on validity
 */
export const checkObjectId = async (value: string, model: any) => {
    try {
        let res = 0;
        if (mongoose.Types.ObjectId.isValid(value)) {
            const isValid = await model.findOne({ _id: value, isActive: true })
            if (isValid) {
                res = 1;
            }
        }
        return res > 0;
    } catch (error) {
        return false;
    }
};

/** To validate mobile No, currently validate number of 10 digit */
export const validateMobileNumber = (mobileNumber: string) => {
    const mobileNumberRegex = /^\d{10}$/
    return mobileNumberRegex.test(mobileNumber)
}