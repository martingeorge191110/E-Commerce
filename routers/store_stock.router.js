import express from 'express';
import Store_StockController from '../controllers/store_stock.controller.js';
import verify_token from '../middlewares/verify.token.js';


const Store_StockRouter = express.Router()
const store_stockInstance = new Store_StockController()

Store_StockRouter.use(verify_token)


/* Route for manipulate Stores:
   USAGE:
         POST: --> Managers have the licence to add new store inf
         GET: --> search about Stores information (both employees and managers)
         PUT: --> employees have the licence to update store inf
         DELETE: --> employees have the licence to delete store
         */
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

/* Route for manipulate Stockes:
   USAGE:
         POST: --> Employees have the licence to add new or updating existing stock
         GET: --> search about products (both employees and managers)
         */
Store_StockRouter.route("/stock/")
                                    .post(
                                       store_stockInstance.stockEmpAuthorized, store_stockInstance.shippingStockValid(),
                                       store_stockInstance.validationError, store_stockInstance.shippingStockController
                                    )
                                    .get(
                                       store_stockInstance.storeStocksInfValid(), store_stockInstance.validationError,
                                       store_stockInstance.storeStockAuth, store_stockInstance.getAllStoreStocksInf
                                    )


Store_StockRouter.route("/send-stock/")
                                       .post(
                                          store_stockInstance.stockEmpAuthorized, store_stockInstance.sendStockValid(),
                                          store_stockInstance.validationError, store_stockInstance.sendStockController
                                       )

export default Store_StockRouter;
