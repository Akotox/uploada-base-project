const { S3 } = require('aws-sdk');
const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3")
const uuid = require("uuid").v4

exports.s3Uploadv2 = async(files) => {
    const s3 = new S3()

const params = files.map(file => {
    return {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key:`uploads/${uuid()}-${file.originalname}`,
        Body: file.buffer,
    };
})

const results = await Promise.all(params.map(param => s3.upload(param).promise())
);
const keys = results.map(result => `https://d147iw517iasqk.cloudfront.net/${result.Key}`);
return keys;
}


exports.s3Uploadv3 = async(files) => {
    const s3Client = new S3Client()

    const params = files.map(file => {
        return {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key:`uploads/${uuid()}-${file.originalname}`,
            Body: file.buffer,
        };
    });
    
    const results =
    await Promise.all(params.map(param => s3Client.send(new PutObjectCommand(param))));

    return results
}

