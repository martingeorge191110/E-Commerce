import multer from "multer";
import fs from 'fs';
import path from "path";


/**
 * Function that store the files
 *       and also return the uploader
 */

const uploader = (dirName) => {
    const storage = multer.diskStorage({
      destination: async (req, file, cb) => {
        if (fs.existsSync(path.join(process.cwd(), dirName)))
          cb(null, dirName);
        else
          try {
            await fs.promises.mkdir(path.join(process.cwd(), dirName))
          } catch (err) {
            throw (err)
          }
          cb(null, dirName)
      },
      filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
      }
    });

   return (multer({storage, limits: {fileSize: 1024 * 1024 * 100}}))
}

export default uploader;
