import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { REGION, VIDEO_STREAM_BUCKET } from "../constants.js";
import fs from "fs";
import path from "path";
import ffprobe from 'ffprobe-static';
import { execFile } from 'child_process';

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

const uploadFileToBucket = async (localFilePath, destination) => {
    if(!localFilePath) return null;

    const fileName = path.basename(localFilePath);
    const fileStream = fs.createReadStream(localFilePath);

    const command = new PutObjectCommand({
        Bucket: VIDEO_STREAM_BUCKET,
        Key: `${destination}/${fileName}`,
        Body: fileStream
    });

    try {
        const response = await s3.send(command);
        let duration = 0;
        if(destination === 'videos') duration = await getVideoDuration(localFilePath);
        response.url = fileName;
        response.duration = duration;
        fs.unlinkSync(localFilePath);
        return response;
    } catch (err) {
        fs.unlinkSync(localFilePath);
        console.error(err);
        return null;
    }
};

const getVideoDuration = async (videoPath) => {
  return new Promise((resolve, reject) => {
    execFile(ffprobe.path, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', videoPath], (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      const duration = parseFloat(stdout);
      resolve(duration);
    });
  });
}

const deleteBeforeUpload = async (key, destination) =>{
    if(!key) return null;

    const command = new DeleteObjectCommand({
        Bucket: VIDEO_STREAM_BUCKET,
        Key: `${destination}/${key}`,
    });

    try {
        const response = await s3.send(command);
        return true;
    } catch (err) {
        console.error(err);
        return null;
    }

}

export { uploadFileToBucket, deleteBeforeUpload };
