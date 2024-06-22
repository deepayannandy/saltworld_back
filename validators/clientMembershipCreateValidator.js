import joi from "@hapi/joi";

export const clientMembershipCreateValidator = (data) => {
  const schema = joi
    .object()
    .keys({
      membershipId: joi.string().required(),
      paidAmount: joi.number().required(),
      active: joi.boolean().required(),
      countLeft: joi.number().required(),
      startDate: joi.date().required(),
      endDate: joi.date().required(),
    })
  return schema.validate(data);
};
