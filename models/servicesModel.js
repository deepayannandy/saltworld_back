import { Schema, model } from "mongoose";

const servicesSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
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
  resourceType: {
    type: String,
    required: true,
  },
  includeTax: {
    type: Number,
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
});

export default model("Service", servicesSchema);
