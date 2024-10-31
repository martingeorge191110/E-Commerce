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

      const token = this.createToken(null, null, result.id)
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

      const token = this.createToken(null, null, result.id)
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

      if (req.userError)
         return (next(ApiError.catchError("(server error during updating pass_code)")))

      const user = req.user

      let codeVia;
      try {
         if (status === 'sms')
            null
         else
            codeVia = await this.sendMail(user.email, "Password Reset Request",
            `
               <h1>Password Reset</h1>
               <p>Generated Code</p>
               <h2>${user.pass_code}</h2>
               <h3>expire date${user.exp_date}</h3>
            `
            )

         if (!codeVia)
            return (next(ApiError.createError(409, "Click on send Code again, to send to your mail!")))

      } catch (err) {
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

      if (req.userError)
         return (next(ApiError.catchError("(server errror during getting pass code form database)")))

      const currentDate = new Date(Date.now() + 1 * 60 * 1000)
      const user = req.user

      const cmpDate = user.exp_date > currentDate ? true : false
      if (!cmpDate)
         return (next(ApiError.createError(409, "Code expired, Please request a new code!")))

      const cmpCode = user.pass_code === code ? true : false
      if (!cmpCode)
         return (next(ApiError.createError(400, "Generated code is wrong!")))

      try {
         if (req.query.role === "customer") {
            await PrismaObject.customers.update({
               where: {email: req.body.email},
               data: {pass_code: null, exp_date: null}
            })
         } else {
            await PrismaObject.access_Roles.update({
               where: {sign_in_email: req.body.email},
               data: {pass_code: null, exp_date: null}
            })
         }
      } catch (err) {
         return (next(ApiError.catchError("(server error during deleting pass_code from data base)")))
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
      const {role} = req.query

      const newPassword = this.hashingPassword(password)

      try {
         if (role === "customer") {
            await PrismaObject.customers.update({
               where: {email},
               data: {
                  password: newPassword
               }
            })
         } else {
            await PrismaObject.access_Roles.update({
               where: {sign_in_email: email},
               data: {
                  password: newPassword
               }
            })
         }

      } catch (err) {
         return (next(ApiError.catchError("reset password")))
      }

      return (this.responseJsonDone(res, 200, "Password has been Updated, Succesfuly!", null))
   }
}

export default AuthController;
