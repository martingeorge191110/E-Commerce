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

   /* function that return
      array of express validator to check
      the validation of store id and products id for creating new stock */
   shippingStockValid = () => {
      const fileds = ["store_id", "product_id"]
      return ([
         ...fileds.map((field) => {
            return (
               body(field)
                  .notEmpty().withMessage(`${field} is required`)
                  .isString().withMessage(`${field} must bew string`)
                  .custom( async (value, {req}) => {
                     try {
                        if (field === "store_id") {
                           const store = await PrismaObject.stores.findUnique({
                              where: {id: value}
                           })
                           if (!store)
                              throw (new Error("We dont have any records with this IDs"))
                           req.store = store
                        } else {
                           const product = await PrismaObject.products.findUnique({
                              where: {id: value},
                              include: {
                                 Stock: true
                              }
                           })
                           let availableAmount = product.quantity
                           product.Stock.forEach((ele) => {
                              availableAmount = availableAmount - ele.quantity
                           })
                           if (!product)
                              throw (new Error("We dont have any records with this IDs"))
                           if (Number(req.body.quantity) && availableAmount < Number(req.body.quantity))
                              throw (new Error(`Value you want to shipping is to big, current value of the product is ${availableAmount}`))
                           req.product = product
                        }
                     } catch (err) {
                        throw (err)
                     }
                  })
            )
         }),
         body("quantity")
         .notEmpty().withMessage("quantity field is required!")
         .isNumeric().withMessage("quantity must be a numeric value!")
      ])
   }

   /* function that return
      array of express validator to check
      the validation of home id, and also store id, and quantity  */
   sendStockValid = () => {
      const fileds = ["home_id", "receiver_id", "product_id"]
      return ([
         ...fileds.map((field) => {
            return (
               body(field)
                  .notEmpty().withMessage(`${field} is required`)
                  .isString().withMessage(`${field} must be a string`)
                  .custom( async (value, {req}) => {
                     try {
                        if (field === "home_id") {
                           const store = await PrismaObject.stores.findUnique({
                              where: {id: value}
                           })
                           if (!store)
                              throw (new Error("We dont have any records with this IDs"))
                           req.homeStore = store
                        } else if (field === "receiver_id") {
                           const store = await PrismaObject.stores.findUnique({
                              where: {id: value}
                           })
                           req.receiverStore = store
                        } else {
                           const stock = await PrismaObject.stock.findUnique({
                              where: {store_id_product_id: {
                                 store_id: req.body.home_id,
                                 product_id: value
                              }}
                           })

                           if (!stock)
                              throw (new Error("No stock with this information in our store"))

                           let availableAmount = stock.quantity
                           if (availableAmount < Number(req.body.quantity))
                              throw (new Error(`our amount is just ${availableAmount}, your desired amount is too big!`))

                           req.product_id = value
                           req.stock = stock
                        }
                     } catch (err) {
                        throw (err)
                     }
                  })
            )
         }),
         body("quantity")
            .notEmpty().withMessage("quantity field is required!")
            .isNumeric().withMessage("quantity must be a numeric value!")
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

   /* Function that validate the
      authorized Employees to do actions with Stocks */
   stockEmpAuthorized = (req, res, next) => {
      const user = req.user
      const authTitles = ["ADMIN", "MANAGER", "INVENTORY_MANAGER", "SHIPPING_MANAGER"]
      const authPermissions = ["ACCESS_ADMIN_PANEL", "CREATE_PRODUCT", "MANAGE_INVENTORY"]
      const permAccess = authPermissions.some((permission) => {
         return (user.permissions.includes(permission) ? true : false)
      })
      if (authTitles.includes(user.role) && permAccess)
         return (next())

      return (ApiError.responseError(
         ApiError.createError(403, "You are not authorized to do this action"), req, res, next
      ))
   }
}

export default Store_StockValidator;
