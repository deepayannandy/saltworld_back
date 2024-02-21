import joi from "@hapi/joi";

export const serviceUpdateValidator = (data) => {
  const schema = joi
    .object()
    .keys({
      name: joi.string().optional(),
      category: joi.string().optional(),
      description: joi.string().optional(),
      duration: joi.number().optional(),
      cost: joi.number().optional(),
      sellingCost: joi.number().optional(),
      taxRate: joi.number().optional(),
      hsnCode: joi.string().optional(),
      resourceType: joi.string().optional(),
      includeTax: joi.number().optional(),
      active: joi.boolean().optional(),
      branch: joi.string().optional(),
    })
  return schema.validate(data);
};
