import { Schema, model } from "mongoose";

const instanceSchema = new Schema({
    path: {
        type: String,
        default: null
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    isClosed: {
        type: Boolean,
        default: false
    },
    expires: {
        type: Date,
        default: null
    }
},{timestamps: true})

const Instance = model("Instance", instanceSchema);
export default Instance;