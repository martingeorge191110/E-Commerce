import express from 'express';
import EmployeesController from '../controllers/employees.controller.js';
import uploader from '../middlewares/milter.js';
import CloudinaryUtilies from '../utilies_validators/cloudinary.utilies.js';
import verify_token from '../middlewares/verify.token.js';


const EmployeesRouter = express.Router()
const employeeInstance = new EmployeesController()


EmployeesRouter.use(verify_token)


/**
 * Employee Route, manipulating employees actions
 * 
 * USAGE:
 *       POST: adding new employee info
 *       PATCH: update just employee status
 *       PUT: update employee information
 *       DELETE: deleting all employee records
 *       GET:
 */
EmployeesRouter.route("/")
                        .post(
                           employeeInstance.empManipAuth,
                           uploader("employees").single("avatar"),
                           employeeInstance.addEmployeeValid(), employeeInstance.validationError,
                           CloudinaryUtilies.uploadAvatars,
                           employeeInstance.addNewEmployeeController
                        )
                        .patch(
                           employeeInstance.empManipAuth,
                           employeeInstance.updateStatusValid(), employeeInstance.validationError,
                           employeeInstance.updateEmployeeStatusController
                        )
                        .put(
                           employeeInstance.empManipAuth,
                           employeeInstance.employeeIdValid(), employeeInstance.validationError,
                           employeeInstance.updateEmployeeController
                        )
                        .delete(
                           employeeInstance.empManipAuth,
                           employeeInstance.employeeIdValid(), employeeInstance.validationError,
                           employeeInstance.deleteEmpRecordsController
                        )
                        .get(
                           employeeInstance.employeeIdValid(), employeeInstance.validationError,
                           employeeInstance.retreiveEmployeeCont
                        )


export default EmployeesRouter;
