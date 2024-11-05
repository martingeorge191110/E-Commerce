import express from 'express';
import SysNotifController from '../controllers/sys.notif.controller.js';
import verify_token from '../middlewares/verify.token.js';


const SysNotifRouter = express.Router()
const sysNotifInstance = new SysNotifController()


SysNotifRouter.use(verify_token)



SysNotifRouter.route("/")
                        .post(
                           sysNotifInstance.sendNotifValid(), sysNotifInstance.validationError,
                           sysNotifInstance.sendNotifController
                        )
                        .get(sysNotifInstance.getAllNotifController)
                        .patch(
                           sysNotifInstance.updateNotifValid(), sysNotifInstance.validationError,
                           sysNotifInstance.updateNotifController
                        )
                        .delete(
                           sysNotifInstance.notifIdValid(), sysNotifInstance.validationError,
                           sysNotifInstance.deleteNotifController
                        )




export default SysNotifRouter;
