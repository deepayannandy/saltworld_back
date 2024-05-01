import joi from "@hapi/joi";

export const clientCreateValidator = (data) => {
  const schema = joi
    .object()
    .keys({
      firstName: joi.string().min(3).max(40).disallow(["_", "-", " "]),
      lastName: joi.string().min(3).max(40).disallow(["_", "-", " "]),
      mobileNumber: joi.number().min(10).max(13),
      alternate_mobileNumber: joi.number().min(0).max(13),
      email: joi.string().email(),
      alternate_email: joi.string(),
      gender: joi.string(),
      birthDate: joi.date(),
      anniversary: joi.string(),
      occupation: joi.string(),
      source: joi.string(),
      type: joi.string(),
      pan: joi.string(),
      gst: joi.string(),
      companyLegalName: joi.string(),
      companyTradeName: joi.string(),
      billingAddress: joi.string(),
      shippingAddress: joi.string(),
      emailNotification: joi.boolean(),
      emailMarketingNotification: joi.boolean(),
      parentBranchId: joi.string(),
    })
    .options({ presence: "required" })
    .required();
  return schema.validate(data);
}