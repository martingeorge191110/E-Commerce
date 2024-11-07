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
               orderItems: {
                  create: products_from_db.map((ele) => {
                     const findProduct = products.find((elem) => elem.id === ele.id)
                     console.log(ele, findProduct)
                     return ({
                     item_id: ele.id, quantity: findProduct.quantity,
                     price: findProduct.quantity * ele.price,
                  })})
               },
               ...query
            },
            include: {
               orderItems: {
                  include: {
                     product: true
                  }
               }
            }
         })

         const productUpdates = products.map((ele) => {
            return PrismaObject.products.update({
               where: {
                  id: ele.id,
               },
               data: {
                  quantity: {
                     decrement: ele.quantity
                  },
               },
            });
         });

         await PrismaObject.$transaction(productUpdates);

         return (this.responseJsonDone(res, 201, "Order has been created, will contact to you soon!", order))
      } catch (err) {
         console.log(err)
         return (next(ApiError.createError(500, "Server error during creating order contains more than product!")))
      }
   }
}

export default OrdersCustomerController;
