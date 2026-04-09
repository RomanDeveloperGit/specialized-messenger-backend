import * as Joi from 'joi';

export const CONFIG_VALIDATION_SCHEMA = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production'),
  HTTP_PORT: Joi.number().port().required(),
  WS_PORT: Joi.number().port().required(),
  CONSUMER_ORIGIN: Joi.string().required(),
  HAS_DOCS: Joi.boolean().required(),
  DATABASE_URL: Joi.string().required(),
  PASSWORD_HASH_SALT: Joi.number().positive().required(),
});
