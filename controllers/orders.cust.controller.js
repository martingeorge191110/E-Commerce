import ApiError from "../middlewares/errorHandler.js";
import PrismaObject from "../prisma/prisma.js";
import OrdersCustomerValidator from "../utilies_validators/orders.cust.validator.js";



class OrdersCustomerController extends OrdersCustomerValidator {


   /**
    * Controller to create new order
    * 
    * Description:
    *             [1] --> after validation and auth, start to creating new order
    *             [2] --> get all necessary info from validation, then create new order
    *             [3] --> Updating products quantity to not every one about the current amount
    */
   createBigOrderController = async (req, res, next) => {
      const user = req.user
      const products = req.products
      const {address} = req.body || null
      const products_from_db = req.allProducts
      const query = req.query || null

      const total_price = products_from_db.reduce((acc, curr) => {
         return ( acc + Number(curr.price))
      }, 0)

      try {
         const order = await PrismaObject.orders.create({
            data: {
               customer_id: user.id,
               address: address,
               total_price,
               items: {
                  create: products_from_db.map((ele) => ({
                     item_id: ele.id, quantity: products.quantity,
                     price: products.quantity * ele.price,
                  }))
               },
               ...query
            }
         })

         let currentProductQuantity;
         await PrismaObject.products.updateMany({
            where: {
               id: {
                  in: products.map((ele) => {
                     currentProductQuantity = ele.quantity
                     return (ele.id)
                  })
               }
            },
            data: products.map(p => ({
               quantity: {
                  decrement: p.quantity
               }
            }))
         })

         return (this.responseJsonDone(res, 201, "Order has been created, will contact to you soon!", order))
      } catch (err) {
         return (next(ApiError.createError(500, "Server error during creating order contains more than product!")))
      }
   }
}

export default OrdersCustomerController;
