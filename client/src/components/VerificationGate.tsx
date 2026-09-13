import { useState } from 'react';
import { AlertCircle, Lock } from 'lucide-react';
import { IDVerificationCard, IDVerificationStatus } from '../components/IDVerificationCard';

interface VerificationGateProps {
  status: IDVerificationStatus;
  action: 'create-trip' | 'join-trip';
  onVerify?: () => void;
}

export function VerificationGate({ status, action, onVerify }: VerificationGateProps) {
  if (status.status === 'approved') {
    return null;
  }

  const isBlocked = status.status !== 'approved';
  const actionText = action === 'create-trip' ? 'create a trip' : 'join a trip';

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
      <Lock className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="font-medium text-orange-900">
          Verification Required
        </p>
        <p className="text-sm text-orange-800 mt-1">
          {status.status === 'pending'
            ? `Your identity verification is pending. Once approved, you'll be able to ${actionText}.`
            : `Complete your identity verification to ${actionText}. It takes less than 2 minutes.`}
        </p>
        {status.status === 'rejected' && (
          <p className="text-sm text-red-700 mt-1">
            Your previous verification was rejected. Please try again with clearer images.
          </p>
        )}
        {isBlocked && onVerify && (
          <button
            onClick={onVerify}
            className="mt-3 text-sm font-medium text-orange-700 hover:text-orange-900 underline"
          >
            Verify your identity now →
          </button>
        )}
      </div>
    </div>
  );
}

// Example usage in a trip creation or joining flow
export function TripActionWithVerificationGate() {
  const [verificationStatus, setVerificationStatus] = useState<IDVerificationStatus>({
    status: 'unverified'
  });

  const [showVerificationModal, setShowVerificationModal] = useState(false);

  const handleVerify = async (data: { idImage: File; selfieImage: File }) => {
    // Send to backend API
    console.log('Submitting verification:', data);
    
    // Simulate API call
    setVerificationStatus({
      status: 'pending',
      submittedAt: new Date().toISOString()
    });
  };

  const canCreateTrip = verificationStatus.status === 'approved';

  return (
    <div className="space-y-6">
      {/* Verification Status Card - show on profile and trip pages */}
      <IDVerificationCard
        verification={verificationStatus}
        onSubmit={handleVerify}
      />

      {/* Gate for Trip Creation */}
      {!canCreateTrip && (
        <VerificationGate
          status={verificationStatus}
          action="create-trip"
          onVerify={() => setShowVerificationModal(true)}
        />
      )}

      {/* Create Trip Button */}
      <button
        disabled={!canCreateTrip}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
          canCreateTrip
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
        }`}
      >
        {canCreateTrip ? 'Create a Trip' : 'Complete verification to create trips'}
      </button>
    </div>
  );
}
