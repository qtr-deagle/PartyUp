import {
  RekognitionClient,
  CompareFacesCommand,
  DetectFacesCommand,
} from "@aws-sdk/client-rekognition";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { drizzle } from "drizzle-orm/mysql2/http";

const rekognitionClient = new RekognitionClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

/**
 * Upload image buffer to S3 and return the key
 */
export const uploadImageToS3 = async (
  buffer: Buffer,
  fileName: string
): Promise<string> => {
  const key = `verifications/${Date.now()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
    Body: buffer,
    ContentType: "image/jpeg",
  });

  await s3Client.send(command);
  return key;
};

/**
 * Compare two faces from S3
 * Returns similarity score (0-100)
 */
export const compareFaces = async (
  selfieS3Key: string,
  idPhotoS3Key: string
): Promise<{
  matchScore: number;
  matchStatus: "high_confidence" | "manual_review" | "rejected";
  faceCount: { selfie: number; idPhoto: number };
  error?: string;
}> => {
  try {
    const command = new CompareFacesCommand({
      SourceImage: {
        S3Object: {
          Bucket: process.env.AWS_S3_BUCKET!,
          Name: selfieS3Key,
        },
      },
      TargetImage: {
        S3Object: {
          Bucket: process.env.AWS_S3_BUCKET!,
          Name: idPhotoS3Key,
        },
      },
      SimilarityThreshold: 70, // AWS will only return matches above 70%
    });

    const response = await rekognitionClient.send(command);

    // Get match score
    const matchScore = response.FaceMatches?.[0]?.Similarity || 0;

    // Determine match status
    let matchStatus: "high_confidence" | "manual_review" | "rejected";
    if (matchScore >= 90) {
      matchStatus = "high_confidence";
    } else if (matchScore >= 70) {
      matchStatus = "manual_review";
    } else {
      matchStatus = "rejected";
    }

    return {
      matchScore: Math.round(matchScore),
      matchStatus,
      faceCount: {
        selfie: response.SourceImageFace?.Confidence ? 1 : 0,
        idPhoto: response.TargetImageFaceMatches?.length || 0,
      },
    };
  } catch (error) {
    console.error("Rekognition comparison error:", error);
    return {
      matchScore: 0,
      matchStatus: "rejected",
      faceCount: { selfie: 0, idPhoto: 0 },
      error: String(error),
    };
  }
};

/**
 * Detect faces in an image
 * Used to validate that images have exactly one face
 */
export const detectFaces = async (
  s3Key: string
): Promise<{
  faceCount: number;
  validForVerification: boolean;
  confidence: number;
}> => {
  try {
    const command = new DetectFacesCommand({
      Image: {
        S3Object: {
          Bucket: process.env.AWS_S3_BUCKET!,
          Name: s3Key,
        },
      },
      Attributes: ["ALL"],
    });

    const response = await rekognitionClient.send(command);
    const faceCount = response.FaceDetails?.length || 0;
    const confidence = response.FaceDetails?.[0]?.Confidence || 0;

    return {
      faceCount,
      validForVerification: faceCount === 1 && confidence > 80,
      confidence,
    };
  } catch (error) {
    console.error("Face detection error:", error);
    return {
      faceCount: 0,
      validForVerification: false,
      confidence: 0,
    };
  }
};

/**
 * Generate S3 URL for a stored image
 */
export const getS3ImageUrl = (key: string): string => {
  return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
};
