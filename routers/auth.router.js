import express from 'express';
import AuthValidator from '../utilies_validators/auth.validator.js';
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
		authObject.register
	)



/* Login api process */
AuthRouter.route("/login").post()

/**
 * Reset Password api process
 *
 * Methods:
 * POST: Send a new code for user and set exp data
 * GET: send mail with this gen code and exp date
 * PUT: compare code, then update password to new one
 */
AuthRouter.route("/reset-passwrod")
                                    .post()
                                    .get()
                                    .put()

export default AuthRouter;
