import GlobalUtilies from "./global.utilies.js";
import PrismaObject from "../prisma/prisma.js";
import { body } from "express-validator";




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
                  .isNumeric().withMessage(`${field} must be a number`)
            )
         })
      ])
   }
}

export default EmployeesValidator;
