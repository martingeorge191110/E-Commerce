
/**
 * Error handling class
 * 
 * this class for creating errors and response with errors for middleware hadnling
 */

class ApiError extends Error{
   constructor (statusCode, message) {
      super(message)
      this.statusCode = statusCode
      this.stack = process.env.NODE_ENV === "development" ? this.stack : null
      this.status = statusCode >= 400 && statusCode <= 500 ? "Failuire" : "Error"
   }

   /* Function to create errors */
   createError (statusCode, message) {
      return (new ErrorHandling(statusCode, message))
   }

   /* Function to catch errors */
   catchError = (process) => {
      const message = `Something wnet wrong within ${process} process!`
      return (this.createError(500, message))
   }

   /* Function middleware for respond with errors */
   static responseError = (err, req, res, next) => {
      return (res.status(err.statusCode).json({
         success: false,
         message: err.message,
         status: err.status,
         stack: err.stack
      }))
   }
}

export default ApiError;
