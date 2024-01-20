import { Request, Response } from 'express';
import { apiError, apiSuccess, anonymousErrors } from '../utils/helper';
import { sessionModel } from '../../db/model/session.model';
import { getSessionStartTime } from '../schema/session.schema';
import config from '../../../config';
import mongoose from 'mongoose';

interface addSession {
    type: string;
    timeSlot: string;
    date: string;
    patientId: string;
    therapistId: string;
    details: string;
    onlineSessionLink: string;
    isActive: boolean;
};

/**
 * 
 * @param query any filter query based the aggregate data between session including patient and therapist
 * @returns array of sessions
 */
const getSessionDetails = async (query: any) => {
    const sessions = await sessionModel.aggregate([
        {
            $match: query
        },
        {
            $lookup: {
                from: "patients",
                localField: "patientId",
                foreignField: "_id",
                as: "patient"
            }
        },
        { $unwind: "$patient" },
        {
            $lookup: {
                from: "therapists",
                localField: "therapistId",
                foreignField: "_id",
                as: "therapist"
            }
        },
        { $unwind: "$therapist" },
        {
            $project: {
                _id: 1,
                type: 1,
                startTime: 1,
                endTime: 1,
                details: 1,
                onlineSessionLink: 1,
                patient: {
                    _id: 1,
                    name: 1,
                    email: 1,
                    mobile: 1,
                    whatsApp: 1,
                    isContactSame: 1,
                },
                therapist: {
                    _id: 1,
                    name: 1,
                    email: 1,
                    mobile: 1,
                }
            }
        }
    ])
    return sessions;
}

const getFormattedSessionDetails = async (query: any) => {
    let currentDateTime = new Date();
    // const sessions = await getSessionDetails(query);
    const sessions = await sessionModel.aggregate([
        {
            $match: query
        },
        {
            $lookup: {
                from: "patients",
                localField: "patientId",
                foreignField: "_id",
                as: "patient"
            }
        },
        { $unwind: "$patient" },
        {
            $lookup: {
                from: "therapists",
                localField: "therapistId",
                foreignField: "_id",
                as: "therapist"
            }
        },
        { $unwind: "$therapist" },
        {
            $lookup: {
                from: "sessions",
                let: { patientId: "$patientId" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ["$patientId", "$$patientId"]
                            }
                        }
                    },
                    {
                        $sort: {
                            startTime: -1
                        }
                    },
                    // {
                    //     $group: {
                    //         _id: "$patientId",
                    //         lastSessionDate: { $first: "$startTime" }
                    //     }
                    // }
                ],
                as: "lastSession"
            }
        },
        {
            $project: {
                _id: 1,
                type: 1,
                startTime: 1,
                endTime: 1,
                details: 1,
                onlineSessionLink: 1,
                patient: {
                    _id: 1,
                    name: 1,
                    email: 1,
                    mobile: 1,
                    whatsApp: 1,
                    isContactSame: 1,
                },
                therapist: {
                    _id: 1,
                    name: 1,
                    email: 1,
                    mobile: 1,
                },
                lastSessionDetails: { $ifNull: [{ $arrayElemAt: ["$lastSession", 1] }, null] }
            }
        }
    ])
    let currentSession: any = [];
    let upcomingSession: any = [];
    let passedSession: any = [];
    if (sessions.length) {
        sessions.forEach((session) => {
            if (session.startTime <= currentDateTime && session.endTime > currentDateTime) {
                currentSession.push(session);
            } else if (session.startTime > currentDateTime) {
                upcomingSession.push(session);
            } else {
                passedSession.push(session);
            }
        })
    }
    // return {
    //     currentSession,
    //     upcomingSession,
    //     passedSession
    // };
    return sessions;
}
/**
 * 
 * @param startTime : begin time of the sessionId
 * @param endTime : termiation time of the session
 * @param therapistId : Therapist id who will conduct the session
 * @returns : boolean (true signifies slot already booked within the specified timeframe & false vice-versa)
 */
const isSlotAvailable = async (startTime: any, endTime: any, therapistId: any, patientId: any) => {
    const count = await sessionModel.find({
        $or: [
            { therapistId },
            { patientId }
        ],
        isActive: true,
        $and: [
            { startTime: { $lt: new Date(endTime) } },
            { endTime: { $gt: new Date(startTime) } }
        ]
    });
    return count.length > 0;
};

