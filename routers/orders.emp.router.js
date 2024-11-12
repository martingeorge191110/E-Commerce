import express from 'express';
import verify_token from '../middlewares/verify.token.js';
import OrdersEmployeeController from '../controllers/orders.emp.controller.js';



const OrdersEmployeeRouter = express.Router()
const ordersInstance = new OrdersEmployeeController()

/* This route for delivery emplyees, when sending the order */
OrdersEmployeeRouter.route("/delivered/")
                              .get(
                                 ordersInstance.employeeReceivedValid(), ordersInstance.validationError,
                                 ordersInstance.employeeReceivedController
                              )



OrdersEmployeeRouter.use(verify_token)



OrdersEmployeeRouter.route("/")
                           .get(
                              ordersInstance.trackOrdersAuth,
                              ordersInstance.getOrdersValid(), ordersInstance.validationError,
                              ordersInstance.getOrdersController
                           )
                           .put(
                              ordersInstance.trackOrdersAuth,
                              ordersInstance.updateOrderValid(), ordersInstance.validationError,
                              ordersInstance.updateOrderController
                           )


export default OrdersEmployeeRouter;
