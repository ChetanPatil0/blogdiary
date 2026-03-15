import { sendError } from "../utils/response.js";

export const validateRequest = (schema) => {
  return async (req, res, next) => {
    try {
      await schema.validate(req.body, { abortEarly: false });
      next();
    } catch (error) {
      console.log(error);

      let message = "Validation failed";

      if (error.inner && error.inner.length > 0) {
        message = error.inner[0].message;
      }

      return sendError(res, 400, message);
    }
  };
};