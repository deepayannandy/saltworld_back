import joi from "@hapi/joi";

export const clientAppointmentCreateValidator = (data) => {
  const schema = joi
    .object()
    .keys({
      membershipId: joi.string(),
      serviceId: joi.string().required(),
      personCount: joi.number().required(),
      startDateTime: joi.date().required(),
      branch: joi.string().required(),
      duration: joi.number().required(),
    })
  return schema.validate(data);
};
