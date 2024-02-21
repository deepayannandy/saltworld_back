import joi from "@hapi/joi";

export const clientAppointmentRescheduleValidator = (data) => {
  const schema = joi
    .object()
    .keys({
      startDateTime: joi.date().required(),
      clientId: joi.string().required(),
    })
  return schema.validate(data);
};
