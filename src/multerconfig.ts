import multer, { FileFilterCallback }  from "multer";

const storage = multer.diskStorage({
    destination: (req: Express.Request , file: Express.Multer.File, callback) => {
      let dir;

      const mime = file.mimetype;
      if (mime.startsWith("video/")) { dir = "uploads/videos"; }
      else { dir = "uploads/pdf"; };

      callback(null, dir);
    },

    filename: (req: Express.Request , file: Express.Multer.File, callback) => {
      callback(null, Date.now() + "-" + file.originalname); // originalname = propriedade da classe "File" do Multer
    }
})

export const upload = multer({
  storage,
  fileFilter(req: Express.Request , file: Express.Multer.File, callback: FileFilterCallback): void {
    const allowedFileTypes = ["application/pdf", "video/mp4", "video/mpeg", "video/webm"];

    if (!allowedFileTypes.includes(file.mimetype)) { return callback(new Error("Unsuported file type"))}

    callback(null, true)
  }
});