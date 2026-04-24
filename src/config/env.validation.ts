import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  DATABASE_URL: Joi.string().required(),
  COGNITO_REGION: Joi.string().required(),
  COGNITO_USER_POOL_ID: Joi.string().required(),
  CORS_ORIGIN: Joi.string().default('*'),
});