export const addSession = async (req: Request, res: Response) => {
    try {
        const data: addSession = req.body;
        const startTime = getSessionStartTime(data.date, data.timeSlot);
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

        /** checking whether a time slot is available or not */
        const temp = await isSlotAvailable(startTime, endTime, req.body.therapistId, req.body.patientId);
        if (temp) {
            anonymousErrors(200, config.SESSIONS.SLOTNOTAAILABLE, res);
            return;
        }

        const newRecord = new sessionModel({
            type: data.type.toLowerCase(),
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            patientId: data.patientId,
            therapistId: data.therapistId,
            details: data.details,
            onlineSessionLink: data.onlineSessionLink || ""
        });

        await newRecord.save();
        apiSuccess(201, config.SESSIONS.ADD, res);
        return;
    } catch (error: any) {
        apiError(config.SOMETHINGWENTWRONG, res, error, __filename, "addSession");
        return;
    }
};

export const getSession = async (req: Request, res: Response) => {
    try {
        const { date } = req.query;
        let query: object;
        let sessions;
        if (date && typeof date === 'string') {
            const temp = date.split('/');
            const [day, month, year] = temp.map(Number);
            const dateStartTime = new Date(year, month - 1, day, 0, 0, 0);
            const dateEndTime = new Date(year, month - 1, day, 23, 59, 59);
            query = {
                isActive: true,
                startTime: {
                    $gt: dateStartTime,
                    $lt: dateEndTime,
                }
            }
            sessions = await getFormattedSessionDetails(query);
        } else {
            query = { isActive: true };
            sessions = await getSessionDetails(query);
        }

        apiSuccess(200, config.SESSIONS.FETCH, res, sessions);
        return;
    } catch (error: any) {
        apiError(config.SOMETHINGWENTWRONG, res, error, __filename, "getSession");
        return;
    }
};

export const getSessionByID = async (req: Request, res: Response) => {
    try {
        const sessionid = req.params.id;
        const session = await getSessionDetails({ _id: new mongoose.Types.ObjectId(sessionid), isActive: true })
        if (session.length < 1) {
            anonymousErrors(404, config.SESSIONS.NOTFOUND, res);
            return;
        }
        apiSuccess(200, config.SESSIONS.FETCH, res, session[0]);
        return;
    } catch (error: any) {
        apiError(config.SOMETHINGWENTWRONG, res, error, __filename, "getSessionByID");
        return;
    }
}

export const updateSession = async (req: Request, res: Response) => {
    try {
        const sessionId = req.params.id;
        const updateData = req.body;

        const existingSession = await sessionModel.findOne({ _id: sessionId, isActive: true });
        if (!existingSession) {
            anonymousErrors(404, config.SESSIONS.NOTFOUND, res);
            return;
        }
        /** Slot availability check */
        const startTime = getSessionStartTime(updateData.date, updateData.timeSlot);
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

        /** checking whether a time slot is available or not if the updated date and time is not equals to the existing date and time */
        if (existingSession.startTime.getTime() !== startTime.getTime() || existingSession.endTime.getTime() !== endTime.getTime()) {
            const temp = await isSlotAvailable(startTime, endTime, req.body.therapistId, req.body.patientId);
            if (temp) {
                anonymousErrors(200, config.SESSIONS.SLOTNOTAAILABLE, res);
                return;
            }
        }

        await sessionModel.updateOne(
            { _id: sessionId },
            {
                type: updateData.type.toLowerCase(),
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                patientId: updateData.patientId,
                therapistId: updateData.therapistId,
                details: updateData.details,
                onlineSessionLink: updateData.onlineSessionLink || ""
            }
        );
        apiSuccess(200, config.SESSIONS.UPDATE, res);
        return;
    } catch (error: any) {
        apiError(config.SOMETHINGWENTWRONG, res, error, __filename, "updateSession");
        return;
    }
}

export const deleteSession = async (req: Request, res: Response) => {
    try {
        const sessionId = req.params.id;
        const isSessionExist = await sessionModel.findOne({ _id: sessionId, isActive: true });
        if (!isSessionExist) {
            anonymousErrors(404, config.SESSIONS.NOTFOUND, res);
            return;
        }

        /** checking a condition if user is trying to delete the ongoing session */
        const startTime = new Date();
        if (startTime > isSessionExist.startTime && startTime < isSessionExist.endTime) {
            anonymousErrors(400, config.SESSIONS.ONGOINGSESSIONDELETEERROR, res);
            return;
        }

        await sessionModel.updateOne(
            { _id: sessionId },
            { $set: { isActive: false } }
        );
        apiSuccess(200, config.SESSIONS.DELETE, res);
        return;
    } catch (error: any) {
        apiError(config.SOMETHINGWENTWRONG, res, error, __filename, "deleteSession");
        return;
    }
};