import express from 'express';
import AccessRoleController from '../controllers/accessroles.controller.js';
import verify_token from '../middlewares/verify.token.js';


/**
 * Authintication For:
 *       Employees have Permission Access on web or system
 */
const AccessRoleRouter = express.Router()
const accessRoleObj = new AccessRoleController()

/* Function that give the user access
   to make system login */
AccessRoleRouter.route("/login")
         .post(
            accessRoleObj.loginValid(), accessRoleObj.validationError,
            accessRoleObj.employeeLoginController
         )


AccessRoleRouter.use(verify_token)

/* Register or customers api process
   --> IMPORTANT NOTE: Check permissions in validator at first
	--> validation at first, make sure about this employee
		has records in the DB and catch errors if exists
	--> controller starts to play*/
AccessRoleRouter.route("/register")
         .post(
            accessRoleObj.fullPermissionValid, accessRoleObj.employeeRegisterValid()
            , accessRoleObj.validationError, accessRoleObj.employeeRegisterController
         )


/* USAGE:
         --> GET: Retrieve user account */
AccessRoleRouter.route("/")
                           .get(
                              accessRoleObj.retrieveAccountController
                           )


/* USAGE:
         --> GET: search about specific account or any accounts */
AccessRoleRouter.route("/search/")
                           .get(
                              accessRoleObj.searchAccountValid(), accessRoleObj.validationError,
                              accessRoleObj.searchAccountController
                           )

export default AccessRoleRouter;
