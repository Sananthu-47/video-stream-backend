import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { REGION, VIDEO_PROFILE_BUCKET } from "../constants.js";
const fs = require('fs');
const path = require('path');


// To generate the access token
//  aws sts assume-role --role-arn arn:aws:iam::313468171546:role/AccessTokenCreatorRole --role-session-name SESSION_NAME

const credentials = {
    accessKeyId: process.env.accessKeyId,
    secretAccessKey: process.env.secretAccessKey,
    sessionToken: process.env.sessionToken,
};

const s3 = new S3Client({
    region: REGION,
    credentials: credentials,
});

const uploadImageToBucket = async (localFilePath, destination) => {
    const fileName = path.basename(localFilePath);
    const fileStream = fs.createReadStream(localFilePath);

    const command = new PutObjectCommand({
      Bucket: VIDEO_PROFILE_BUCKET,
      Key: `${destination}/${fileName}`,
      Body: fileStream
    });
  
    try {
      const response = await s3.send(command);
      console.log(response);
      return response;
    } catch (err) {
      console.error(err);
    }
  };


export { uploadImageToBucket };
