const Joi = require('joi');

const UserValidator = (schema) => {
    const model = Joi.object().keys({
        name: Joi.string().required(),
        username: Joi.string().alphanum().min(6).max(15).required(),
        password: Joi.string().min(8).regex(/^[a-zA-Z0-9]{3,25}/).required(),
        email: Joi.string().email({
            minDomainSegments: 2
        }),
        bio: Joi.string(),
        avatar: Joi.string()
    });
    return model.validate(schema);
}

module.exports = UserValidator