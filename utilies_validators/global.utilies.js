

/**
 * Response Class
 */
class GlobalUtilies {

   /* function to response directly with json successfuly */
   responseJsonDone = (res, statusCode, message, data) => {
      const response = {
         success: true,
         message: message,
         data: data
      }

      return (res.status(statusCode).json(response))
   }

   /* Function to user select data */
   userSelectData = (selectedItems) => {
      const itemsSelected = {}
      if (!Array.isArray(selectedItems))
         return (null)

      selectedItems.forEach(element => {
         itemsSelected[`${element}`] = true
      });

      return (itemsSelected)
   }
}

export default GlobalUtilies;
