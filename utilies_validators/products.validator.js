import { body } from "express-validator";
import GlobalUtilies from "./global.utilies.js";
import ApiError from "../middlewares/errorHandler.js";




class ProductsValidator extends GlobalUtilies{

   /* Function that return
      array of express validator to check
      the validation of (product body data) */
   addOneValid = () => {
      const fields = ["name", "quantity", "price", "cost_per_unit", "category", "company"]
      const stringFields = ["name", "category", "company"]
      const numberFields = ["quantity", "price", "cost_per_unit"]

      return ([
         ...fields.map((field) => {
            return (body(field)
               .notEmpty()
               .withMessage("this field required"))
         }),
         ...stringFields.map((field) => {
            return (body(field)
               .isString()
               .withMessage("This field type must be string!"))
         }),
         ...numberFields.map((field) => {
            return (body(field)
               .isNumeric()
               .withMessage("This field type must be numeric!"))
         }),
         body("company")
            .isIn(["APPLE", "NIKE", "SAMSUNG", "IKEA", "ADIDAS", "WHIRLPOOL", "HASBRO", "MATTEL", "PETCO", "GNC", "AMAZON", "COSTCO", "WALMART", "OFFICE_DEPOT", "STAPLES", "ZARA", "SONY", "FENDER", "BOSTON_ACCENT", "BLACK_AND_DECKER", "HUNTER", "BOSCH"])
            .withMessage("Invalid company value"),
         body("category")
            .isIn(["ELECTRONICS", "FASHION", "HOME_AND_KITCHEN", "SPORTS_AND_OUTDOORS", "BEAUTY_AND_HEALTH", "TOYS_AND_GAMES", "AUTOMOTIVE", "BOOKS", "GROCERIES", "PET_SUPPLIES", "OFFICE_SUPPLIES", "MUSIC_AND_INSTRUMENTS", "JEWELRY", "GARDEN_AND_OUTDOOR"])
            .withMessage("Invalid category value")
      ])
   }

   /* Function middleware to determine whether
   this user authorized for dealing with
   manipulating products or not */
   employeeAuthValid = (req, res, next) => {
      const { user } = req.user

      const permissions = user.permissions
      for (let i = 0; i < permissions.length; i++) {
         if (permissions[i] === "CREATE_PRODUCT" || permissions[i] === "EDIT_PRODUCT" || permissions[i] === "DELETE_PRODUCT" || permissions[i] === "MANAGE_INVENTORY") {
            return (next())
         }
      }
      return (ApiError.responseError(
         ApiError.createError(403, "You are not Authorized!"), req, res, next
      ))
   }

   /* Function Middleware to chech the request
   body is valid or catching errors */
   validationError = (req, res, next) => {
      const validation = validationResult(req)
      if (!validation.isEmpty()) {
         const apiError = ApiError.createError(400, validation.array())
         return (ApiError.responseError(apiError, req, res, next))
      }
      next()
   }
}


export default ProductsValidator;
