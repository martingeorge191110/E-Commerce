import express from 'express';
import OrdersCustomerController from '../controllers/orders.cust.controller.js';
import verify_token from '../middlewares/verify.token.js';



const OrdersCustomerRouter = express.Router()
const ordersInstance = new OrdersCustomerController()

OrdersCustomerRouter.use(verify_token)


OrdersCustomerRouter.route("/")
                     .post(

                     )


/**
 * Router for manipulating big orders
 * 
 * USAGE: By Customers
 *       POST --> Creating big orders
 */
OrdersCustomerRouter.route("/big-orders/")
                           .post(
                              ordersInstance.createBigOrderValid(), ordersInstance.validationError,
                              ordersInstance.createBigOrderController
                           )



export default OrdersCustomerRouter;
