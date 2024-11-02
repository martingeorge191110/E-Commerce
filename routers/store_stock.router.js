import express from 'express';
import Store_StockController from '../controllers/store_stock.controller.js';
import verify_token from '../middlewares/verify.token.js';


const Store_StockRouter = express.Router()
const store_stockInstance = new Store_StockController()

Store_StockRouter.use(verify_token)


Store_StockRouter.route("/")
                           .post(
                              store_stockInstance.storeEmpAuthorized, store_stockInstance.addStoreInfValid(),
                              store_stockInstance.validationError, store_stockInstance.addStoreInfController
                           )
                           .get(
                              store_stockInstance.storeIdValidation(), store_stockInstance.validationError,
                              store_stockInstance.getStoreInfController
                           )
                           .put(
                              store_stockInstance.storeEmpAuthorized, store_stockInstance.updateStoreInfValid(),
                              store_stockInstance.updateStoreInfController
                           )
                           .delete(
                              store_stockInstance.storeEmpAuthorized, store_stockInstance.deleteStoreIdValid(),
                              store_stockInstance.validationError, store_stockInstance.deleteStoreController
                           )


export default Store_StockRouter;
