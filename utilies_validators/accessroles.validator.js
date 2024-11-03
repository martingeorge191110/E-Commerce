import { body, query, validationResult } from "express-validator";
import ApiError from "../middlewares/errorHandler.js";
import PrismaObject from "../prisma/prisma.js";
import AuthUtilies from "./auth.utilies.js";




class AccessRoleValidator extends AuthUtilies {

   /* Function that return
      array of express validator to check
      the validation of (fisrt, last name, email and password) */
   employeeRegisterValid = () => {
      return ([
         body("sign_in_email")
            .trim()
            .notEmpty()
            .withMessage("This Field is required!")
            .isEmail()
            .withMessage("No valid email!"),
         body("password")
            .trim()
            .notEmpty()
            .withMessage("this field is required")
            .isStrongPassword({minLength: 5, minSymbols: 0, minUppercase: 0})
            .withMessage("Password must be at least 5 characters with numbers"),         
         body("phone")
            .trim()
            .notEmpty()
            .withMessage("This Field is required!")
            .isString()
            .withMessage("This field must be characters!")
            .custom( async (value, {req}) => {
               let employee
               try {
                  employee = await PrismaObject.$queryRaw`
                  SELECT * FROM Employees
                  WHERE phone = ${value}`
                  employee = employee[0] || null
               } catch (err) {
                  throw (new Error("Server error during get employee information"))
               }
               if (!employee)
                  throw (new Error("we dont have any records with this user infomration!"))

               req.employee = employee
               }),
            body("role")
               .trim()
               .notEmpty().withMessage("this field is required")
               .isIn(["ADMIN", "MANAGER", "AUTHOR", "CUSTOMER_SERVICE", "INVENTORY_MANAGER", "MARKETING_SPECIALIST", "SALES_REPRESENTATIVE", "DATA_ANALYST", "DEVELOPER", "PRODUCT_MANAGER", "SHIPPING_MANAGER", "HR_MANAGER", "ACCOUNTANT", "TECH_SUPPORT", "CONTENT_EDITOR", "QUALITY_ASSURANCE"])
               .withMessage("Invalid role value!"),
            body("description")
               .trim()
               .notEmpty().withMessage("this field is required")
               ,
            body("permissions")
               .isArray()
               .withMessage("this field must be array of permissions")
               .custom((array) => {
                  const requiredPerms = ["CREATE_USER", "EDIT_USER", "DELETE_USER", "VIEW_USER", "CREATE_PRODUCT", "EDIT_PRODUCT", "DELETE_PRODUCT", "VIEW_PRODUCT", "MANAGE_INVENTORY", "VIEW_INVENTORY", "PROCESS_ORDER", "VIEW_ORDER", "HANDLE_PAYMENT", "VIEW_PAYMENT_HISTORY", "MANAGE_SHIPPING", "TRACK_ORDER", "VIEW_REPORTS", "GENERATE_REPORTS", "MANAGE_DISCOUNTS", "VIEW_PROMOTIONS", "MANAGE_SETTINGS", "ACCESS_ANALYTICS", "SEND_NOTIFICATIONS", "MANAGE_ROLES", "ACCESS_ADMIN_PANEL"]
                  let condition = true;
                  for (const ele of array) {
                     let loopCond = false
                     for (const perm of requiredPerms) {
                        if (ele === perm) {
                           loopCond = true
                           break
                        }
                     }
                     if (!loopCond) {
                        condition = false
                        break
                     }
                  }
                  if (!condition)
                     throw (new Error("invalid permissions values"))

                  return (true);
               })
         ])
      }

   /* Function that return
      array of express validator to check
      the validation of (email and password) */
   loginValid = () => {
      return ([
         body("email")
            .trim()
            .notEmpty().withMessage("this field is required")
            .isEmail().withMessage("this email is not valid"),
         body("password")
            .trim()
            .notEmpty().withMessage("this field is required")
      ])
   }

   /* Function that return
      array of express validator to check
      the validation of account id (in query object) */
   searchAccountValid = () => {
      return ([
         query("account_id")
            .optional()
            .isString().withMessage("account_id must be string")
            .custom( async (value, {req}) => {
               try {
                  const accounts = await PrismaObject.access_Roles.findMany({
                     where: {id: value},
                     include: {
                        permissions: {select: 
                           {permission: true}
                        }, employee: true
                     }
                  })
                  req.accounts = accounts
               } catch (err) {
                  throw (err)
               }
            })
      ])
   }

   /* Function that check the token of employee
      who has full access on other system */
   fullPermissionValid = (req, res, next) => {
      const admin = req.user
      if (!admin.role || (admin.role !== "ADMIN" && admin.role !== "MANAGER"))
         return (
            ApiError.responseError(
               ApiError.createError(403, "Unauthorized to do that"), req, res, next
            )
         )
      if (!admin.permissions || !admin.permissions.includes("CREATE_USER"))
         return (
            ApiError.responseError(
               ApiError.createError(403, "Unauthorized to do that"), req, res, next
            )
         )
      return (next())
   }
}

export default AccessRoleValidator;
