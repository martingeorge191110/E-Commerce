import {Server} from 'socket.io'



export const init_socket  = (server) => {
   const io = new Server(server, {
      cors: {
         origin: process.env.NODE_ENV === "development" ? "*" : null,
         credentials: true
      }
   })

   io.on("connection", (socket) => {
      console.log("connected!")

      socket.on("disconnect", () => {
         console.log("disconnected!")
      })
   })

   return (io)
}
