import { query, body } from "express-validator";
import PrismaObject from "../prisma/prisma.js";
import GlobalUtilies from "./global.utilies.js";
import ApiError from "../middlewares/errorHandler.js";



class OrdersEmployeeValidator extends GlobalUtilies {


   /* Function to validate query elements
      for searching about the desired orders */
   getOrdersValid = () => {
      return ([
         query("paid")
            .optional()
            .custom((val, {req}) => {
               if (isNaN(+val) || (+val > 1 || +val < 0))
                  throw (new Error("paid query must be a number within [0 --> false, 1 --> true]!"))

               req.new_query = req.new_query ? {...req.new_query, paid: Boolean(Number(val))} : {paid: Boolean(Number(val))}
               return (true)
            }),
            
      ])
   }

   /* Function to validate
      order id from the query object */
      orderIdValid = () => {
         return ([
            query("order_id")
               .trim()
               .notEmpty().withMessage("order_id feild is required in query object")
               .isString().withMessage("must be astring")
               .custom( async (value, {req}) => {
                  try {
                     const order = await PrismaObject.orders.findUnique({
                        where: {
                           id: value
                        }, include: {
                           orderItems: {
                              include: {
                                 product: true
                              }
                           }
                        }
                     })
   
                     if (!order)
                        throw (new Error("this order id is not valid, we dont have any records"))
   
                     if (order.status === "CANCELED")
                        throw (new Error("Canceled orders cannot be updated!"))
   
                     req.order = order
                     return (true)
                  } catch (err) {
                     throw (err)
                  }
               })
         ])
      }

   /* Function to validate order
      info, which supported by employee */
   updateOrderValid = () => {
      return ([
         ...this.orderIdValid(),
         body("delivery_id")
            .trim()
            .notEmpty().withMessage(`delivery_id is required feild`)
            .isString().withMessage(`delivery_id must be a stirng!`)
            .custom( async (val ,{req}) => {
               try {
                  const delivery = await PrismaObject.employees.findUnique({
                     where: {
                        id: val
                     }, include: {
                        delivery: true,
                        store_employee: true
                     }
                  })

                  if (!delivery)
                     throw (new Error("Wrong employee id!"))

                  req.delivery = delivery
                  return (true)
               } catch (err) {
                     throw (err)
               }
            }),
         body("store_id")
            .trim()
            .notEmpty().withMessage(`store_id is required feild`)
            .isString().withMessage(`store_id must be a stirng!`)
            .custom( async (val ,{req}) => {
               try {
                  const store = await PrismaObject.stores.findUnique({
                     where: {
                        id: val
                     }, include: {
                        employees: true,
                        stock: {
                           include: {
                              product: true
                           }
                        }
                     }
                  })

                  if (!store)
                     throw (new Error("Wrong store id!"))

                  req.store = store
                  return (true)
               } catch (err) {
                  throw (err)
               }
            })
      ])
   }

   /* Function that validate, employeeid, order id, and gen code password
      to make the delivery send the order, and also received payment money */
   employeeReceivedValid = () => {
      return ([
         ...this.orderIdValid(),
         query("delivery_id")
            .trim()
            .notEmpty().withMessage(`delivery_id is required feild`)
            .isString().withMessage(`delivery_id must be a stirng!`)
            .custom( async (val ,{req}) => {
               try {
                  const delivery = await PrismaObject.employees.findUnique({
                     where: {
                        id: val
                     }, include: {
                        delivery: true,
                        store_employee: true
                     }
                  })

                  if (!delivery)
                     throw (new Error("Wrong employee id!"))

                  req.delivery = delivery
                  return (true)
               } catch (err) {
                     throw (err)
               }
            }),
         query("code")
            .trim()
            .notEmpty().withMessage(`code is required feild`)
            .isString().withMessage(`code must be a stirng!`)
            .custom((val, {req}) => {
               req.code = String(val)
               return (true)
            })
      ])
   }

   /* Function to validate authorized
      employees to track orders on comp system */
   trackOrdersAuth = (req, res, next) => {
      const permissions = ["PROCESS_ORDER", "VIEW_ORDER", "TRACK_ORDER", "VIEW_REPORTS"]
      const roles = ["ADMIN", "CUSTOMER_SERVICE", "QUALITY_ASSURANCE"]
      const user = req.user
      if (!user.role)
         return (next(ApiError.createError(403, "You are not authorized to track orders!")))

      const role_cond = roles.includes(user.role)
      const permission_cond = permissions.some(ele => user.permissions.includes(ele))

      if (role_cond && permission_cond)
         return (next())

      return (next(ApiError.createError(403, "You are not authorized to track orders!")))
   }
}


export default OrdersEmployeeValidator;
