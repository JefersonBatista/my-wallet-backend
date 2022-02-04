import joi from "joi";

export const userSchema = joi.object({
  name: joi.string().required(),
  email: joi.string().email().required(),
  password: joi.string().required(),
});

export const loginSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().required(),
});

export const transactionSchema = joi.object({
  type: joi.string().valid("incoming", "outgoing").required(),
  value: joi.number().positive().required(),
  description: joi.string().required(),
});
