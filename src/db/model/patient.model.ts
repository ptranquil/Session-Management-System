import mongoose from "mongoose";

export interface patientDocument {
    name: string;
    email: string;
    mobile: string;
    whatsApp: string;
    address: string;
    isContactSame: boolean;
    isActive: boolean;
}

const patientSchema = new mongoose.Schema<patientDocument>({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true
    },
    whatsApp: {
        type: String,
        required: false,
        default: null
    },
    isContactSame: {
        type: Boolean,
        required: true
    },
    address: {
        type: String,
        required: false,
        default: null
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

export const patientModel = mongoose.model("patients", patientSchema)