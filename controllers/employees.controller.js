import ApiError from "../middlewares/errorHandler.js";
import PrismaObject from "../prisma/prisma.js";
import EmployeesValidator from "../utilies_validators/employees.validator.js";



/**
 * Class controller for employee API routes
 */
class EmployeesController extends EmployeesValidator {


   /**
    * controller to add new employee record
    * 
    * Description:
    *             [1] --> after validations and authorization, chech middlewares errors
    *             [2] --> if every thing is ok, create new record, then response
    */
   addNewEmployeeController = async (req, res, next) => {
      const avatar = req.avatar_url
      const cloudinaryError = req.cloudinaryError
      const multerError = req.multerError
      const body = req.newBody
      
      if (multerError)
         return (next(ApiError.createError(400, "Error while uploading the img, please upload smaller size!")))
      if (cloudinaryError)
         return (next(ApiError.createError(400, "Error while uploading the img to the cloud, please upload smaller size!")))
      if (req.noAvatar)
         return (next(ApiError.createError(400, "Must upload employee photo")))

      try {
         const employee = await PrismaObject.employees.create({
            data: {
               avatar, ...body
            }
         })
         return (this.responseJsonDone(res, 201, "New employee has been recorded", employee))
      } catch (err) {
         return (next(ApiError.createError(500, "Sever error during upload employee information")))
      }
   }

   /**
    * Controller to just terminate employee
    * 
    * Description:
    *             [1] --> after validation and authorization,
    *                   update emp status if not has this status, then response
    */
   updateEmployeeStatusController = async (req, res, next) => {
      const employeeRecords = req.employee
      const {status} = req.query

      if (employeeRecords.employment_status === "status")
         return (next(ApiError.createError(400, `This employee is already in ${status}`)))

      try {
         const employee = await PrismaObject.employees.update({
            where: {id: employeeRecords.id},
            data: {
               employment_status: status
            }
         })

         return (this.responseJsonDone(res, 200, "Employee has been terminated!", employee))
      } catch (err) {
         return (next(ApiError.createError(500, "Server error during updating employee status!")))
      }
   }

   /**
    * Controller to update employee information
    * 
    * Description:
    *             [1] --> after validation and aut, update user information then response.
    */
   updateEmployeeController = async (req, res, next) => {
      const employeeRecords = req.employee
      const body = req.body

      try {
         const employe = await PrismaObject.employees.update({
            where: {id: employeeRecords.id},
            data: body
         })

         return (this.responseJsonDone(res, 200, "Employee information has been updated!", employe))
      } catch (err) {
         return (next(ApiError.createError(500, "Server error during updating employee information!")))
      }
   }

   /**
    * Controller to delete any employee Records
    * 
    * Description:
    *             [1] --> after auth and validation, delete employee records, then reponse
    */
   deleteEmpRecordsController = async (req, res, next) => {
      const employeeRecords = req.employee

      try {
         await PrismaObject.employees.delete({
            where: {id: employeeRecords.id}
         })

         return (this.responseJsonDone(res, 200, "Employee records has been deleted all!"))
      } catch (err) {
         return (next(ApiError.createError(500, "Server error during deleting employee records!")))
      }
   }

   /**
    * Controller to get all employee infromation
    * 
    * Description:
    *             [1] --> 
    */
   retreiveEmployeeCont = async (req, res, next) => {
      const employeeRecords = req.employee

      try {
         return (this.responseJsonDone(res, 200, "awd", employeeRecords))
      } catch (err) {
         return (next(ApiError.createError(500, "Server error during Retreiving employee information")))
      }
   }
}

export default EmployeesController;
