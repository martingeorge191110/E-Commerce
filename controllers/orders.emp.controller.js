import ApiError from "../middlewares/errorHandler.js";
import PrismaObject from "../prisma/prisma.js";
import OrdersEmployeeValidator from "../utilies_validators/orders.emp.validator.js";

const orders = {}

class OrdersEmployeeController extends OrdersEmployeeValidator {


   /**
    * Controller to show all orders based on query
    * 
    * Description:
    *             [1] --> get old query and processing it to new queyr which suitable for the requirements
    *             [2] --> search about the orders using prisma, the response
    */
   getOrdersController = async (req, res, next) => {
      const old_query = Object.entries(req.query)
      let query = req.new_query

      old_query.forEach((ele) => {
         if (ele[0] !== 'paid')
            query[ele[0]] = ele[1]
      })

      if (!query || Object.entries(query).length < 1)
         return (next(ApiError.createError(400, "You must search with queries!")))

      try {
         const orders = await PrismaObject.orders.findMany({
            where: {
               ...query
            },
            include: {
               delivery: true,
               customer: true,
               store: true,
               orderItems: true
            }
         })

         return (this.responseJsonDone(res, 200 ,"Orders with your requirements has been retreived!" , orders))
      } catch (err) {
         return (next(ApiError.createError(500, "Server error during find orders!")))
      }
   }

   /**
    * Controller to make adjust orders, (adding delivery employee or adjust status, ....)
    * 
    * Description:
    *             [1] --> 
    */
   updateOrderController = async (req, res, next) => {
      const order = req.order
      const store = req.store
      const delivery = req.delivery

      try {
         const update_order = await PrismaObject.orders.update({
            where: {
               id: order.id
            },
            data: {
               delivery_id: delivery.id,
               store_id: store.id
            },
            include: {
               customer: true,
               delivery: true
            }
         })

         const genCode = String(Math.random()).slice(0, 7)
         orders[order.id] = genCode
         await this.sendMail(delivery.email, 'New order request!',
            `
      <h2>New Order</h2>
      <h3>Order Details:</h3>
      <p><strong>Order ID:</strong> ${update_order.id}</p>
      
      <h3>Customer Information:</h3>
      <p><strong>Name:${update_order.customer.first_name} ${update_order.customer.second_name}</strong> </p>
      <p><strong>Address:</strong> ${update_order.address}</p>
      <p><strong>Phone:</strong> ${update_order.customer.phone}</p>
      <p><strong>Email:</strong> ${update_order.customer.email}</p>
      
      <h3>Store Information:</h3>
      <p><strong>Store Name:</strong> ${store.name}</p>

      <a href="http://localhost:8000/api/order/employee/delivered/?order_id=${order.id}&delivery_id=${delivery.id}&code=${genCode}" style="
         display: inline-block;
         padding: 10px 20px;
         color: white;
         background-color: #28a745;
         text-decoration: none;
         border-radius: 5px;
         font-weight: bold;
         text-align: center;
      ">Order received</a>
      <p>password: <strong>${genCode}</strong></p>
      `)
      return (this.responseJsonDone(res, 200, `Order will be out from ${store.name} with ${update_order.delivery.first_name} ${update_order.delivery.last_name}, his/her phone ${update_order.delivery.phone}`, update_order))
      } catch (err) {
         return (next(ApiError.createError(500, "Server error during updating the order!")))
      }
   }

   /**
    * Controller to update order, to be recevied by delivery employee
    * 
    * Description:
    *             [1] --> 
    */
   employeeReceivedController = async (req, res, next) => {
      const order = req.order
      const delivery = req.delivery
      const code = req.code

      console.log(req.query)
      if (code === orders[order.id])
         console.log(true)

      return (this.responseJsonDone(res, 200, "Awd", null))
   }
}

export default OrdersEmployeeController;
