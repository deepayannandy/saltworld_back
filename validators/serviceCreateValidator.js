import joi from "@hapi/joi";

export const serviceCreateValidator = (data) => {
  const schema = joi
    .object()
    .keys({
      name: joi.string(),
      category: joi.string(),
      description: joi.string(),
      duration: joi.number(),
      cost: joi.number(),
      sellingCost: joi.number(),
      taxRate: joi.number(),
      hsnCode: joi.string(),
      resourceType: joi.string(),
      includeTax: joi.number().optional(),
      active: joi.boolean(),
      branch: joi.string(),
    })
    .options({ presence: "required" })
    .required();
  return schema.validate(data);
};
