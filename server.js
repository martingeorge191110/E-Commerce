import http from 'http'
import express from 'express';
import dotenv from "dotenv"
import cors from "cors"
import morgan from "morgan";
import cookieParser from "cookie-parser";
import ApiError from './middlewares/errorHandler.js';
import AuthRouter from './routers/auth.router.js';

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

app.use("/api/auth", AuthRouter)


app.use("*", ApiError.responseError)
/* End of server Routers */

const server = http.createServer(app)
               .listen(env.PORT, () => {
                  console.log(`Server is Connected on http://${env.HOSTNAME}:${env.PORT}`)
               })
