import { Schema, model } from "mongoose";

const userSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  userType: {
    type: String,
    required: true,
  },
  userBranch: {
    type: String,
    required: true,
  },
  userStatus: {
    type: Boolean,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  onBoardingDate: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    required: false,
  },
  statusBg: {
    type: String,
    required: false,
  },
});

export const User = model("User", userSchema);
