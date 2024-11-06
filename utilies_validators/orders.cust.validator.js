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
}


export default OrdersCustomerValidator;
