import { query, body } from "express-validator";
import PrismaObject from "../prisma/prisma.js";
import GlobalUtilies from "./global.utilies.js";



class UserValidator extends GlobalUtilies {


   /* Function validator to check
      whether user complete profile
      info is right or not */
   completeProfileValid = () => {
      const stringFeilds = ["phone", "currency"]
      const boolFeilds = ["allow_send_updates", "sms_notification"]
      return ([
         ...stringFeilds.map((feild) => {
            return (
               body(feild)
                  .trim()
                  .notEmpty().withMessage(`${feild} is required!`)
                  .isString().withMessage(`${feild} must be a string`)
            )
         }),
         ...boolFeilds.map((feild) => {
            return (
               body(feild)
                  .trim()
                  .notEmpty().withMessage(`${feild} is required`)
                  .isTime().withMessage(`${feild} must be a time date value`)
            )
         })
      ])
   }
}

export default UserValidator;
