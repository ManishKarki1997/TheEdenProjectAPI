const Joi = require('joi');

const ProjectValidator = (schema) => {
    const model = Joi.object().keys({
        title: Joi.string().required(),
        description: Joi.string().required(),
        image: Joi.any()
            .meta({
                swaggerType: 'file'
            })
            .optional()
            .allow(''),
        user: Joi.string().required(),
    });
    return model.validate(schema);
}

module.exports = ProjectValidator