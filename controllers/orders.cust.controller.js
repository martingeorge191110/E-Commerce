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
         return (next(ApiError.createError(500, "Server error during creating order contains more than product!")))
      }
   }

   /**
    * Cancel the order
    * 
    * Description:
    *             [1] --> after validation and auth, get the order info, then validate if the user paid or not
    *             [2] --> update order info to be canceled, then return the order items to products stocks, then response
    */
   cancelBiogOrderController = async (req, res, next) => {
      const order = req.order

      if (order.paid)
         return (next(ApiError.createError(400, "You paid the amount, please contact with customer services to return your money!")))

      try {
         const cancelOrder = await PrismaObject.orders.update({
            where: {
               id: order.id,
            },
            data: {
               status: "CANCELED"
            }
         })

         for (const item of order.orderItems)
            await PrismaObject.products.update({
               where: {
                  id: item.item_id
               },
               data: {
                  quantity: {
                     increment: item.quantity
                  }
               }
            })

         return (this.responseJsonDone(res, 200, "Order has been Canceled!", cancelOrder)) 
      } catch (err) {
         return (next(ApiError.createError(500, "Server Error during cancel the order")))
      }
   }

   /**
    * 
    */
   updateBigOrderController = async (req, res, next) => {
      const order = req.order
      const new_items = req.new_items
      const update_items = req.update_items
      const new_body = req.new_body
      const products_from_db = req.products_db
      const all_items_ids = req.all_items_ids
      const data_items = {
            orderItems: {},
      }
      let total_price = 0;

      if (new_items && new_items.length > 0) {
         data_items.orderItems.create = products_from_db.map((product) => {
            const current_item = new_items.find((ele) => ele.id === product.id)
            if (!current_item)
               return (null)

            const itemPrice = current_item.quantity < 0 ? item.price * - 1 : item.price
            total_price = total_price + itemPrice
            data_items.total_price = {
               increment: total_price
            }
            return ({
               item_id: current_item.id, quantity: current_item.quantity,
               price: current_item.quantity * product.price
            })
         }).filter(ele => ele !== null)
      }
      if (update_items && update_items.length > 0) {
         data_items.orderItems.update = products_from_db.map((item) => {
            const current_item = update_items.find((ele) => ele.id === item.id)
            if (!current_item)
               return (null)

            const itemPrice = (current_item.quantity < 0 ? item.price * - 1 : item.price) * current_item.quantity
            total_price = total_price + itemPrice
            data_items.total_price = {
               increment: total_price
            }

            return ({
               where: {
                  Order_Items_order_id_item_id_key: {
                     item_id: current_item.id, order_id: order.id
                  }
               },
               data: {
                  quantity: {
                     increment: current_item.quantity
                  }, price: {
                     increment: current_item.quantity * item.price
                  }
               }
            })
         }).filter(ele => ele !== null)
      }

      try {
         const update_order = await PrismaObject.orders.update({
            where: {
               id: order.id
            },
            data: {
               ...new_body,
               ...data_items
            }, include: {
               orderItems: true
            }
         })
         const allItems = new_items || update_items ? [...new_items, ...update_items] : []
         for (const item of allItems) {
            await PrismaObject.products.update({
               where: {
                  id: item.id
               }, data: {
                  quantity: {
                     decrement: item.quantity 
                  }
               }
            })
         }

         return (this.responseJsonDone(res, 200, "Order info has been updated!", update_order))
      } catch (err) {
         return (next(ApiError.createError(500, "Server error during update order information!")))
      }
   }

   /**
    * Controller to create tradition orders (1 product not a CUART)
    * 
    * Description:
    *             [1] --> after validation and auth, create the new order with requirements
    *             [2] --> update product quantity in data base, then response with the order details
    */
   createOrderController = async (req, res, next) => {
      const body = req.new_body
      const user = req.user
      const product = req.product

      try {
         const order = await PrismaObject.orders.create({
            data: {
               customer_id: user.id,
               orderItems: {
                  create: {
                     item_id: product.product.id,
                     quantity: product.customer_order.quantity,
                     price: product.customer_order.quantity * product.product.price
                  }
               },
               total_price: product.customer_order.quantity * product.product.price,
               ...body
            },
            include: {
               orderItems: {
                  include: {
                     product: {
                        select: {id: true, name: true, description: true, price: true, company: true, category: true}
                     }
                  }
               }
            }
         })

         await PrismaObject.products.update({
            where: {id: product.product.id},
            data: {
               quantity: {
                  decrement: product.customer_order.quantity
               }
            }
         })

         return (this.responseJsonDone(res, 201, `We received the Order whcih is ${product.product.name}`, order))
      } catch (err) {
         return (next(ApiError.createError(500, "Server error during creating a new order!")))
      }
   }

   /**
    * Controller to cancele the tradition order
    * 
    * Description:
    *             [1] --> after validation and auth, cancel order
    *             [2] --> retreive product to the records, then response
    */
   cancelOrderController = async (req, res, next) => {
      const order = req.order

      try {
         const canceleOrder = await PrismaObject.orders.update({
            where: {id: order.id},
            data: {
               status: "CANCELED"
            }
         })

         await PrismaObject.products.update({
            where: {
               id: order.orderItems[0].product.id
            }, data: {
               quantity: {
                  increment: order.orderItems[0].quantity
               }
            }
         })

         return (this.responseJsonDone(res, 200, "Order has been canceled, you cannot update id again!", canceleOrder))
      } catch (err) {
         console.log(err)
         return (next(ApiError.createError(500, "Server error during canceling the order!")))
      }
   }

   /**
    * Controller to update tradition order info
    * 
    * Description:
    *             [1] --> 
    */
   updateOrderController = async (req, res, next) => {
      const body = req.new_body
      const quantity = req.quantity
      const order = req.order
      const orderItems = req.order.orderItems[0]
      const total_quantity = quantity + orderItems.quantity
      let total_price = null;
      if (quantity && quantity < 0)
         total_price =  (orderItems.price / orderItems.quantity) * total_quantity
      else if (quantity && quantity > 0)
         total_price = orderItems.product.price * total_quantity

      const update_data = {}

      if (total_price) {
         update_data.total_price = total_price
         update_data.orderItems = {
            update: {
               where: {
                  Order_Items_order_id_item_id_key: {
                     order_id: order.id, item_id: orderItems.item_id
                  }
               },
               data: {
                  quantity: {
                     increment: quantity,
                  },
                  price: total_price
               }
            }
         }
      }
      try {
         const updateOrder = await PrismaObject.orders.update({
            where: {id: order.id},
            data: {
               ...update_data,
               ...body
            },
            include: {
               orderItems: {
                  include: {
                     product: {
                        select: {id: true, name: true, description: true, price: true, company: true, category: true}
                     }
                  }
               }
            }
         })

         if (total_price && quantity)
            await PrismaObject.products.update({
               where: {id: orderItems.product.id},
               data: {quantity: {
                  decrement: quantity
               }}
            })

         return (this.responseJsonDone(res, 200, "Order data has been updated and recorded!", updateOrder))
      } catch (err) {
         console.log(err)
         return (next(ApiError.createError(500, "Server error during updating the order info!")))
      }
   }

   /**
    * Controller to get customer orders
    * 
    * Description:
    *             [1] --> after validation and auth, retreive the order if query include the id
    *             [2] --> if no query exists, retreive all customer order details
    */
   getOrdersController = async (req, res, next) => {
      const user = req.user
      const order = req.order

      if (order)
         return (this.responseJsonDone(res, 200, "Order details is retreived!", order))

      try {
         const orders = await PrismaObject.orders.findMany({
            where: {
               customer_id: user.id
            },
            include: {
               orderItems: {
                  include: {
                     product: {
                        select: {
                           id: true, name: true
                        }
                     }
                  }
               }
            }
         })

         return (this.responseJsonDone(res, 200, "all orders has been retreived", orders))
      } catch (err) {
         return (next(ApiError.createError(500, "Server error during searching about orders!")))
      }
   }
}

export default OrdersCustomerController;
