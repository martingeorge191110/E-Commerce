import PrismaObject from "../prisma/prisma.js";



class OrderStaticUtilies {

   /* Static function utilies to updated paid orders */
   static updatePaidOrders = async (order_id, customer_id) => {

      try {
         const order = await PrismaObject.orders.update({
            where: {
               id: order_id, customer_id
            },
            data: {
               payment_method: "CARD", paid: true
            }
         })

         return (order)
      } catch (err) {
         return (null)
      }
   }
}

export default OrderStaticUtilies;
