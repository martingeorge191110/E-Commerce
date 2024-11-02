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
                  include: {
                     role: true
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
}

export default Store_StockController;
