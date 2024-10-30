import PrismaObject from '../prisma/prisma.js'
import AuthValidator from '../utilies_validators/auth.validator.js';
import ApiError from '../middlewares/errorHandler.js';

/**
 * Auth Class Controller
 */
class AuthController extends AuthValidator {

   /**
     * Controller for Customer registeration process
     *
     * Description:
     *          [1] --> check at first existing of user information to avoid conflict in data base
     *          [2] --> creating new user in data base using hashed password and creating token
     *          [3] --> response and also create new cookie with token
     */
   registerController = async (req, res, next) => {
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

   /**
     * Controller for Customer registeration process
     *
     * Description:
     *          [1] --> Find user and check whether user exist or not, if exist check passwor
     *          [2] --> create token and also set new cookies, then response
     */
   logInController = async (req, res, next) => {
      const {email, password} = req.body
      const result = {};

      try {
         const user = await PrismaObject.customers.findUnique({
            where: {email}
         })

         if (!user)
            return (next(ApiError.createError(404, "your email is not exist, please register at first!")))

         const checkPass = this.comparingPasswords(password, user.password)
         if (!checkPass)
            return (next(ApiError.createError(401, "Wrong Password!")))

         Object.assign(result, user)
      } catch (err) {
         return (next(ApiError.catchError("login")))
      }

      const token = this.createToken(null, result.id)
      this.setNewCookie(res, token)

      result.token = token
      return (this.responseJsonDone(res, 201, "Welcome to our PlatForm!", result))
   }

   /**
    * Controller for forgeting passwrod process
    * 
    * Description:
    *             [1] --> Update user gen code and exp date, after checking user email existing
    *             [2] --> sned mail with generated code, then response.
    */
   sendCodeController = async (req, res, next) => {
      const {email} = req.body
      const {status} = req.query

      const code = String(Math.random()).slice(3,9)
      const expDate = new Date(Date.now() + 5 * 60 * 1000);
      let user
      try {
         user = await PrismaObject.customers.update({
            where: {email},
            data: {
               pass_code: code,
               exp_date: expDate
            }
         })

         if (!user)
            return (next(ApiError.createError(404, "User not found, please Register at first!")))

      } catch (err) {
         return (next(ApiError.catchError("sending generated code")))
      }

      let codeVia;
      try {
         if (status === 'sms')
            null
         else
            codeVia = await this.sendMail(user.email, "Password Reset Request",
            `
               <h1>Password Reset</h1>
               <p>Generated Code</p>
               <h2>${code}</h2>
               <h3>expire date${expDate}</h3>
            `
            )

         if (!codeVia)
            return (next(ApiError.createError(409, "Click on send Code again, to send to your mail!")))
      } catch (err) {
         console.log(err)
         return (next(ApiError.createError(409, "Click on send Code again, to send to your mail!")))
      }

      return (this.responseJsonDone(res, 200, "Succesfuly, code sent!", {email: email}))
   }

   /**
    * Controller for Comparign code and epx date
    * 
    * Description:
    *             [1] --> check whether user exists or not
    *             [2] --> compare current date and user expdate, also compare code, then response
    */
   checkCodeController = async (req, res, next) => {
      const {email, code} = req.body

      const currentDate = new Date(Date.now() + 1 * 60 * 1000)
      let user;
      try {
         user = await PrismaObject.customers.findUnique({
            where: {email}
         })

      } catch (err) {
         return (next(ApiError.catchError("get user code from data base!")))
      }
      const cmpDate = user.exp_date > currentDate ? true : false
      if (!cmpDate)
         return (next(ApiError.createError(409, "Code expired, Please request a new code!")))

      const cmpCode = user.pass_code === code ? true : false
      if (!cmpCode)
         return (next(ApiError.createError(400, "Generated code is wrong!")))

      try {
         user = await PrismaObject.customers.update({
            where: {email},
            data: {pass_code: null, exp_date: null}
         })
      } catch (err) {
         return (next(ApiError.catchError("Remove code from data base")))
      }

      return (this.responseJsonDone(res, 200, "Succesfuly!", {email: email}))
   }

   /**
    * Comparign code and epx date Reset new password
    * 
    * Description:
    *             [1] --> Create new hashed password, and also update user
    *             [2] --> Response based on user exist or not
    */
   resetPassController = async (req, res, next) => {
      const {email, password} = req.body

      const newPassword = this.hashingPassword(password)
      try {
         const updateUser = await PrismaObject.customers.update({
            where: {email},
            data: {
               password: newPassword
            }
         })

      } catch (err) {
         return (next(ApiError.catchError("reset password")))
      }

      return (this.responseJsonDone(res, 200, "Password has been Updated, Succesfuly!", null))
   }
}

export default AuthController;
