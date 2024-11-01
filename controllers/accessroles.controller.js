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

}

export default AccessRoleController;
