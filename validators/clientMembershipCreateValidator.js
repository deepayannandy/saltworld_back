import joi from "@hapi/joi";

export const clientMembershipCreateValidator = (data) => {
  const schema = joi
    .object()
    .keys({
      name: joi.string().required(),
      services: joi.object().required(),
      description: joi.string().required(),
      cost: joi.number().required(),
      sellingCost: joi.number().required(),
      taxRate:joi.number().required(),
      hsnCode: joi.string().required(),
      active: joi.string().required(),
      branch: joi.string().required(),
      isUnlimited: joi.boolean().required(),
      validity: joi.number().required()
    })
  return schema.validate(data);
};
