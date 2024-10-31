import jwt from 'jsonwebtoken';
import ApiError from './errorHandler.js';


const verify_token = (req, res, next) => {
   const { authorization } = req.headers
   if (!authorization)
      return (ApiError.responseError(
         ApiError.createError(400, "Authorization Must be included in Header!"), req, res, next
      ))

   const token = authorization.split(' ')[1]
   if (!token)
      return (ApiError.responseError(
         ApiError.createError(400, "Token is not found in Header!"), req, res, next
      ))

   jwt.verify(token, process.env.JWT_KEY, (err, payload) => {
      if (err)
         return (ApiError.responseError(
            ApiError.createError(400, "Token is not valid!"), req, res, next
         ))
      /* Now user is object in req object holds {id, role (if the user is employee has access)} */
      req.user = payload
   })
   next()
}

export default verify_token;
