import joi from "@hapi/joi";

export const clientAppointmentCreateValidator = (data) => {
  const schema = joi.array().items({
    membershipId: joi.string().optional(),
    serviceId: joi.string().required(),
    personCount: joi.number().required(),
    startDateTime: joi.date().required(),
    branch: joi.string().required(),
    duration: joi.number().required(),
  });
  return schema.validate(data);
};
