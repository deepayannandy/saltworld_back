import joi from "@hapi/joi";

export const clientNotesCreateValidator = (data) => {
  const schema = joi.object().keys({
    note: joi.string().required(),
  });
  return schema.validate(data);
};
