import { Schema, model } from "mongoose";

const membershipsSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  services: {
    type: [Object],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  cost: {
    type: Number,
    required: true,
  },
  sellingCost: {
    type: Number,
    required: true,
  },
  taxRate: {
    type: Number,
    required: true,
  },
  hsnCode: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
    required: true,
  },
  branch: {
    type: String,
    required: true,
  },
  isUnlimited: {
    type: Boolean,
    required: true,
  },
  validity: {
    type: Number,
    required: true,
  },
});

export default model("Membership", membershipsSchema);
