const Joi = require('joi');

const validateLogin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

const validateRegister = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    firstName: Joi.string().min(2).required(),
    lastName: Joi.string().min(2).required(),
    country: Joi.string().min(2).required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

const validateTrade = (req, res, next) => {
  const schema = Joi.object({
    asset: Joi.string().required(),
    tradeType: Joi.string().valid('CALL', 'PUT').required(),
    amount: Joi.number().min(1).max(5000).required(),
    duration: Joi.number().valid(60, 300, 900, 1800, 3600).required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

module.exports = { validateLogin, validateRegister, validateTrade };
