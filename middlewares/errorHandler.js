
/**
 * Error handling class
 * 
 * this class for creating errors and response with errors for middleware hadnling
 */

class ApiError extends Error{
   constructor (statusCode, errors) {
      super()
      this.statusCode = statusCode
      this.errors = errors
      this.stack = process.env.NODE_ENV === "development" ? this.stack : null
      this.status = statusCode >= 400 && statusCode <= 500 ? "Failuire" : "Error"
   }

   /* Function to create errors */
   static createError (statusCode, errors) {
      return (new ApiError(statusCode, errors))
   }

   /* Function to catch errors */
   static catchError = (process) => {
      const message = `Something wnet wrong within ${process} process!`
      return (this.createError(500, message))
   }

   /* Function middleware for respond with errors */
   static responseError = (err, req, res, next) => {
      return (res.status(err.statusCode || 500).json({
         success: false,
         errors: err.errors,
         status: err.status,
         stack: err.stack
      }))
   }
}

export default ApiError;
