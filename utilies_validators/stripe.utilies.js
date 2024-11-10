import Stripe from "stripe";
import PrismaObject from "../prisma/prisma.js";



const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)


/* Function that create new stripe session */
const create_stripe_session = async (req, order_id, customer_id) => {
   let orderItems;
   try {
      orderItems = await PrismaObject.orderItems.findMany({
         where: {
            order_id
         },
         select: {
            product: {
               select: {
                  name: true
               }
            }, quantity: true, price: true
         }
      })

   } catch (err) {
      return (null)
   }

   const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
         ...orderItems.map((item) => ({
            price_data: {
               currency: 'egp',
               product_data: {
                  name: item.product.name,
                  description: item.product.name ? "Product description" : undefined,
               },
               unit_amount: item.price * 100,
            },
            quantity: item.quantity
         }))
      ],
      metadata: {
         order_id: order_id,
         customer_id: customer_id,
         payment: true
      },
      mode: 'payment',
      success_url: `${req.protocol}://${req.get('host')}/success`,
      cancel_url: `${req.protocol}://${req.get('host')}/cancel`
   })

   return (session.url)
}

export default (create_stripe_session)
