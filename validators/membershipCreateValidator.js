import joi from "@hapi/joi";

export const membershipCreateValidator = (data) => {
  const schema = joi
    .object()
    .keys({
      name: joi.string(),
      serviceIds: joi.array().items(joi.string()),
      description: joi.string(),
      cost: joi.number(),
      sellingCost: joi.number(),
      taxRate: joi.number(),
      hsnCode: joi.string(),
      active: joi.boolean(),
      branch: joi.string(),
      isUnlimited: joi.boolean(),
      count: joi.number(),
      validity: joi.number(),
    })
    .options({ presence: "required" })
    .required();
  return schema.validate(data);
};
