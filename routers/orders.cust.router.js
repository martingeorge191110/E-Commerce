import express from 'express';
import OrdersCustomerController from '../controllers/orders.cust.controller.js';
import verify_token from '../middlewares/verify.token.js';



const OrdersCustomerRouter = express.Router()
const ordersInstance = new OrdersCustomerController()

OrdersCustomerRouter.use(verify_token)


/**
 * Router for manipulating
 * 
 * USEAGE:
 *       POST: --> create new order       tradition orders
 *       PATCH: --> Cancel the order      tradition orders
 *       PUT: --> Update order info       tradition orders
 *       GET: --> get orders in case of id, other wise all
 */
OrdersCustomerRouter.route("/")
                     .post(
                        ordersInstance.createOrderValid(), ordersInstance.validationError,
                        ordersInstance.createOrderController
                     )
                     .patch(
                        ordersInstance.orderIdValid(), ordersInstance.validationError,
                        ordersInstance.cancelOrderController
                     )
                     .put(
                        ordersInstance.updateOderValid(), ordersInstance.validationError,
                        ordersInstance.updateOrderController
                     )
                     .get(
                        ordersInstance.getOrdersValid(), ordersInstance.validationError,
                        ordersInstance.getOrdersController
                     )


/**
 * Router for manipulating big orders
 * 
 * USAGE: By Customers
 *       POST --> Creating big orders
 *       PATCH --> Cancel the order
 *       PUT --> Update products info, also adding or order items  
 */
OrdersCustomerRouter.route("/big-orders/")
                           .post(
                              ordersInstance.createBigOrderValid(), ordersInstance.validationError,
                              ordersInstance.createBigOrderController
                           )
                           .patch(
                              ordersInstance.orderIdValid(), ordersInstance.validationError,
                              ordersInstance.cancelBiogOrderController
                           )
                           .put(
                              ordersInstance.updateBigOrderValid(), ordersInstance.validationError,
                              ordersInstance.updateBigOrderController
                           )


/* This route for creating new stripe session */
OrdersCustomerRouter.route("/pay/")
                                 .post(
                                    ordersInstance.orderIdValid(), ordersInstance.validationError,
                                    ordersInstance.newStripeSessionController
                                 )


export default OrdersCustomerRouter;
