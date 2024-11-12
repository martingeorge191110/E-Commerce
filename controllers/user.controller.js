import ApiError from "../middlewares/errorHandler.js";
import PrismaObject from "../prisma/prisma.js";
import UserValidator from "../utilies_validators/user.validator.js";



class UserController extends UserValidator {

   /**
    * Controller to complete user profile
    * 
    * Description:
    *             [1] --> after validation and auth, get the body and user id inf
    *             [2] --> update customer info, then response
    */
   completeProfileController = async (req, res, next) => {
      const body = req.body
      const user = req.user

      try {
         const customer = await PrismaObject.customers.update({
            where: {id: user.id},
            data: {
               ...body,
               profile_completed: true
            }
         })

         return (this.responseJsonDone(res, 200, "Congratulations, you have completed your profile, not you can make orders!", customer))
      } catch (err) {
         return (next(ApiError.createError(500, "Server error during complete user profile!")))
      }
   }

   /**
    * Controller to upload user profile's avatar
    * 
    * Description:
    *             [1] --> after validation and auth, validate errors
    *             [2] --> if everything is right, update customer in DB, then response
    */
   uploadAvatarController = async (req, res, next) => {
      const noAvatar = req.noAvatar
      const cloudError = req.cloudinaryError
      const multerError = req.multerError
      const avatar = req.avatar_url
      const user = req.user

      if (multerError)
         return (next(ApiError.createError(400, "Error while uploading the img, please upload smaller size!")))
      if (cloudError)
         return (next(ApiError.createError(400, "Error while uploading the img to the cloud, please upload smaller size!")))
      if (noAvatar)
         return (next(ApiError.createError(400, "You must upload an image!")))

      try {
         const customer = await PrismaObject.customers.update({
            where: {
               id: user.id
            }, data: {
               avatar
            }
         })

         return (this.responseJsonDone(res, 200, "Customer image has been updated!", customer))
      } catch (err) {
         return (next(ApiError.createError(500, "Server error during uploading the avatar!")))
      }
   }

   /**
    * Controller that retreive user profile
    * 
    * Description:
    *             [1] --> after auth, search about the profile details with orders, then response
    */
   retreiveProfileController = async (req, res, next) => {
      const user = req.user

      try {
         const customer = await PrismaObject.customers.findUnique({
            where: {
               id: user.id
            }, include: {
               orders: {
                  include: {
                     orderItems: {
                        include: {
                           product: true
                        }
                     }
                  }
               }
            }
         })

         if (!customer)
            return (next(ApiError.createError(404, "This customer account not exists!")))

         return (this.responseJsonDone(res, 200, "Account retreived successfuly!", customer))
      } catch (err) {
         return (next(ApiError.createError(500, "Server error during Retreiving the profile!")))
      }
   }

   /**
    * Constoller that searching about customers (auth by employees)
    * 
    * Description:
    *             [1] --> after validation and auth, check whether request obj contains the customer info or not
    *             [2] --> if there is nothing, then search about all customers, then response
    */
   searchingCustController = async (req, res, next) => {
      const customer = req.customer

      if (customer)
         return (this.responseJsonDone(res, 200, "Customer info retreived successfuly!", customer))

      try {
         const customers = await PrismaObject.customers.findMany({
            select: {
               id: true, first_name: true, second_name: true,
               email: true, phone: true, avatar: true, created_at: true,
               _count: {
                  select: {
                     orders: true
                  }
               }
            }
         })

         if (!customers || customers.length < 1)
            return (next(ApiError.createError(404, "no customers Found!")))

         return (this.responseJsonDone(res, 200, "Customers info retreived successfuly!", customers))
      } catch (err) {
         return (next(ApiError.createError(500, "Server error during searching about customers!")))
      }
   }
}

export default UserController;
