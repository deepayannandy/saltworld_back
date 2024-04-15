//validation
import joi from "@hapi/joi";

export const login_validation = (data) => {
  const schema = joi.object().keys({
    email: joi.string().email().required(),
    password: joi.string().min(6).required(),
  });
  return schema.validate(data);
};
