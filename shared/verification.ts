/**
 * Verification Types - Used by both web and mobile
 */

export interface VerificationSubmitInput {
  selfieFile: Blob | File;  // Base64 or File object
  idPhotoFile?: Blob | File; // Optional: ID document photo
  idNumber: string;          // ID/Passport number
  dateOfBirth: string;       // YYYY-MM-DD
  name: string;              // User's full name (to validate against ID)
}

export interface VerificationResult {
  matchScore: number;        // 0-100 (facial recognition confidence)
  matchStatus: "high_confidence" | "manual_review" | "rejected";
  faceCount: {
    selfie: number;
    idPhoto: number;
  };
  error?: string;
}

export interface VerificationRecord {
  id: number;
  userId: number;
  idNumber: string;
  dateOfBirth: string;
  selfieUrl: string;
  idPhotoUrl?: string;
  facialMatchScore: number;
  facialMatchStatus: "high_confidence" | "manual_review" | "rejected";
  verificationStatus: "pending" | "approved" | "rejected";
  staffReviewedBy?: number;
  staffReviewNotes?: string;
  staffDecision?: "approved" | "rejected" | "needs_new_selfie";
  createdAt: Date;
  reviewedAt?: Date;
  expiresAt?: Date;
}

export interface StaffVerificationView {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  dateOfBirth: string;
  idNumber: string;
  selfieUrl: string;
  idPhotoUrl?: string;
  facialMatchScore: number;
  facialMatchStatus: "high_confidence" | "manual_review" | "rejected";
  systemFlags: {
    nameMatches: boolean;
    dobMatches: boolean;
    isDuplicate: boolean;
  };
  verificationStatus: "pending" | "approved" | "rejected";
  submittedAt: Date;
}

export interface StaffApprovalInput {
  verificationId: number;
  decision: "approved" | "rejected" | "needs_new_selfie";
  notes: string;
}

export interface AuditLogEntry {
  action: string;           // 'submitted', 'reviewed', 'approved', 'rejected'
  actor: string;           // user ID or "system"
  timestamp: Date;
  details: Record<string, unknown>;
}
