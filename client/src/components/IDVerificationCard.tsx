import { useState } from 'react';
import { CheckCircle, AlertCircle, Clock, Upload, RotateCcw } from 'lucide-react';
import { IDVerificationModal } from './IDVerificationModal';

export interface IDVerificationStatus {
  status: 'unverified' | 'pending' | 'approved' | 'rejected';
  submittedAt?: string;
  rejectionReason?: string;
  similarity?: number;
}

interface IDVerificationCardProps {
  verification: IDVerificationStatus;
  onSubmit: (data: { idImage: File; selfieImage: File }) => Promise<void>;
}

export function IDVerificationCard({ verification, onSubmit }: IDVerificationCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getStatusBadge = () => {
    switch (verification.status) {
      case 'approved':
        return {
          icon: <CheckCircle className="w-5 h-5" />,
          label: 'Verified',
          color: 'bg-green-50 border-green-200',
          textColor: 'text-green-700',
          badgeColor: 'bg-green-100 text-green-800'
        };
      case 'pending':
        return {
          icon: <Clock className="w-5 h-5" />,
          label: 'Verification Pending',
          color: 'bg-yellow-50 border-yellow-200',
          textColor: 'text-yellow-700',
          badgeColor: 'bg-yellow-100 text-yellow-800'
        };
      case 'rejected':
        return {
          icon: <AlertCircle className="w-5 h-5" />,
          label: 'Verification Failed',
          color: 'bg-red-50 border-red-200',
          textColor: 'text-red-700',
          badgeColor: 'bg-red-100 text-red-800'
        };
      default:
        return {
          icon: <Upload className="w-5 h-5" />,
          label: 'Not Verified',
          color: 'bg-gray-50 border-gray-200',
          textColor: 'text-gray-700',
          badgeColor: 'bg-gray-100 text-gray-800'
        };
    }
  };

  const badge = getStatusBadge();

  const handleSubmit = async (data: { idImage: File; selfieImage: File }) => {
    try {
      setIsLoading(true);
      await onSubmit(data);
      setShowModal(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className={`border rounded-lg p-4 ${badge.color}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`${badge.textColor}`}>{badge.icon}</div>
            <div>
              <p className="font-semibold text-gray-900">ID Verification</p>
              <p className={`text-sm ${badge.textColor}`}>{badge.label}</p>
              {verification.status === 'pending' && verification.submittedAt && (
                <p className="text-xs text-gray-600 mt-1">
                  Submitted {new Date(verification.submittedAt).toLocaleDateString()}
                </p>
              )}
              {verification.status === 'rejected' && verification.rejectionReason && (
                <p className="text-xs text-red-600 mt-1">
                  Reason: {verification.rejectionReason}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {verification.status === 'rejected' && (
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Retry
              </button>
            )}
            {verification.status === 'unverified' && (
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
              >
                <Upload className="w-4 h-4" />
                Verify Now
              </button>
            )}
          </div>
        </div>

        {verification.status === 'approved' && (
          <div className="mt-3 p-2 bg-green-100 rounded text-sm text-green-700">
            ✓ Your identity is verified. You can now create and join trips!
          </div>
        )}

        {verification.status === 'pending' && (
          <div className="mt-3 p-2 bg-yellow-100 rounded text-sm text-yellow-700">
            ⏳ Your verification is under review. This usually takes 1-2 hours.
          </div>
        )}

        {verification.status === 'unverified' && (
          <div className="mt-3 p-2 bg-gray-100 rounded text-sm text-gray-700">
            ℹ️ Verify your identity to create and join trips. It takes less than 2 minutes.
          </div>
        )}
      </div>

      <IDVerificationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </>
  );
}
