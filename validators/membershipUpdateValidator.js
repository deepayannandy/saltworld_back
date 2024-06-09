import joi from "@hapi/joi";

export const membershipUpdateValidator = (data) => {
  const schema = joi.object().keys({
    name: joi.string().optional(),
    serviceIds: joi.array().items(joi.string()).optional(),
    description: joi.string().optional(),
    cost: joi.number().optional(),
    sellingCost: joi.number().optional(),
    taxRate: joi.number().optional(),
    hsnCode: joi.string().optional(),
    active: joi.boolean().optional(),
    branch: joi.string().optional(),
    isUnlimited: joi.boolean().optional(),
    count: joi.number().optional(),
    validity: joi.number().optional(),
  });
  return schema.validate(data);
};
