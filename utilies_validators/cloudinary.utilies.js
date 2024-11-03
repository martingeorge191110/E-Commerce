import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'
import dotenv from 'dotenv'

dotenv.config()

cloudinary.config({
   cloud_name: process.env.CLOUDINARY_NAME,
   api_key: process.env.CLOUDINARY_API_KEY,
   api_secret: process.env.CLOUDINARY_API_SECRET
})



class CloudinaryUtilies {


   /* Function to upload employees avatars */
   static uploadAvatars = async (req, res, next) => {
      const avatar = req.file
      if (!avatar) {
         req.noAvatar = true
      }

      try {
         const data = await fs.promises.readFile(avatar.path);

         const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
               { resource_type: "image", folder: 'employees' },
               (error, result) => {
                  if (error)
                     if (error) return reject(error);
                     resolve (result);
               }
            );
            stream.end(data);
         })

         req.avatar_url = result.secure_url;

         await fs.promises.unlink(avatar.path)
         return (next())
      } catch (err) {
         req.cloudinaryError = err
         return (next())
      }
   }
}

export default CloudinaryUtilies;
