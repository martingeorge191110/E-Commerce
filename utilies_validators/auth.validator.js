import { body, query} from "express-validator";
import AuthUtilies from "./auth.utilies.js";
import PrismaObject from "../prisma/prisma.js";


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
            .withMessage('Invalid status value'),
         query("role")
            .exists()
            .withMessage("Role is required")
            .isIn(["customer", "employee"])
            .withMessage('Invalid status value')
            .custom( async (value, {req}) => {
               let user;
               const dataObject = {
                     pass_code: String(Math.random()).slice(3,9),
                     exp_date: new Date(Date.now() + 5 * 60 * 1000)
               }
               try {
                  if (value === "customer") {
                     user = await PrismaObject.customers.update({
                        where: {email: req.body.email},
                        data: dataObject
                     })
                  } else {
                     user = await PrismaObject.access_Roles.update({
                        where: {sign_in_email: req.body.email},
                        data: dataObject
                     })
                  }

                  req.user = user
               } catch (err) {
                  req.userError = true
               }
            })
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
            .withMessage("code is required!"),
         query("role")
         .exists()
         .withMessage("Role is required")
         .isIn(["customer", "employee"])
         .withMessage('Invalid status value')
         .custom(async (value, {req}) => {
            let user;
            try {
               if (value === "customer") {
                  user = await PrismaObject.customers.findUnique({
                     where: {email: req.body.email}
                  })
               } else {
                  user = await PrismaObject.access_Roles.findUnique({
                     where: {sign_in_email: req.body.email}
                  })
               }
               req.user = user
            } catch (err) {
               req.userError = true
            }
         })
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
            .exists()
            .withMessage('Confirm password is required')
            .custom((value, { req }) => {
               if (value !== req.body.password) {
                  throw new Error('Passwords do not match');
               }
               return true;
            }),
         query("role")
            .exists()
            .withMessage("Role is required")
            .isIn(["customer", "employee"])
            .withMessage('Invalid status value')
         ])
      }

}

export default AuthValidator;
