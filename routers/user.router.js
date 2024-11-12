import express from 'express'
import UserController from '../controllers/user.controller.js'
import verify_token from '../middlewares/verify.token.js'
import uploader from '../middlewares/milter.js'
import CloudinaryUtilies from '../utilies_validators/cloudinary.utilies.js'




const UserRouter = express.Router()
const userInstance = new UserController()


UserRouter.use(verify_token)


UserRouter.route("/profile/")
                           .put(
                              userInstance.completeProfileValid(), userInstance.validationError,
                              userInstance.completeProfileController
                           )
                           .get(
                              userInstance.retreiveProfileController
                           )



UserRouter.route("/avatar/")
                     .put(
                        uploader('customers').single('avatar'), CloudinaryUtilies.uploadAvatars,
                        userInstance.uploadAvatarController
                     )


/* Searching route
   userid or searching with name, or searching for all*/
UserRouter.route("/search/")
                        .get()





export default UserRouter;
