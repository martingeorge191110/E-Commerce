import express from 'express';
import EmployeesController from '../controllers/employees.controller.js';
import uploader from '../middlewares/milter.js';
import CloudinaryUtilies from '../utilies_validators/cloudinary.utilies.js';


const EmployeesRouter = express.Router()
const employeeInstance = new EmployeesController()


EmployeesRouter.route("/")
                        .post(
                           /* Must put here middle ware for authorization */
                           uploader("employees").single("avatar"), CloudinaryUtilies.uploadAvatars,
                           employeeInstance.addEmployeeValid(), employeeInstance.validationError,
                           employeeInstance.addNewEmployeeController
                        )


export default EmployeesRouter;
