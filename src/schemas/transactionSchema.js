import joi from "joi";

const transactionSchema = joi.object({
  type: joi.string().valid("incoming", "outgoing").required(),
  value: joi.number().positive().required(),
  description: joi.string().required(),
});

export default transactionSchema;
