import joi from "@hapi/joi";

export const clientMembershipCreateValidator = (data) => {
  const schema = joi
    .object()
    .keys({
      membershipId: joi.string(),
      paidAmount: joi.number(),
      active: joi.boolean(),
      countLeft: joi.number(),
      startDate: joi.date(),
    })
    .options({ presence: "required" })
    .required();
  return schema.validate(data);
};
