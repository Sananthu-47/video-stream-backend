import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { REGION, VIDEO_PROFILE_BUCKET } from "../constants.js";
import fs from "fs";
import path from "path";

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
    if(!localFilePath) return null;

    const fileName = path.basename(localFilePath);
    const fileStream = fs.createReadStream(localFilePath);

    const command = new PutObjectCommand({
        Bucket: VIDEO_PROFILE_BUCKET,
        Key: `${destination}/${fileName}`,
        Body: fileStream
    });

    try {
        const response = await s3.send(command);
        response.url = fileName;
        fs.unlinkSync(localFilePath);
        return response;
    } catch (err) {
        fs.unlinkSync(localFilePath);
        console.error(err);
        return null;
    }
};

export { uploadImageToBucket };
