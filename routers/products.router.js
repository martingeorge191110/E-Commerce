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

/* Route for manipulate Products:
   USAGE:
         POST: --> employees have the licence to add new products 
         */
ProductsRouter.route("/")
                        .post(
                           productsInstance.employeeAuthValid, productsInstance.addOneValid(),
                           productsInstance.addProductsController
                        )
                        .get(
                           productsInstance.optionalValid(), productsInstance.validationError,
                           productsInstance.employeeViewController
                        )
                        .put(
                           productsInstance.employeeAuthValid, productsInstance.productIdValid(),
                           productsInstance.optionalValid(), productsInstance.updateProductController
                        )




export default ProductsRouter;
