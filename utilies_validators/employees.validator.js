import GlobalUtilies from "./global.utilies.js";
import PrismaObject from "../prisma/prisma.js";
import { body, query } from "express-validator";
import ApiError from "../middlewares/errorHandler.js";




class EmployeesValidator extends GlobalUtilies {


   /* Function that return
   array of express validator to check
   the validation of new employee information */
   addEmployeeValid = () => {
      const fields = ["first_name", "last_name", "email", "phone", "position", "employment_type", "employment_status", "store_id"]
      const numricFields = ["age", "salary"]
      return ([
         ...fields.map((field) => {
            return (
               body(field)
                  .trim()
                  .notEmpty().withMessage(`${field} is required field!`)
                  .isString().withMessage(`${field} must be isString`)
            )
         }),
         ...numricFields.map((field) => {
            return (
               body(field)
                  .notEmpty().withMessage(`${field} is required field`)
                  .custom((value, {req}) => {
                     if (!req.newBody)
                        req.newBody = req.body

                     req.newBody = {...req.newBody, [`${field}`]: Number(value)}
                     return true
                  })
            )
         })
      ])
   }

   /* Function that check validation of
      updating employee status */
   updateStatusValid = () => {
      return ([
         query("status")
            .trim()
            .notEmpty().withMessage("status field is required!")
            .isString().withMessage("status field must be String!")
            .isIn(["ACTRIVE", "ONLEAVE", "TERMINATED"]).withMessage("invalid status value"),
         ...this.employeeIdValid()
      ])
   }

   /* Function that check
      whether the query contains employee info id or not */
   employeeIdValid = () => {
      return ([
         query("employee_id")
            .trim()
            .notEmpty().withMessage("employee_id field is required!")
            .isString().withMessage("employee_id must be String")
            .custom( async (value, {req}) => {
               try {
                  const employee = await PrismaObject.employees.findUnique({
                     where: {id: value},
                     include: {
                        role: {
                           select: {
                              id: true, description: true, role: true, permissions: {
                                 select: {permission: true}
                              }, created_at: true, updated_at: true, Products: true
                           }
                        },
                        store_employee: true,
                        store_manager: true
                     }
                  })

                  if (!employee)
                     throw (new Error("We dont have any records for this employee"))

                  req.employee = employee
                  return (true)
               } catch (err) {
                  throw (err)
               }
            })
      ])
   }

   /* Function to determine auth
      of who can acc employee account */
   empManipAuth = (req, res, next) => {
      const roleFields = ["ADMIN", "MANAGER", "HR_MANAGER"]
      const permFields = ["CREATE_USER", "EDIT_USER", "DELETE_USER", "VIEW_USER", "MANAGE_ROLES", "ACCESS_ADMIN_PANEL"]
      const user = req.user

      const permCondition = permFields.some((ele) => {
         return (user.permissions.includes(ele) ? true : false)
      })

      if (roleFields.includes(user.role) && permCondition)
         return (next())

      return (
         ApiError.responseError(
            ApiError.createError(403, "you are not authorized to do that!"), req, res, next
         )
      )
   }
}

export default EmployeesValidator;
