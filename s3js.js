const aws =require('aws-sdk');
const { crypto, randomBytes } =require('crypto');

const region="us-east-1";
const bucketName="pocsof-t1l";
const accessKeyId="AKIAZUTLRCYFQDSS4WIR";
const secretAccessKey="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";

const s3= new  aws.S3 ({
    region,
    accessKeyId,
    secretAccessKey,
    signatureVersion:'v4',
})

async function GenerateUploadUrl(){
    console.log("i am called")
    const rawBytes=await randomBytes(16)
    const imagename=rawBytes.toString('hex')
    
    const params=({
        Bucket:bucketName,
        Key:imagename,
        Expires:60,
    })
    const uploadUrl=await s3.getSignedUrlPromise('putObject',params)
    console.log(uploadUrl)
    return uploadUrl
}
module.exports= GenerateUploadUrl