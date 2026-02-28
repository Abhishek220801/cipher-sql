import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    token: {
      type: String,
      required: true,
    },
    ip: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
    db: {
      type: Schema.Types.ObjectId,
      ref: "Instance"
    }
  },
  { timestamps: true },
);

userSchema.index({ ip: 1, userAgent: 1 });

const User = model("User", userSchema);
export default User;
