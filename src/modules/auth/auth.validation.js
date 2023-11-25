import joi from "joi";
const arrayParsing = (value, helper) => {
  value = JSON.parse(value);
  const valueSchema = joi.object({
    value: joi.array().items(joi.string().alphanum()),
  });
  const validationRes = valueSchema.validate({ value });
  if (validationRes.error) {
    return helper.message("invalid value of size");
  } else {
    return true;
  }
};
export const registerSchema = joi
  .object({
    nameEnglish: joi.string().min(3).max(20).required(),
    nameArabic: joi.string().min(3).max(20),
    email: joi.string().email().required(),
    role: joi.string().valid("admin", "user", "visitor").required(),
    gender: joi.string().valid("Female", "male").required(),
    address: joi.string().min(10).max(25).required(),
    title: joi.string(),
    Region: joi.string(),
    country: joi.string().required(),
    phone: joi
      .string()
      .regex(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/)
      .required(),
    whatsAppNumber: joi
      .string()
      .regex(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/),
    password: joi.string().required(),
    description: joi.string(),
    confirmPassword: joi.string().valid(joi.ref("password")).required(),
    workingDays: joi.string().custom(arrayParsing),
    workingHours: joi.string().custom((value, helper) => {
      value = JSON.parse(value);
      const valueSchema = joi.object({
        value: joi
          .array()
          .items(joi.object({ start: joi.number(), End: joi.number() })),
      });
      const validationRes = valueSchema.validate({ value });
      if (validationRes.error) {
        return helper.message("invalid value of size");
      } else {
        return true;
      }
    }),
    socialLink: joi.string().custom((value, helper) => {
      value = JSON.parse(value);
      const valueSchema = joi.object({
        facebook: joi
          .string()
          .regex(
            /(?:https?:\/\/)?(?:www\.)?(mbasic.facebook|m\.facebook|facebook|fb)\.(com|me)\/(?:(?:\w\.)*#!\/)?(?:pages\/)?(?:[\w\-\.]*\/)*([\w\-\.]*)/
          ),
        instagram: joi
          .string()
          .regex(
            /(?:(?:http|https):\/\/)?(?:www.)?(?:instagram.com|instagram)\/([A-Za-z0-9-_]+)/
          ),
        linkedin: joi
          .string()
          .regex(
            /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/
          ),
        youtube: joi
          .string()
          .regex(
            /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtube))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/
          ),
        github: joi
          .string()
          .regex(/^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9_]{1,25}$/),
        profile: joi
          .string()
          .regex(
            /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/
          ),
        others: joi
          .string()
          .regex(
            /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/
          ),
      });
      const validationRes = valueSchema.validate(value);
      if (validationRes.error) {
        return helper.message("social media link not correct");
      } else {
        return true;
      }
    }),
    Longitude: joi.string().required(),
    Latitude: joi.string().required(),
    size: joi.number().positive().required(),
    path: joi.string().required(),
    filename: joi.string().required(),
    destination: joi.string().required(),
    mimetype: joi.string().required(),
    encoding: joi.string().required(),
    originalname: joi.string().required(),
    fieldname: joi.string().required(),
  })
  .required();

export const activateSchema = joi
  .object({
    activationCode: joi.string().required(),
  })
  .required();

export const login = joi
  .object({
    email: joi.string().email().required(),
    password: joi.string().required(),
  })
  .required();

export const forgetCode = joi
  .object({
    email: joi.string().email().required(),
  })
  .required();

export const resetPassword = joi
  .object({
    email: joi.string().email().required(),
    password: joi.string().required(),
    forgetCode: joi.string().required(),
    confirmPassword: joi.string().valid(joi.ref("password")).required(),
  })
  .required();
