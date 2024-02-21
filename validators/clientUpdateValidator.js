import joi from "@hapi/joi";

export const clientUpdateValidator = (data) => {
  const schema = joi
    .object()
    .keys({
      firstName: joi
        .string()
        .optional()
        .min(3)
        .max(40)
        .disallow(["_", "-", " "]),
      lastName: joi
        .string()
        .optional()
        .min(3)
        .max(40)
        .disallow(["_", "-", " "]),
      mobileNumber: joi.number().optional().min(10).max(10),
      email: joi.string().optional().email(),
      gender: joi.string().optional(),
      birthDate: joi.date().optional(),
      anniversary: joi.string().optional(),
      occupation: joi.string().optional(),
      source: joi.string().optional(),
      type: joi.string().optional(),
      pan: joi.string().optional(),
      gst: joi.string().optional(),
      companyLegalName: joi.string().optional(),
      companyTradeName: joi.string().optional(),
      billingAddress: joi.string().optional(),
      shippingAddress: joi.string().optional(),
      emailNotification: joi.boolean().optional(),
      emailMarketingNotification: joi.boolean().optional(),
      parentBranchId: joi.string().optional(),
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
    })
    .options({ presence: "required" })
    .required();
  return schema.validate(data);
};
