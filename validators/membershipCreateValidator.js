import joi from "@hapi/joi";

export const membershipCreateValidator = (data) => {
  const schema = joi.object().keys({
    name: joi.string().required(),
    services: joi.array().required(),
    description: joi.string().required(),
    cost: joi.number().required(),
    sellingCost: joi.number().required(),
    taxRate: joi.number().required(),
    hsnCode: joi.string().required(),
    active: joi.boolean().required(),
    branch: joi.string().required(),
    isUnlimited: joi.boolean().required(),
    validity: joi.number().required(),
  });
  return schema.validate(data);
};
