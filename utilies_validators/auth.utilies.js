import bcrypt from 'bcrypt'
import GlobalUtilies from "./global.utilies.js";
import jwt from 'jsonwebtoken'


class AuthUtilies extends GlobalUtilies {

   /* Function that return hashed password */
   hashingPassword = (password) => {
      return (bcrypt.hashSync(password, 10))
   }

   /* Function that creating token based on role*/
   createToken = (role, id) => {
      let signObject = {id: id}

      if (role) {
         signObject.role = role
      }
      const token = jwt.sign(signObject, process.env.JWT_KEY, {
         expiresIn: process.env.JWT_EXP
      })

      return (token)
   }

   /* Function to set new Cookie */
   setNewCookie = (res, token) => {
      const age = 1000 * 60 * 60 * 24 * 3;

      res.cookie("token", token, {
         httpOnly: false,
         secure: process.env.NODE_ENV === "production",
         maxAge: age
      })
   }

   /* Function to comparing pass with hashed one */
   comparingPasswords = (password, hashedPass) => {
      return (bcrypt.compareSync(password, hashedPass))
   }
}

export default AuthUtilies;
