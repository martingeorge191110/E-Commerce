import { query, body } from "express-validator";
import PrismaObject from "../prisma/prisma.js";
import GlobalUtilies from "./global.utilies.js";




class OrdersCustomerValidator extends GlobalUtilies {


   /* Function To validate creating new order
      Requirments */
   createBigOrderValid = () => {
      const queryFeilds = ["type", "payment_method"]
      return ([
      body("products")
         .isArray().withMessage("products must be array of objects, which contains products inf!")
         .custom( async (value, {req}) => {
            if (value.length === 0)
               throw (new Error("You must choose products you want to buy!"))

            try {
               const products_ids = value.map((product) => product.id)
               const allProducts = await PrismaObject.products.findMany({
                  where: {id: {
                     in: products_ids
                  }}
               })

               if (allProducts.length !== products_ids.length) {
                  throw new Error("One or more products not found in our records!");
               }

               const productsQuantity = {}
               value.forEach((ele) => {
                  productsQuantity[ele.id] = ele.quantity
               })

               for (const product of allProducts) {
                  if (productsQuantity[product.id] > product.quantity)
                     throw ({
                        ...product, message: `We only have ${product.quantity} in stock for product ID ${product.id}`
                     })
               }

               req.products = req.body.products
               req.allProducts = allProducts
               return (true)
            } catch (err) {
               throw (err)
            }
         }),
      body("address")
         .optional()
         .isString().withMessage("address feild must be string"),
      ...queryFeilds.map((feild) => {
         return (
            query(feild)
               .optional()
               .isString().withMessage(`${feild} must be a string!`)
         )
      })
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
                        id: value,
                        customer_id: req.user.id,
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

   /* Function to validate
   big order information
   (whether remove items or update order info) */
   updateBigOrderValid = () => {
      const bodyFields = ["address", "payment_method", "type"]
      return ([
         ...this.orderIdValid(),
         body("products")
            .optional()
            .isArray().withMessage("this field must be an array")
            .custom( async (value, {req}) => {
               const arrayOfItemsIds = req.order.orderItems.map((item) => item.item_id)
               const newItems = value.filter((ele) => !arrayOfItemsIds.includes(ele.id))
               const updatedItems = value.filter((ele) => arrayOfItemsIds.includes(ele.id))
               req.new_items = newItems
               req.update_items = updatedItems

               try {
                  let all_items_ids = [...newItems.map((ele) => ele.id), ...arrayOfItemsIds]

                  if (all_items_ids.length > 0) {
                     const products = await PrismaObject.products.findMany({
                        where: {
                           id: { in: all_items_ids},
                     }})

                     if (!products || products.length === 0)
                        throw (new Error("products not found in our records"))

                     const allItems = [...updatedItems, ...newItems]
                     for (const i of products) {
                        const current = allItems.find((e) => e.id === i.id)
                        if (current && current.quantity > i.quantity) {
                           throw (new Error(`${i.name} just ${i.quantity} in the stock!`))
                        }
                     }
                     req.products_db = products
                     req.all_items_ids = all_items_ids
                  }
                  return (true)
               } catch (err) {
                  throw (err)
               }
            }),
         ...bodyFields.map((feild) => {
            return (
               body(feild)
                  .optional()
                  .isString().withMessage("address field must be string")
                  .custom((value, {req}) => {
                     req.new_body = req.new_body ? {...req.new_body, [`${feild}`]: value}: {[`${feild}`]: value}
                     return (true)
                  })
            )
         })
      ])
   }

   /* Function to validate tradition
      orders with one products
      Validate: () */
   createOrderValid = () => {
      const queryFeilds = ["type", "payment_method", "address"]
      return ([
         body("product")
            .notEmpty().withMessage("This field info is required!")
            .isObject().withMessage("this field must be an object includes product inf!")
            .custom( async (value, {req}) => {
               try {
                  const product = await PrismaObject.products.findUnique({
                     where: {id: value.id}
                  })

                  if (product.quantity < value.quantity)
                     throw (new Error(`just ${product.quantity} from ${product.name}`))

                  req.product = {
                     product: product, customer_order: value
                  }
                  return (true)
               } catch (err) {
                  throw (err)
               }
            }),
         ...queryFeilds.map((feild) => {
            return (
               body(feild)
                  .optional()
                  .custom((value, {req}) => {
                     req.new_body = req.new_body ? {...req.new_body, [`${feild}`]: value} : {[`${feild}`]: value}
                     return (true)
                  })
            )
         })
      ])
   }

   /* Function to validate the order info */
   updateOderValid = () => {
      const bodyFields = ["address", "payment_method", "type"]
      return ([
         ...this.orderIdValid(),
         body("quantity")
            .optional()
            .isNumeric().withMessage("quantity feild must be a numeric Type!")
            .custom((value, {req}) => {
               const product = req.order.orderItems

               if (value + product[0].quantity <= 0)
                  throw (new Error("If you want to retreive all items, please cancel whole order!"))
   
               if (value + product[0].quantity > product[0].product.quantity)
                  throw (new Error(`cannot add any items, we just have ${product[0].product.quantity}`))
   
               req.quantity = value
               return (true)
            }),
         ...bodyFields.map((feild) => {
            return (
               body(feild)
                  .optional()
                  .custom((value, {req}) => {
                     req.new_body = req.new_body ? {...req.new_body, [`${feild}`]: value}: {[`${feild}`]: value}
                     return (true)
                  })
            )
         })
      ])
   }

   /* Function to validate retreiving orders
      For the customer in case of sending orderid, or no */
   getOrdersValid = () => {
      return ([
         query("order_id")
            .optional()
            .isString().withMessage("order_id must be include in query object")
            .custom( async (val, {req}) => {
               try {
                  const order = await PrismaObject.orders.findUnique({
                     where: {
                        id: val, customer_id: req.user.id
                     },
                     include: {
                        orderItems: {
                           include: {
                              product: {
                                 select: {
                                    id: true, name: true, description: true, price: true, company: true, category: true
                                 }
                              }
                           }
                        }
                     }
                  })
                  if (!order)
                     throw (new Error("Order not found with this id!"))

                  req.order = order
                  return (true)
               } catch (err) {
                  throw (err)
               }
            })
      ])
   }
}


export default OrdersCustomerValidator;
