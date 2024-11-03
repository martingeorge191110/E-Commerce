import ApiError from "../middlewares/errorHandler.js";
import PrismaObject from "../prisma/prisma.js";
import EmployeesValidator from "../utilies_validators/employees.validator.js";



/**
 * Class controller for employee API routes
 */
class EmployeesController extends EmployeesValidator {


   /**
    * 
    */
   addNewEmployeeController = async (req, res, next) => {
      const avatar = req.avatar_url
      const cloudinaryError = req.cloudinaryError
      const multerError = req.multerError
      
      if (multerError)
         return (next(ApiError.createError(400, "Error while uploading the img, please upload smaller size!")))
      if (cloudinaryError)
         return (next(ApiError.createError(400, "Error while uploading the img to the cloud, please upload smaller size!")))
      if (req.noAvatar)
         return (next(ApiError.createError(400, "Must upload employee photo")))
      try {
         const employee = await PrismaObject.employees.create({
            data: {

            }
         })
      } catch (err) {
         return (next(ApiError.createError(500, "Sever error during upload employee information")))
      }
      return (this.responseJsonDone(res, 201, "Awdawd", req.avatar_url))
   }
}

export default EmployeesController;
