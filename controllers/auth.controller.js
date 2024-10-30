import PrismaObject from '../prisma/prisma.js'
import AuthValidator from '../utilies_validators/auth.validator.js';
import ApiError from '../middlewares/errorHandler.js';

/**
 * Auth Class Controller
 */
class AuthController extends AuthValidator {
   // constructor () {
   //    // primsa object
   // }

   /**
     * Controller for Customer registeration process
     *
     * Description:
     *          [1] --> check at first existing of user information to avoid conflict in data base
     *          [2] --> creating new user in data base using hashed password and creating token
     *          [3] --> response and also create new cookie with token
     */
   register = async (req, res, next) => {
      const {first_name, second_name, email, password} = req.body

      const selectedItems = this.userSelectData(["id", "first_name", "second_name", "email"])
      const result = {};

      try {
         const findUser = await PrismaObject.customers.findUnique({
            where: {email: email}
         })
         
         if (findUser)
            return (next(ApiError.createError(409, "Email already exists!")))

         const hashedPass = this.hashingPassword(password)

         const user = await PrismaObject.customers.create({
            data: {
               first_name, second_name, email, password: hashedPass
            },
            select: selectedItems
         })

         Object.assign(result, user);
      } catch (err) {
         return (next(ApiError.catchError("registering")))
      }

      const token = this.createToken(null, result.id)
      this.setNewCookie(res, token)

      result.token = token
      return (this.responseJsonDone(res, 201, "Welcome to our PlatForm!", result))
   }
}

export default AuthController;
