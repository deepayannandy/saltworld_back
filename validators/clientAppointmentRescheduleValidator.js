import joi from "@hapi/joi";

export const clientAppointmentRescheduleValidator = (data) => {
  const schema = joi.object().keys({
    clientId: joi.string().required(),
    membershipId: joi.string().required(),
    serviceId: joi.string().required(),
    personCount: joi.number().required(),
    startDateTime: joi.date().required(),
    branch: joi.string().required(),
    duration: joi.number().required(),
  });
  return schema.validate(data);
};
