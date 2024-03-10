//validation
import joi from "@hapi/joi";
const { object, string } = joi;

export const login_validation = (data) => {
  const schema = object().keys({
    email: string().email().required(),
    password: string().min(6).required(),
  });
  return schema.validate(data);
};
