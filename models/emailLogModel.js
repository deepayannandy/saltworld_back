import { Schema, model } from "mongoose";

const emailLogSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  userEmail: {
    type: String,
    required: true,
  },
  bookingId: {
    type: String,
    required: true,
  },
  emailBody: {
    type: String,
    required: true,
  },
  emailType: {
    type: String,
    required: true,
  },
  timeStamp: {
    type: String,
    required: true,
  },
  isSuccessfullySend:{
    type: Boolean,
    required: true,
  },

});

export default model("emailLog", emailLogSchema);
