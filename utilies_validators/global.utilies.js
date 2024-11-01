import nodemailer from 'nodemailer'

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

   /* Send mail Via Gmail */
   sendMail = async (userEmail, subject, htmlCode) => {
      const transporter = nodemailer.createTransport({
         service: "gmail",
         auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS
         }
      })
   
      const mail = {
         from: process.env.GMAIL_USER,
         to: userEmail,
         subject: subject,
         html: htmlCode,
      }
   
      try {
         await transporter.sendMail(mail)
   
         return (true)
      } catch (err) {
         console.log(err)
         return (false)
      }
   }
}

export default GlobalUtilies;