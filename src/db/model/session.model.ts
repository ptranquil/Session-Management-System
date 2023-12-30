import mongoose, { Types, mongo } from "mongoose";

export interface sessionDocument {
    type: string;
    startTime: Date;
    endTime: Date;
    patientId: Types.ObjectId;
    therapistId: Types.ObjectId;
    details: string;
    onlineSessionLink: string;
    isActive: boolean;
}

const sessionSchema = new mongoose.Schema<sessionDocument>({
    type: {
        type: String,
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "patient",
        required: true
    },
    therapistId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "therapist",
        required: true
    },
    details: {
        type: String,
        required: true
    },
    onlineSessionLink: {
        type: String,
        default: null,
        required: false
    },
    isActive: {
        type: Boolean,
        required: true,
        default: true
    }
}, {
    versionKey: false,
    timestamps: true,
})

export const sessionModel = mongoose.model("sessions", sessionSchema)