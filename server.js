import http from 'http'
import express from 'express';
import dotenv from "dotenv"
import cors from "cors"
import morgan from "morgan";
import cookieParser from "cookie-parser";
import ApiError from './middlewares/errorHandler.js';
import AuthRouter from './routers/auth.router.js';
import ProductsRouter from './routers/products.router.js';
import AccessRoleRouter from './routers/accessroles.router.js';
import Store_StockRouter from './routers/store_stock.router.js';
import EmployeesRouter from './routers/employees.router.js';

dotenv.config()

const env = process.env

const app = express()

app.use(morgan("tiny"))
app.use(cookieParser())
app.use(
   cors(
      {
         origin: env.NODE_ENV === "development" ? "*" : null
         ,credentials: true
      })
);
app.use(express.json({limit: '5gb'}))
app.use(express.urlencoded({
   limit: '5gb',
   'extended': true
}))


/* All Server Routers */

/* Auth Router for all people using comp web or system */
app.use("/api/auth", AuthRouter)

/* Access Roles Router */
app.use("/api/permission", AccessRoleRouter)

/* Products Managment Router */
app.use("/api/prdoucts", ProductsRouter)

/* Stores and Stock Managment Router */
app.use("/api/store", Store_StockRouter)

/* Employees Managment Router */
app.use("/api/employee", EmployeesRouter)

app.use("*", ApiError.responseError)
/* End of server Routers */

const server = http.createServer(app)
               .listen(env.PORT, () => {
                  console.log(`Server is Connected on http://${env.HOSTNAME}:${env.PORT}`)
               })
