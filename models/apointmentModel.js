import { Schema, model } from "mongoose";

const appointmentSchema = new Schema({
  userId:{
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  membershipId: {
    type: String,
    required: false,
  },
  serviceId: {
    type: String,
    required: true,
  },
  personCount: {
    type: Number,
    required: true,
  },
  rescheduleCount: {
    type: Number,
    required: true,
  },
  startDateTime: {
    type: Date,
    required: true,
  },
  endDateTime: {
    type: Date,
    required: true,
  },
  resource: {
    type: String,
    required: true,
  },
  branch: {
    type: String,
    required: true,
  },
  isCancelled: {
    type: Boolean,
    required: false,
  },
  bookedBy: {
    type: String,
    required: true,
  },
  cancelledBy: {
    type: String,
    required: false,
  },
  cancelledOn: {
    type: Date,
    required: false,
  },
  duration:{
    type: Number,
    required:true
  },
  isNoShow:{
    type: Boolean,
    required:false
  }
});

export default model("appointment", appointmentSchema);