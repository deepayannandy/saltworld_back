import joi from "@hapi/joi";

export const clientUpdateValidator = (data) => {
  const schema = joi.object().keys({
    firstName: joi
      .string()
      .optional()
      .min(3)
      .max(40)
      .disallow("_", "-", " ")
      .allow(""),
    lastName: joi
      .string()
      .optional()
      .min(3)
      .max(40)
      .disallow("_", "-", " ")
      .allow(""),
    mobileNumber: joi.number().min(10).max(13),
    alternate_mobileNumber: joi.number().min(0).max(13),
    email: joi.string().email(),
    alternate_email: joi.string(),
    gender: joi.string().optional().allow(""),
    birthDate: joi.string().optional().allow(""),
    anniversary: joi.string().optional().allow(""),
    occupation: joi.string().optional().allow(""),
    source: joi.string().optional().allow(""),
    type: joi.string().optional().allow(""),
    pan: joi.string().optional().allow(""),
    gst: joi.string().optional().allow(""),
    companyLegalName: joi.string().optional().allow(""),
    companyTradeName: joi.string().optional().allow(""),
    billingAddress: joi.string().optional().allow(""),
    shippingAddress: joi.string().optional().allow(""),
    emailNotification: joi.boolean().optional(),
    emailMarketingNotification: joi.boolean().optional(),
    parentBranchId: joi.string().optional().allow(""),
    clientMemberships: joi.array().optional().items({
      membershipId: joi.string(),
      paidAmount: joi.number(),
      active: joi.boolean(),
      countLeft: joi.number(),
      startDate: joi.date(),
      endDate: joi.date(),
    }),
    notes: joi.array().optional().items({
      author: joi.string(),
      note: joi.string(),
      date: joi.date(),
    }),
    appointments: joi.array().optional().items({
      title: joi.string(),
      membershipId: joi.string(),
      serviceId: joi.string(),
      personCount: joi.number(),
      rescheduleCount: joi.number(),
      startDateTime: joi.date(),
      endDateTime: joi.date(),
      resource: joi.string(),
      branch: joi.string(),
    }),
  });
  return schema.validate(data);
};
