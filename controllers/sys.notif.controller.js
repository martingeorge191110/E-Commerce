import ApiError from "../middlewares/errorHandler.js";
import PrismaObject from "../prisma/prisma.js";
import SysNotifValidator from "../utilies_validators/sys.notif.validation.js";



class SysNotifController extends SysNotifValidator {


   /**
    * Controller to send notification to access role employees
    * 
    * Description:
    *             [1] --> after validation, send the notification, then response
    */
   sendNotifController = async (req, res, next) => {
      const {content, type} = req.body
      const user = req.user
      const all_recieveres = req.all_recieveres

      if (!user.role)
         return (next(ApiError.createError(403, "you are not authorized to do that!")))

      try {
         const notifications = await PrismaObject.system_Notifications.createMany({
            data: all_recieveres.map((ele) => ({
               sender_id: user.id,
               receiver_id: ele.id,
               content: content,
               type: type
            }))
         })

         return (this.responseJsonDone(res, 201, "notification, sent successfuly!", notifications))
      } catch (err) {
         return (next(ApiError.createError(500, "Server error during sending notification!")))
      }
   }

   /**
    * Controller to get all notifications
    * 
    * Description:
    *             [1] --> retreive all user notifications, then response
    */
   getAllNotifController = async (req, res, next) => {
      const user = req.user

      try {
         const notifications = await PrismaObject.system_Notifications.findMany({
            where: {receiver_id: user.id},
            include: {
               sender: {
                  select: {
                     id: true, role: true, employee: {
                        select: {
                           first_name: true, last_name: true, avatar: true, hire_date: true
                           , email: true, phone: true
                        }
                     }
                  }
               }
            }
         })

         return (this.responseJsonDone(res, 200, "notifications has been received", notifications))
      } catch (err) {
         return (next(ApiError.createError(500, "Server error during getting all prev notifications")))
      }
   }

   /**
    * Controller to update a notification (auth for sender)
    * 
    * Description:
    *             [1] --> after validation, update notificatipn content, then response
    */
   updateNotifController = async (req, res, next) => {
      const notification = req.notification
      const user = req.user
      const {content} = req.body

      try {
         const updatedNotif = await PrismaObject.system_Notifications.update({
            where: {id: notification.id, sender_id: user.id},
            data: { content }
         })

         return (this.responseJsonDone(res, 200, "notification has been updated!", updatedNotif))
      } catch (err) {
         return (next(ApiError.createError(500, "Server error during update the notification")))
      }
   }

   /**
    * Controller to delete sepecific notification
    * 
    * Description:
    *             [1] --> after validate id and auth, delete the notification, then response
    */
   deleteNotifController = async (req, res, next) => {
      const {notification_id} = req.query
      const user = req.user

      try {
         await PrismaObject.system_Notifications.delete({
            where: {id: notification_id, sender_id: user.id}
         })

         return (this.responseJsonDone(res, 200, "notification has been deleted successfuly!", null))
      } catch (err) {
         return (next(ApiError.createError(500, "Server error during deleting notification")))
      }
   }
}



export default SysNotifController;
