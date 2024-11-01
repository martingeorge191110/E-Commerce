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
            },
            include: {
               employee: {
                  include: {employee: true}
               }
            }
         })

         return (this.responseJsonDone(res, 201, "Products Added to data base succesfuly!", product))
      } catch (err) {
         return (next(ApiError.catchError("adding the product field information in data base")))
      }
   }

   /**
    * Controller to View products details for Employees
    * 
    * Description:
    *             [1] --> get the query after validation, perform search query then response
    */
   employeeViewController = async (req, res, next) => {
      const query = req.newQuery
      const user = req.user
      const object = {}

      if (user.role) {
         object.include = {
               employee: true,
               Stock: true
            }
      } else {
         object.select = {
            name: true, description: true, category: true, company: true, price: true
         }
      }

      try {
         const products = await PrismaObject.products.findMany({
            where: query,
            ...object
         })

         return (this.responseJsonDone(res, 200, "succesfuly retrieved!", products))
      } catch (err) {
         return (next(ApiError.catchError("searching about Products")))
      }
   }

   /**
    * Controller to Update products details (Auth who has the access)
    * 
    * Description:
    *             [1] --> get the body and product inf
    *                   after validation, perform updating query then response
    */
   updateProductController = async (req, res, next) => {
      const body = req.body
      const product = req.product

      try {
         const updateProduct = await PrismaObject.products.update({
            where: {id: product.id},
            data: body
         })

         this.responseJsonDone(res, 200, "Updated succesfuly!", updateProduct)
      } catch (err) {
         return (next(ApiError.catchError("updating Product")))
      }
   }

   /**
    * Controller to Update products details (Auth who has the access)
    * 
    * Description:
    *             [1] --> get product id and remove it from the DB
    */
   deleteProductController = async (req, res, next) => {
      const {productId} = req.query

      try {
         await PrismaObject.products.delete({
            where: {id: productId}
         })

         this.responseJsonDone(res, 200, "Product Deleted succesfuly From DB!", null)
      } catch (err) {
         return (ApiError.catchError("deleting product stock from data base"))
      }
   }
}

export default ProductsController;
