import express from 'express';
import ProductsController from '../controllers/products.controller.js';
import verify_token from '../middlewares/verify.token.js';


const ProductsRouter = express.Router()
const productsInstance = new ProductsController()

/* if token is valid will return
   {
      id, role(if user is emplyee)
   } */
ProductsRouter.use(verify_token)

/*  */
ProductsRouter.route("/")
                        .post(productsInstance.employeeAuthValid, productsInstance.addOneValid(), productsInstance.validationError, productsInstance.addProductsController)





export default ProductsRouter;
