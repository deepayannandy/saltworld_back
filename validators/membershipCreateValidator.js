import joi from "@hapi/joi";

export const membershipCreateValidator = (data) => {
  const schema = joi.object().keys({
    name: joi.string().required(),
    serviceIds: joi.array().items(joi.string()).required(),
    description: joi.string().required(),
    cost: joi.number().required(),
    sellingCost: joi.number().required(),
    taxRate: joi.number().required(),
    hsnCode: joi.string().required(),
    active: joi.boolean().required(),
    branch: joi.string().required(),
    isUnlimited: joi.boolean().required(),
    count: joi.number().required(),
    validity: joi.number().optional(),
  });
  return schema.validate(data);
};
