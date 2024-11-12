import { query, body, param } from "express-validator";
import PrismaObject from "../prisma/prisma.js";
import GlobalUtilies from "./global.utilies.js";
import ApiError from "../middlewares/errorHandler.js";



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

   /* Functio that validate query info
      to facilitate searching about customers */
   searchingCustValid = () => {
      return ([
         param("id")
            .optional()
            .isString().withMessage("customer feild must be a string")
            .custom( async (val, {req}) => {
               try {
                  const user = await PrismaObject.customers.findUnique({
                     where: {id: val},
                     select: {
                        first_name: true, second_name: true, email: true, phone: true, avatar: true,
                        sms_notification: true, email_notification: true, created_at: true, updated_at: true,
                        currency: true, profile_completed: true, id: true, orders: {
                           include: {
                              orderItems: true, delivery: true, store: true
                           }
                        }
                     }
                  })

                  if (!user)
                     throw (new Error("wrong customer id, please enter another id that we have records in our DB!"))

                  req.customer = user
                  return (true)
               } catch (err) {
                  throw (err)
               }
            })
      ])
   }

   /* Function that validate employees
      , have the permission to search about customers */
   searchCustomersAuth = async (req, res, next) => {
      const user = req.user

      if (!user.role || !user.permissions)
         return (next(ApiError.createError(403, "You are not AUTHORIZED to search about customers inf!")))

      return (next())
   }
}

export default UserValidator;
