import joi from "@hapi/joi";

export const registrationUpdateValidator = (data) => {
  const schema = joi.object().keys({
    email: joi.string().email(),
    mobile: joi
      .string()
      .length(10)
      .pattern(/[1-9]{1}[0-9]{9}/),
    password: joi.string().min(6),
    firstName: joi.string().min(3),
    lastName: joi.string().min(1),
    userStatus: joi.boolean(),
    userBranch: joi.string().min(2),
    userType: joi.string(),
  });
  return schema.validate(data);
};
