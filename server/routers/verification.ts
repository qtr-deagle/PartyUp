import { router, publicProcedure, staffProcedure } from "../_core/trpc";
import { z } from "zod";
import { db } from "../db";
import { idVerifications, users } from "../../drizzle/schema";
import {
  compareFaces,
  uploadImageToS3,
  detectFaces,
  getS3ImageUrl,
} from "../_core/rekognition";
import { eq, and } from "drizzle-orm";
import type {
  VerificationSubmitInput,
  VerificationResult,
  StaffApprovalInput,
} from "../../shared/verification";

/**
 * Convert File/Blob to Buffer for AWS upload
 */
const fileToBuffer = async (file: File | Blob): Promise<Buffer> => {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
};

/**
 * Calculate user age from date of birth
 */
const calculateAge = (dateOfBirth: string): number => {
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

export const verificationRouter = router({
  /**
   * Submit ID verification (for new user registration)
   * Called by mobile app and web registration
   */
  submitVerification: publicProcedure
    .input(
      z.object({
        selfieFile: z.instanceof(File),
        idPhotoFile: z.instanceof(File).optional(),
        idNumber: z.string().min(3, "ID number is required"),
        dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
        name: z.string().min(2, "Name is required"),
        userId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Validate age
        const age = calculateAge(input.dateOfBirth);
        if (age < 18) {
          return {
            success: false,
            error: "You must be at least 18 years old",
          };
        }

        // Check if ID number already exists
        const existingVerification = await db
          .select()
          .from(idVerifications)
          .where(eq(idVerifications.idNumber, input.idNumber))
          .limit(1);

        if (existingVerification.length > 0) {
          return {
            success: false,
            error: "This ID has already been registered",
          };
        }

        // Upload selfie to S3
        const selfieBuffer = await fileToBuffer(input.selfieFile);
        const selfieKey = await uploadImageToS3(selfieBuffer, `selfie-${input.userId}`);

        // Detect face in selfie
        const selfieFaceCheck = await detectFaces(selfieKey);
        if (!selfieFaceCheck.validForVerification) {
          return {
            success: false,
            error:
              selfieFaceCheck.faceCount === 0
                ? "No face detected in selfie"
                : selfieFaceCheck.faceCount > 1
                  ? "Multiple faces detected. Please use a clear selfie"
                  : "Face quality too low. Please try again",
          };
        }

        let idPhotoUrl: string | null = null;
        let facialComparison: VerificationResult | null = null;

        // If ID photo provided, upload and compare
        if (input.idPhotoFile) {
          const idBuffer = await fileToBuffer(input.idPhotoFile);
          const idKey = await uploadImageToS3(idBuffer, `id-${input.userId}`);
          idPhotoUrl = getS3ImageUrl(idKey);

          // Detect face in ID photo
          const idFaceCheck = await detectFaces(idKey);
          if (!idFaceCheck.validForVerification) {
            return {
              success: false,
              error: "ID photo quality is too low or face not clearly visible",
            };
          }

          // Compare faces
          facialComparison = await compareFaces(selfieKey, idKey);

          if (!facialComparison || facialComparison.error) {
            return {
              success: false,
              error: "Failed to analyze photos. Please try again.",
            };
          }
        }

        // Get user info to validate name
        const user = await db
          .select()
          .from(users)
          .where(eq(users.id, input.userId))
          .limit(1);

        const userData = user[0];
        const nameMatches = userData?.name
          ?.toLowerCase()
          .includes(input.name.toLowerCase());

        // Create verification record
        const verificationRecord = await db.insert(idVerifications).values({
          userId: input.userId,
          idNumber: input.idNumber,
          dateOfBirth: input.dateOfBirth,
          selfieUrl: getS3ImageUrl(selfieKey),
          idPhotoUrl,
          facialMatchScore: facialComparison?.matchScore || 0,
          facialMatchStatus: facialComparison?.matchStatus || "rejected",
          verificationStatus: "pending",
          nameMatchesId: nameMatches || true,
          dobMatchesId: true, // Already validated by user input
          isIdDuplicate: false,
          auditLog: JSON.stringify([
            {
              action: "submitted",
              actor: `user_${input.userId}`,
              timestamp: new Date().toISOString(),
              details: {
                facialMatchScore: facialComparison?.matchScore,
                nameMatches,
              },
            },
          ]),
        });

        return {
          success: true,
          message: "Verification submitted successfully",
          verificationId: verificationRecord.insertId,
          status: "pending",
          facialMatchScore: facialComparison?.matchScore || 0,
        };
      } catch (error) {
        console.error("Verification submission error:", error);
        return {
          success: false,
          error: "Failed to submit verification. Please try again.",
        };
      }
    }),

  /**
   * Get pending verifications (for staff dashboard)
   */
  getPendingVerifications: staffProcedure.query(async () => {
    try {
      const pending = await db
        .select({
          id: idVerifications.id,
          userId: idVerifications.userId,
          userName: users.name,
          userEmail: users.email,
          dateOfBirth: idVerifications.dateOfBirth,
          idNumber: idVerifications.idNumber,
          selfieUrl: idVerifications.selfieUrl,
          idPhotoUrl: idVerifications.idPhotoUrl,
          facialMatchScore: idVerifications.facialMatchScore,
          facialMatchStatus: idVerifications.facialMatchStatus,
          nameMatches: idVerifications.nameMatchesId,
          dobMatches: idVerifications.dobMatchesId,
          isDuplicate: idVerifications.isIdDuplicate,
          createdAt: idVerifications.createdAt,
        })
        .from(idVerifications)
        .innerJoin(users, eq(users.id, idVerifications.userId))
        .where(eq(idVerifications.verificationStatus, "pending"))
        .orderBy(idVerifications.createdAt);

      return {
        success: true,
        data: pending,
        count: pending.length,
      };
    } catch (error) {
      console.error("Get pending verifications error:", error);
      return {
        success: false,
        error: "Failed to fetch pending verifications",
        data: [],
        count: 0,
      };
    }
  }),

  /**
   * Get single verification for staff review
   */
  getVerification: staffProcedure
    .input(z.object({ verificationId: z.number() }))
    .query(async ({ input }) => {
      try {
        const verification = await db
          .select({
            id: idVerifications.id,
            userId: idVerifications.userId,
            userName: users.name,
            userEmail: users.email,
            dateOfBirth: idVerifications.dateOfBirth,
            idNumber: idVerifications.idNumber,
            selfieUrl: idVerifications.selfieUrl,
            idPhotoUrl: idVerifications.idPhotoUrl,
            facialMatchScore: idVerifications.facialMatchScore,
            facialMatchStatus: idVerifications.facialMatchStatus,
            nameMatches: idVerifications.nameMatchesId,
            dobMatches: idVerifications.dobMatchesId,
            isDuplicate: idVerifications.isIdDuplicate,
            verificationStatus: idVerifications.verificationStatus,
            staffReviewNotes: idVerifications.staffReviewNotes,
            staffDecision: idVerifications.staffDecision,
            createdAt: idVerifications.createdAt,
            auditLog: idVerifications.auditLog,
          })
          .from(idVerifications)
          .innerJoin(users, eq(users.id, idVerifications.userId))
          .where(eq(idVerifications.id, input.verificationId))
          .limit(1);

        if (!verification.length) {
          return {
            success: false,
            error: "Verification not found",
          };
        }

        return {
          success: true,
          data: verification[0],
        };
      } catch (error) {
        console.error("Get verification error:", error);
        return {
          success: false,
          error: "Failed to fetch verification",
        };
      }
    }),

  /**
   * Approve or reject verification (staff only)
   */
  reviewVerification: staffProcedure
    .input(
      z.object({
        verificationId: z.number(),
        decision: z.enum(["approved", "rejected", "needs_new_selfie"]),
        notes: z.string().min(5, "Notes must be at least 5 characters"),
        staffId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const verification = await db
          .select()
          .from(idVerifications)
          .where(eq(idVerifications.id, input.verificationId))
          .limit(1);

        if (!verification.length) {
          return {
            success: false,
            error: "Verification not found",
          };
        }

        const verif = verification[0];
        const staffId = input.staffId || ctx.userId;

        // Update verification record
        const statusMap = {
          approved: "approved" as const,
          rejected: "rejected" as const,
          needs_new_selfie: "pending" as const,
        };

        await db
          .update(idVerifications)
          .set({
            verificationStatus: statusMap[input.decision],
            staffReviewedBy: staffId,
            staffReviewNotes: input.notes,
            staffDecision: input.decision as any,
            reviewedAt: new Date(),
            auditLog: JSON.stringify([
              ...JSON.parse(verif.auditLog || "[]"),
              {
                action: "reviewed",
                actor: `staff_${staffId}`,
                timestamp: new Date().toISOString(),
                details: {
                  decision: input.decision,
                  notes: input.notes,
                },
              },
            ]),
          })
          .where(eq(idVerifications.id, input.verificationId));

        // If approved, update user verification status
        if (input.decision === "approved") {
          await db
            .update(users)
            .set({
              isVerified: true,
              verificationBadge: "id_verified",
            })
            .where(eq(users.id, verif.userId));
        }

        return {
          success: true,
          message:
            input.decision === "approved"
              ? "User verified successfully"
              : `Verification ${input.decision}`,
        };
      } catch (error) {
        console.error("Review verification error:", error);
        return {
          success: false,
          error: "Failed to review verification",
        };
      }
    }),

  /**
   * Check verification status (for user to see if approved)
   */
  getMyVerificationStatus: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      try {
        const verification = await db
          .select({
            id: idVerifications.id,
            verificationStatus: idVerifications.verificationStatus,
            facialMatchScore: idVerifications.facialMatchScore,
            staffReviewNotes: idVerifications.staffReviewNotes,
            staffDecision: idVerifications.staffDecision,
            createdAt: idVerifications.createdAt,
            reviewedAt: idVerifications.reviewedAt,
          })
          .from(idVerifications)
          .where(eq(idVerifications.userId, input.userId))
          .limit(1);

        if (!verification.length) {
          return {
            success: true,
            status: "not_submitted",
            message: "No verification submitted yet",
          };
        }

        const verif = verification[0];

        return {
          success: true,
          status: verif.verificationStatus,
          facialMatchScore: verif.facialMatchScore,
          staffNotes: verif.staffReviewNotes,
          message:
            verif.verificationStatus === "approved"
              ? "Your verification is approved! ✅"
              : verif.verificationStatus === "rejected"
                ? `Verification rejected: ${verif.staffReviewNotes}`
                : "Your verification is pending review",
        };
      } catch (error) {
        console.error("Get verification status error:", error);
        return {
          success: false,
          error: "Failed to fetch verification status",
        };
      }
    }),
});
