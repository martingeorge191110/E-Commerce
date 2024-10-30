import { body, validationResult, query} from "express-validator";
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

   /* Function that return
      array of express validator to check
      the validation of (email and password) */
   logInValid = () => {
      return ([
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
      ])
   }

   /* Function that return
      array of express validator to check
      the validation of (email, status) */
   sendCodeValid = () => {
      return ([
         body("email")
            .trim()
            .notEmpty()
            .withMessage("Email field is required!")
            .isEmail()
            .withMessage("Please provide a valid email address!"),
         query("status")
            .exists()
            .withMessage("Status is required!")
            .isIn(["mail", "sms"])
            .withMessage('Invalid status value')
      ])
   }

   /* Function that return
   array of express validator to check
   the validation of (email, code) */
   checkCodeValid = () => {
      return ([
         body("email")
            .trim()
            .notEmpty()
            .withMessage("Email field is required!")
            .isEmail()
            .withMessage("Please provide a valid email address!"),
         body("code")
            .trim()
            .notEmpty()
            .withMessage("code is required!")
         ])
      }


   /* Function that return
   array of express validator to check
   the validation of (email, password, confirmed password) */
   resetPassValid = () => {
      return ([
         body("email")
            .trim()
            .notEmpty()
            .withMessage("Email field is required!")
            .isEmail()
            .withMessage("Please provide a valid email address!"),
         body('password')
            .exists()
            .withMessage('Password is required')
            .isStrongPassword({minLength: 5, minSymbols: 0, minUppercase: 0})
            .withMessage("Password must be at least 5 characters with numbers!"),
         body('confirm_password')
            .exists().withMessage('Confirm password is required')
            .custom((value, { req }) => {
               if (value !== req.body.password) {
                  throw new Error('Passwords do not match');
               }
               return true;
            })
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
