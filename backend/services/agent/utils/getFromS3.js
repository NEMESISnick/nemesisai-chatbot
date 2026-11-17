import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { s3 } from "../config/s3.js"
import { GetObjectCommand } from "@aws-sdk/client-s3"

export const DEFAULT_S3_URL_EXPIRY_SECONDS = 60 * 60 * 24

export const getFromS3 = async (filename, expiresIn = DEFAULT_S3_URL_EXPIRY_SECONDS) => {
    return await getSignedUrl(
        s3,
        new GetObjectCommand({
            Key: filename,
            Bucket: process.env.AWS_BUCKET,
        }),
        { expiresIn }
    )
}