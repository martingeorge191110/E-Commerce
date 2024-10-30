import { body, validationResult } from "express-validator";
import ApiError from "../middlewares/errorHandler.js";
import AuthUtilies from "./auth.utilies.js";


class AuthValidator extends AuthUtilies{

   /* Function that return
      array of express validator to check
      the validation of (fisrt, last name, email and password) */
   registerValid = () => {
      return ([
         body("first_name")
            .trim()
            .notEmpty()
            .withMessage("Please Enter your first name!")
            .isString()
            .withMessage("Please First name must be just Characters!")
            .isLength({min: 3})
            .withMessage("First name must be at least 3 characters long"),
         body("second_name")
            .trim()
            .notEmpty()
            .withMessage("Please Enter your Second name!")
            .isString()
            .withMessage("Please Second name must be just Characters!")
            .isLength({min: 3})
            .withMessage("Second name must be at least 3 characters long"),
         body("email")
            .trim()
            .notEmpty()
            .withMessage("Email field is required!")
            .isEmail()
            .withMessage("Please provide a valid email address!"),
         body("password")
            .trim()
            .notEmpty()
            .withMessage("Password field is required!")
            .isStrongPassword({minLength: 5, minSymbols: 0, minUppercase: 0})
            .withMessage("Password must be at least 5 characters with numbers!")
      ])
   }

   /* Function Middleware to chech the request
      body is valid or catching errors */
   validationError = (req, res, next) => {
      const validation = validationResult(req)
      if (!validation.isEmpty()) {
         const apiError = ApiError.createError(400, validation.array())
         return (ApiError.responseError(apiError, req, res, next))
      }
      next()
   }


}

export default AuthValidator;
