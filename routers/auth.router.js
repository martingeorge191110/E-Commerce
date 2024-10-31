import express from 'express';
import AuthController from '../controllers/auth.controller.js';


/**
 * Authintication For:
 *							Users and Employees have
 *							Permission Access on web or system
 */
const AuthRouter = express.Router()
const authObject = new AuthController()

/* Register or customers api process 
	--> validation at first and catch errors if exists
	--> controller starts to play*/
AuthRouter.route("/register").post(
		authObject.registerValid(),
		authObject.validationError,
		authObject.registerController
	)



/* Login api process */
AuthRouter.route("/login").post(
	authObject.logInValid(),
	authObject.validationError,
	authObject.logInController
)

/**
 * Reset Password api process
 *
 * Methods:
 * POST: Send a new code for user and set exp data (query contains: (status: (mail, sms), role: ("customer", "employee")))
 * PATCH: compare code and exp date, then delete it from DB
 * PUT: Reset password
 */
AuthRouter.route("/reset-passwrod/")
                                    .post(authObject.sendCodeValid(), authObject.validationError, authObject.sendCodeController)
                                    .patch(authObject.checkCodeValid(), authObject.validationError, authObject.checkCodeController)
                                    .put(authObject.resetPassValid(), authObject.validationError, authObject.resetPassController)

export default AuthRouter;
