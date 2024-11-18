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
  alternate_mobileNumber: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: true,
  },
  alternate_email: {
    type: String,
    required: false,
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
  onBoardingDate: {
    type: Date,
    required: true,
  },
  clientMemberships: [
    {
      name: {
        type: String,
        required: true,
      },
      services: {
        type: [{
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
          sessions:{
            type: Number,
            required: true,
          },
        }],
        required: true,
      },
      description: {
        type: String,
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
    },
  ],
});

export default model("Client", clientSchema);
