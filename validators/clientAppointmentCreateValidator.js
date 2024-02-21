import joi from "@hapi/joi";

export const clientAppointmentCreateValidator = (data) => {
  const schema = joi
    .object()
    .keys({
      title: joi.string().min(5).max(100),
      membershipId: joi.string(),
      serviceId: joi.string(),
      personCount: joi.number(),
      rescheduleCount: joi.number(),
      startDateTime: joi.date(),
      resource: joi.string(),
      branch: joi.string(),
    })
    .options({ presence: "required" })
    .required();
  return schema.validate(data);
};
