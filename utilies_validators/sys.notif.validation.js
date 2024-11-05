import PrismaObject from "../prisma/prisma.js";
import { body, query } from "express-validator";
import GlobalUtilies from "./global.utilies.js";



class SysNotifValidator extends GlobalUtilies {


   /* Function to validate send notification
      for employees IDs, also content and notification type */
   sendNotifValid = () => {
      return ([
         body("content")
            .trim()
            .notEmpty().withMessage("notification content is required"),
         body("type")
            .trim()
            .notEmpty().withMessage("notification content is required")
            .isIn(["MESSAGE", "ALERT", "REMINDER"]).withMessage("In valid notification type value"),
         query("receiver_id")
            .trim()
            .notEmpty().withMessage("receiver_id is required!")
            .isString().withMessage("receiver_id must be a string")
            .custom( async (value, {req}) => {
               const arr_of_ids = value.split(",")

               try {
                  let arr_of_all = await PrismaObject.access_Roles.findMany({
                     where: {
                        id: {
                           in: arr_of_ids
                        }
                     }
                  })

                  req.all_recieveres = arr_of_all
                  return (true)
               } catch (err) {
                  throw (err)
               }
            })
      ])
   }

   /* Function to validate Update notification
      for employees IDs, also content and notification type */
   updateNotifValid = () => {
      return ([
         query("notification_id")
            .trim()
            .notEmpty().withMessage("notification_id is required")
            .isString().withMessage("notification_id must be a string")
            .custom( async (value, {req}) => {
               try {
                  const notification = await PrismaObject.system_Notifications.findUnique({
                     where: {
                        id: value,
                        sender_id: req.user.id
                     }
                  })

                  if (!notification)
                     throw (new Error("notification record not found"))

                  req.notification = notification
                  return (true)
               } catch (err) {
                  throw (err)
               }
            }),
         body("content")
            .trim()
            .notEmpty().withMessage("notification content is required")
      ])
   }

   /* Fucntion to validate notification id*/
   notifIdValid = () => {
      return ([
         query("notification_id")
            .trim()
            .notEmpty().withMessage("notification_id is required")
            .isString().withMessage("notification_id must be string")
      ])
   }
}

export default SysNotifValidator;
