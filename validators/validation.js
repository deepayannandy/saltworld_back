//validation
import joi from "@hapi/joi";
const { object, string } = joi;

export const resistration_validation = (data) => {
  const schema = object().keys({
    email: string().email().required(),
    mobile: string()
      .length(10)
      .pattern(/[1-9]{1}[0-9]{9}/)
      .required(),
    password: string().min(6).required(),
    FirstName: string().min(3).required(),
    LastName: string().min(1).required(),
    UserBranch: string().min(2).required(),
    UserType: string().required(),
  });
  return schema.validate(data);
};

export const login_validation = (data) => {
  const schema = object().keys({
    email: string().email().required(),
    password: string().min(6).required(),
  });
  return schema.validate(data);
};
