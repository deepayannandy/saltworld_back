import joi from "@hapi/joi";

export const registrationValidation = (data) => {
  const schema = joi.object().keys({
    email: joi.string().email().required(),
    mobile: joi
      .string()
      .length(10)
      .pattern(/[1-9]{1}[0-9]{9}/)
      .required(),
    password: joi.string().min(6).required(),
    firstName: joi.string().min(3).required(),
    lastName: joi.string().min(1).required(),
    userBranch: joi.string().min(2).required(),
    userType: joi.string().required(),
  });
  return schema.validate(data);
};
