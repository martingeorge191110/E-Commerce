import cookieParser from "cookie-parser";
import ApiError from "../middlewares/errorHandler.js";
import PrismaObject from "../prisma/prisma.js";
import AccessRoleValidator from "../utilies_validators/accessroles.validator.js";
import bcrypt from 'bcrypt';



class AccessRoleController extends AccessRoleValidator {


   /**
     * Controller for Employee who has access role registeration process
     *
     * Description:
     *          [1] --> check at first existing of employee information to avoid conflict in data base
     *          [2] --> creating new access role in data base using hashed password, then response
     */
   employeeRegisterController = async (req, res, next) => {
      const {sign_in_email, password, role, description, permissions} = req.body
      const employee = req.employee
      const result = {};

      try{
         const findUser = await PrismaObject.access_Roles.findUnique({
            where: {user_id: employee.id}
         })

         if (findUser)
            return (next(ApiError.createError(409, "This employee already has a system account!")))
   
         const user = await PrismaObject.access_Roles.create({
            data: {
               role, sign_in_email, password, description,
               permissions: {
                  create: permissions.map((permission) => ({
                     permission: permission
                  }))
               }, user_id: employee.id
            },
            include: {
               employee: true, permissions: true
            }
         })
   
         Object.assign(result, user);
      } catch (err) {
         return (next(ApiError.catchError("creating employee account")))
      }

      return (this.responseJsonDone(res, 201, "New Employee account created on the system!", result))
   }

   /**
     * Controller for Customer registeration process
     *
     * Description:
     *          [1] --> Find Employee and check whether exist or not, if exist check password
     *          [2] --> create token and also set new cookies, then response
     */
   employeeLoginController = async (req, res, next) =>  {
      const {email, password} = req.body

      let accessRoleEmp;
      try {
         accessRoleEmp = await PrismaObject.access_Roles.findUnique({
            where: {sign_in_email: email},
            include: {
               permissions: {
                  select: {permission: true}
               }, employee: true, Products: true
            }
         })

      } catch (err) {
         return (next(ApiError.createError(500, "Server error")))
      }

      const employee = accessRoleEmp
      if (!employee)
         return (next(ApiError.createError(404, "Wrong email!")))
      
      const comparePass = this.comparingPasswords(password, employee.password)
      if (!comparePass)
         return (next(ApiError.createError("400", "Wrong Password!")))

      employee.permissions = employee.permissions.map((ele) => {
         return (ele.permission)
      })

      const token = this.createToken(employee.role, employee.permissions, employee.id)
      this.setNewCookie(res, token)

      employee.token = token
      return (this.responseJsonDone(res, 200, "Welcome", employee))
   }

   /**
    * Controller to retrieve account
    * 
    * Description:
    *             [1] --> after token validation, just create find query, then resposne
    */
   retrieveAccountController = async (req, res, next) => {
      const user = req.user

      try {
         const account = await PrismaObject.access_Roles.findUnique({
            where: {id: user.id},
            include: {
               employee: true,
               permissions: true,
               Products: true,
               notification_received: true,
               notification_sent: true
            }
         })

         return (this.responseJsonDone(res, 200, "Successfuly, Retrieved!", account))
      } catch (err) {
         return (next(ApiError.createError(500, "Server error during retreiving your system account!")))
      }
   }

   /**
    * Controller to search about accounts
    * 
    * Description:
    *             [1] -->
    */
   searchAccountController = async (req, res, next) => {
      const query = req.query

      if (req.accounts)
         return (this.responseJsonDone(res, 200, "Successfuly, Retrieved!", req.accounts))

      try {
         const accounts = await PrismaObject.access_Roles.findMany({
            where: query,
            include: {
               permissions: {
                  select: {permission: true}
               }, employee: true
            }
         })

         return (this.responseJsonDone(res, 200, "Successfuly, Retrieved!", accounts))
      } catch (err) {
         return (next(ApiError.createError(500, "server error during retrieve specific account")))
      }
   }
}

export default AccessRoleController;
