import { Prisma } from "@prisma/client";
import ApiError from "../middlewares/errorHandler.js";
import PrismaObject from "../prisma/prisma.js";
import Store_StockValidator from "../utilies_validators/store_stock.validator.js";


/**
 * Store and Stock Managment class controller
 */
class Store_StockController extends Store_StockValidator{

   /**
    * Controller to add new store information
    * 
    * Description: (body must contains (name location), (manager id from employee table not access role))
    *             [1] --> after validation, create new store inf, then response
    */
   addStoreInfController = async (req, res, next) => {
      const body = req.body

      try {
         const store = await PrismaObject.stores.create({
            data: body,
            select: {
               manager: true
            }
         })

         return (this.responseJsonDone(res, 201, "New store information has been added to data base!", store))
      } catch (err) {
         return (next(ApiError.createError(500, "Server error during add store infromation")))
      } 
   }

   /**
    * Controller to get all stores information
    * 
    * Description:
    *             [1] --> after validation, check whether user search about one ore many stores
    *             [2] --> search query about desired stores, then resposne
    */
   getStoreInfController = async (req, res, next) => {
      const {store_id} = req.query
      const searchCondition = {}

      if (!req.user.role)
         return (next(ApiError.createError(403, "You are not authorized to do that!")))

      try {
         if (store_id)
            searchCondition.where = {
                  id: store_id
            }

         const store = await PrismaObject.stores.findMany({
            ...searchCondition,
            include: {
               manager: {
                  select: {
                     first_name: true, last_name: true, email: true, phone: true, position: true,
                     hire_date: true, current_rate: true,
                     role: {
                        select: {
                           id: true, role: true, description: true, created_at: true
                        }
                     }
                  }
               }, employees: {
                  include: {
                     role: {
                        select: {
                           id: true, role: true, description: true, created_at: true
                        }
                     }
                  }
               }
            }
         })

         return (this.responseJsonDone(res, 200, "sotres inf retrieved successfuly", store))
      } catch (err) {
         return (next(ApiError.createError(500, "Server error during retrieve stores inf")))
      }
   }

   /**
    * Controller to Update store information
    * 
    * Description: (body may contains (name location), (manager id from employee table not access role))
    *             [1] --> after validation, update store inf, then response
    */
   updateStoreInfController = async (req, res, next) => {
      const {name, location} = req.body
      const store = req.store
      const updateObject = {}
      const manager = req.newManager

      try {
         if (manager)
            updateObject.data = {...updateObject.data, manager_id: manager.id}
         if (name)
            updateObject.data = {...updateObject.data, name: name}
         if (location)
            updateObject.data = {...updateObject.data, location: location}

         const updateStore = await PrismaObject.stores.update({
            where: {id: store.id},
            ...updateObject
         })

         return (this.responseJsonDone(res, 200, "Updated successfuly", updateStore))
      } catch (err) {
         return (next(ApiError.createError(500, "Server error during the operation")))
      }
   }

   /**
    * Controller to Delete Store from records(Auth who has the access)
    * 
    * Description:
    *             [1] --> get store id and remove it from the DB
    */
   deleteStoreController = async (req, res, next) => {
      const store = req.store

      try {
         await PrismaObject.stores.delete({
            where: {id: store.id}
         })

         return (this.responseJsonDone(res, 200, "Store has been deleted from the records", null))
      } catch (err) {
         return (next(ApiError.createError(500, "Server error during the operation!")))
      }
   }

   /**
    * Controller to shipping new stock
    * 
    * Description:
    *             [1] --> after validation check whether the stock is exist or not
    *             [2] --> updated or create a new stock based on the condition, then resposne
    */
   shippingStockController = async (req, res, next) => {
      const store = req.store
      const product = req.product
      const {quantity} = req.body
      let stock;

      try {
         stock = await PrismaObject.stock.findUnique({
            where: {store_id_product_id: {
               store_id: store.id,
               product_id: product.id
            }}
         })
         if (stock)
            stock = await PrismaObject.stock.update({
               where: {
                  store_id_product_id: {
                     store_id: store.id, product_id: product.id
                  }
               }, data: {
                  quantity: {
                     increment: quantity
                  }
               }
            })
         else
            stock = await PrismaObject.stock.create({
               data: {
                  store_id: store.id, product_id: product.id, quantity
               }, include: {
                  product: true,
                  store: true
               }
            })

         return (this.responseJsonDone(res, 200, "New stock has been created!", stock))
      } catch (err) {
         return (next(ApiError.createError(500, "Server error during adding the stock!")))
      }
   }

   /**
    * 
    */
   sendStockController = async (req, res, next) => {
      const home = req.homeStore
      const receiver = req.receiverStore
      const stock = req.stock
      const product_id = req.product_id
      const {quantity} = req.body
      let stockToAnother

      try {
         stockToAnother = await PrismaObject.stock.findUnique({
            where: {
               store_id_product_id: {
                  store_id: receiver.id, product_id
               }
            }
         })
         if (stockToAnother) {
            stockToAnother = await PrismaObject.stock.update({
               where: {
                  store_id_product_id: {
                     store_id: receiver.id, product_id: product_id
                  }
               }, data: {
                  quantity: {
                     increment: quantity
                  }
               }, include: {
                  product: true, store: true
               }
            })
         } else {
            stockToAnother = await PrismaObject.stock.create({
               data: {
                  store_id: receiver.id, product_id, quantity
               }, include: {
                  product: true,
                  store: true
               }
            })
         }
         await PrismaObject.stock.update({
            where: {
               store_id_product_id: {
                  store_id: home.id, product_id
               }
            }, data: {
               quantity: {decrement: quantity}
            }
         })

         return (this.responseJsonDone(res, 200, "Data has been recorded successfuly!", stockToAnother))
      } catch (err) {
         console.log(err)
         return (next(ApiError.createError(500, "Server error during sending stock")))
      }
   }

   /**
    * Controller to search about 
    */
}

export default Store_StockController;
