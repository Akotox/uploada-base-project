require("dotenv").config();
const express = require("express");
const multer = require("multer");
const { s3Uploadv2, s3Uploadv3, s3UploadAndDownload  } = require("./s3service");
const uuid = require("uuid").v4
const app = express();

//  single File
// const uploads = multer({dest: "uploads/"});
// app.post("/upload", uploads.single("file"),(req, res)=>{
//     res.json({status: "sucess"});
// });


// multiple files
// const uploads = multer({dest: "uploads/"});

// const multiUploads = uploads.fields([{name: "avatar", maxCount: 1}, {name: "resumee", maxCount: 1}])
// app.post("/upload", multiUploads,(req, res)=>{
//     res.json({status: "sucess"});
// });


// multiple files

//  const storage = multer.diskStorage({
//     destination: (req, file, cb)=>
//     {
//         cb(null, "uploads");
//     },
//     filename: (req, file, cb) => {
//         const { originalname } = file;
//         cb(null, `${uuid()}-${originalname}` )
//     } 
//  });

const storage = multer.memoryStorage()

 const fileFilter = (req, file, cb)=>{
    console.log(file)
    if(file.mimetype.split("/")[0] === 'image'){
        cb(null, true)
    }else{
        cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE'), false)
    }
 }

const uploads = multer({storage, fileFilter, limits: {fileSize: 2000000}});
app.post("/upload", uploads.array("file", 5), async (req, res)=>{
try {
    const results = await s3Uploadv2(req.files);
    console.log(results);

    
 res.json({status: "sucess", result: results});
} catch (err) {
    res.status(400).json({
        message: "re-upload the files"
    })
}

// app.post("/upload", uploads.array("file", 5), async (req, res)=>{
//     try {
//     const results = await s3Uploadv3(req.files);
//     console.log(results);
//  res.json({status: "sucess", result: results});
// } catch (err) {
//    console.log(err) 
// }
   
});

app.use((error, req, res, next) => {
    if(error instanceof multer.MulterError){
        if(error.code === "LIMIT_FILE_SIZE"){
            return res.status(400).json({
                message: "file too large"
            });
        }
        
        if(error.code === "LIMIT_FILE_COUNT"){
            return res.status(400).json({
                message: "file limit exceeded"
            });
        }

        if(error.code === "LIMIT_UNEXPECTED_FILE"){
            return res.status(400).json({
                message: "unexpected file must be an image"
            });
        }
    }
})

app.listen(4000, () => console.log("port 4000 alive") )