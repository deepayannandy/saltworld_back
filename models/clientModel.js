import { Schema, model } from "mongoose";

const clientSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: false,
  },
  mobileNumber: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: false,
  },
  birthDate: {
    type: String,
    required: false,
  },
  anniversary: {
    type: String,
    required: false,
  },
  occupation: {
    type: String,
    required: false,
  },
  source: {
    type: String,
    required: false,
  },
  type: {
    type: String,
    required: false,
  },
  pan: {
    type: String,
    required: false,
  },
  gst: {
    type: String,
    required: false,
  },
  companyLegalName: {
    type: String,
    required: false,
  },
  companyTradeName: {
    type: String,
    required: false,
  },
  billingAddress: {
    type: String,
    required: false,
  },
  shippingAddress: {
    type: String,
    required: false,
  },
  emailNotification: {
    type: Boolean,
    required: true,
  },
  emailMarketingNotification: {
    type: Boolean,
    required: true,
  },
  parentBranchId: {
    type: String,
    required: true,
  },
  clientMemberships: [
    {
      membershipId: {
        type: String,
        required: true,
      },
      paidAmount: {
        type: Number,
        required: true,
      },
      active: {
        type: Boolean,
        required: true,
      },
      countLeft: {
        type: Number,
        required: true,
      },
      startDate: {
        type: Date,
        required: true,
      },
      endDate: {
        type: Date,
        required: true,
      },
    },
  ],
  notes: [
    {
      author: {
        type: String,
        required: true,
      },
      note: {
        type: String,
        required: true,
      },
      date: {
        type: Date,
        required: true,
      },
    },
  ],
  appointments: [
    {
      title: {
        type: String,
        required: true,
      },
      membershipId: {
        type: String,
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
    },
  ],
});

export const Client = model("Client", clientSchema);
