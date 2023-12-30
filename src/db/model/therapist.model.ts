import mongoose from "mongoose";

export interface therapistDocument {
    name: string;
    email: string;
    mobile: string;
    isActive: boolean;
}

const therapistSchema = new mongoose.Schema<therapistDocument>({
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
    isActive: {
        type: Boolean,
        required: true,
        default: true
    }
}, {
    versionKey: false,
    timestamps: true,
})

export const therapistModel = mongoose.model("therapists", therapistSchema);