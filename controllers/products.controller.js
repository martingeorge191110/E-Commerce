import ApiError from "../middlewares/errorHandler.js";
import PrismaObject from "../prisma/prisma.js";
import ProductsValidator from "../utilies_validators/products.validator.js";


/**
 * Products Managment class controller
 */
class ProductsController extends ProductsValidator{


   /**
     * Controller for Employee adding product
     *
     * Description:
     *          [1] --> after validation, adding product, then repsonse
     */
   addProductsController = async (req, res, next) => {
      const body = req.body
      const user = req.user

      try {
         const product = await PrismaObject.products.create({
            data: {
               employee_id: user.id,
               all_cost: body.cost_per_unit * body.quantity,
               ...body
            }
         })

         return (this.responseJsonDone(res, 201, "Products Added to data base succesfuly!", product))
      } catch (err) {
         return (next(ApiError.catchError("adding the product field information in data base")))
      }
   }
}

export default ProductsController;
