require("dotenv").config()

const https= require("https");
var cors = require('cors');
const fs= require("fs");
const path= require("path");
const express= require("express");
const app= express();
const mongoos=require("mongoose");
const aws =require('aws-sdk');
const { crypto, randomBytes } =require('crypto');

process.env.TZ = "Asia/Calcutta";
const region=process.env.region;
const bucketName=process.env.bucketName;
const accessKeyId=process.env.accessKeyId;
const secretAccessKey=process.env.secretAccessKey;

const s3= new  aws.S3 ({
    region,
    accessKeyId,
    secretAccessKey,
    signatureVersion:'v4',
})

mongoos.connect(process.env.DATABASE_URL)
const db= mongoos.connection
db.on('error',(error)=> console.error(error))
db.once('open',()=> console.log('Connected to Database!'))


app.use(express.json())
app.use(cors());

const userRouter= require("./routes/user_auth")
const branchOfficeRouter= require("./routes/brachoffice")
const servicesRouter= require("./routes/services")
const servicePackagesRouter= require("./routes/servicePackages")
const clientsRouter= require("./routes/clients")
const membershipsRouter= require("./routes/memberships")
const scheduleRouter= require("./routes/schedule")

app.use("/api/user",userRouter)
app.use("/api/branchs",branchOfficeRouter)
app.use("/api/services",servicesRouter)
app.use("/api/servicepackages",servicePackagesRouter)
app.use("/api/clients",clientsRouter)
app.use("/api/memberships",membershipsRouter)
app.use("/api/schedule",scheduleRouter)


// const sslServer=https.createServer(
//     {
//         key:fs.readFileSync(path.join(__dirname, 'cert','key.pem')),
//         cert:fs.readFileSync(path.join(__dirname, 'cert','cert.pem')),
//     },app
// )

// sslServer.listen(3443,()=> console.log("https Server is listning!"))

app.get('/s3url/:name',async (req,res)=>{
    console.log(req.params.name)
    const imagename=req.params.name
    
    const params=({
        Bucket:bucketName,
        Key:imagename,
        Expires:60,
    })
    const uploadUrl=await s3.getSignedUrlPromise('putObject',params)
    res.send({uploadUrl})
})
app.listen(6622,()=>{
    console.log("Http Server is listning!")
})