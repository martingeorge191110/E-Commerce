import {body, query, validationResult} from 'express-validator'
import GlobalUtilies from './global.utilies.js';
import ApiError from '../middlewares/errorHandler.js';
import PrismaObject from '../prisma/prisma.js';


class Store_StockValidator extends GlobalUtilies {

   /* Function that return
      array of express validator to check
      the validation of store information body */
   addStoreInfValid = () => {
      const fileds = ["name", "location"]
      return ([
         ...fileds.map((field) => {
            return body(field)
               .notEmpty().withMessage("This field is required!")
               .isString().withMessage("this field must be a string")
         }),
         body("manager_id")
            .optional()
            .isString().withMessage("must be string")
            .custom( async (value, {req}) => {
               try {
                  const manager = await PrismaObject.employees.findUnique({
                     where: {id: value}
                  })

                  console.log(manager)
                  if (!manager)
                     throw (new Error("Wrong employee id (manager)"))

                  req.manager = manager
               } catch (err) {
                  throw (new Error(err))
               }
            })
      ])
   }

   /* Function that return
      array of express validator to check
      the validation of store information body */
   updateStoreInfValid = () => {
      const fileds = ["name", "location", "manager_id"]
      return ([
         ...fileds.map((field) => {
            return (
               body(field)
                  .optional()
                  .isString().withMessage("this field must be string")
                  .custom( async (value, {req}) => {
                     if (field !== "manager_id")
                        return (true)

                     try {
                        const newManager = await PrismaObject.employees.findUnique({
                           where: {id: value}
                        })

                        if (!newManager)
                           throw (new Error("We dont have records for this employee"))

                        req.newManager = newManager
                     } catch (err) {
                        throw (err)
                     }
                  })
            )
         }),
         query("store_id")
            .notEmpty().withMessage("This field in query required")
            .isString().withMessage("This field must be a string!")
            .custom( async (value, {req}) => {
               try {
                  const store = await PrismaObject.stores.findUnique({
                     where: {id: value}
                  })

                  if (!store)
                     throw (new Error("We dont have any records about this store id"))

                  req.store = store
               } catch (err) {
                  throw (err)
               }
            })
      ])
   }

   /* Function that return
      array of express validator to check
      the validation of store id from query for searching */
   storeIdValidation = () => {
      return ([
         query("store_id")
            .optional()
            .isString().withMessage("This field must be a string")
      ])
   }

   /* unction that return
      array of express validator to check
      the validation of store id from query for searching */
   deleteStoreIdValid = () => {
      return ([
         query("store_id")
            .notEmpty().withMessage("this filed is required")
            .isString().withMessage("this field must be a string")
            .custom(async (value, {req}) => {
               try {
                  const store = await PrismaObject.stores.findUnique({
                     where: {id: value}
                  })
                  if (!store)
                     throw (new Error("No store information with this id"))
                  req.store = store
               } catch (err) {
                  throw (err)
               }
            })
      ])
   }

   /* Function that validate the
      authorized Employees to do actions with stores*/
   storeEmpAuthorized = (req, res, next) => {
      const user = req.user
      const authTitles = ["ADMIN", "MANAGER"]
      const authPermissions = "ACCESS_ADMIN_PANEL"

      if (authTitles.includes(user.role) && user.permissions.includes(authPermissions))
         return (next())

      return (
         ApiError.responseError(
            ApiError.createError(404, "Unauthroized to manipulate with stores information"), req, res, next
         )
      )
   }

   /* Function Middleware to chech the request
      body is valid or catching errors */
   validationError = (req, res, next) => {
      const validation = validationResult(req)
      if (!validation.isEmpty()) {
         const apiError = ApiError.createError(400, validation.array())
         return (ApiError.responseError(apiError, req, res, next))
      }
      next()
   }
}

export default Store_StockValidator;
