import { useState, useRef } from 'react';
import { X, Camera, Upload, AlertCircle } from 'lucide-react';

interface IDVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { idImage: File; selfieImage: File }) => Promise<void>;
  isLoading: boolean;
}

export function IDVerificationModal({ isOpen, onClose, onSubmit, isLoading }: IDVerificationModalProps) {
  const [step, setStep] = useState<'select' | 'id' | 'selfie' | 'review'>('select');
  const [idImage, setIdImage] = useState<File | null>(null);
  const [selfieImage, setSelfieImage] = useState<File | null>(null);
  const [idPreview, setIdPreview] = useState<string>('');
  const [selfiePreview, setSelfiePreview] = useState<string>('');
  const [error, setError] = useState<string>('');
  const idInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'id' | 'selfie'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      if (type === 'id') {
        setIdImage(file);
        setIdPreview(preview);
      } else {
        setSelfieImage(file);
        setSelfiePreview(preview);
      }
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!idImage || !selfieImage) {
      setError('Please provide both ID and selfie');
      return;
    }

    try {
      await onSubmit({ idImage, selfieImage });
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    }
  };

  const handleClose = () => {
    setStep('select');
    setIdImage(null);
    setSelfieImage(null);
    setIdPreview('');
    setSelfiePreview('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <h2 className="text-lg font-semibold">Verify Your Identity</h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Step Indicator */}
          <div className="flex gap-2 mb-6">
            {(['id', 'selfie', 'review'] as const).map((s, idx) => (
              <div key={s} className="flex-1">
                <div
                  className={`h-1 rounded-full transition-colors ${
                    step === s ? 'bg-blue-600' : 
                    (step === 'review' && s !== 'review') || 
                    (s === 'selfie' && idImage) ||
                    (s === 'review' && idImage && selfieImage)
                      ? 'bg-green-500' 
                      : 'bg-gray-200'
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Select Method */}
          {step === 'select' && (
            <div className="space-y-4">
              <p className="text-gray-700 text-center mb-4">
                Upload a clear photo of your ID and a recent selfie for verification.
              </p>
              <button
                onClick={() => setStep('id')}
                className="w-full p-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Upload className="w-5 h-5" />
                Upload ID Photo
              </button>
            </div>
          )}

          {/* ID Upload */}
          {step === 'id' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 text-center">
                Upload a clear, well-lit photo of your government-issued ID.
              </p>
              <div className="space-y-3">
                <div
                  onClick={() => idInputRef.current?.click()}
                  className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center cursor-pointer hover:bg-blue-50 transition-colors"
                >
                  {idPreview ? (
                    <img src={idPreview} alt="ID Preview" className="w-full h-auto rounded" />
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-center">
                        <Upload className="w-8 h-8 text-blue-500" />
                      </div>
                      <p className="text-sm font-medium text-gray-700">Click to upload ID photo</p>
                      <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                    </div>
                  )}
                </div>
                <input
                  ref={idInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageSelect(e, 'id')}
                  className="hidden"
                />
                {idImage && (
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    ✓ {idImage.name}
                  </p>
                )}
              </div>
              <button
                onClick={() => setStep('selfie')}
                disabled={!idImage}
                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
              >
                Next: Add Selfie
              </button>
            </div>
          )}

          {/* Selfie Upload */}
          {step === 'selfie' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 text-center">
                Take a clear selfie with good lighting. Make sure your face is clearly visible.
              </p>
              <div className="space-y-3">
                <div
                  onClick={() => selfieInputRef.current?.click()}
                  className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center cursor-pointer hover:bg-blue-50 transition-colors"
                >
                  {selfiePreview ? (
                    <img src={selfiePreview} alt="Selfie Preview" className="w-full h-auto rounded" />
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-center">
                        <Camera className="w-8 h-8 text-blue-500" />
                      </div>
                      <p className="text-sm font-medium text-gray-700">Click to upload selfie</p>
                      <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                    </div>
                  )}
                </div>
                <input
                  ref={selfieInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageSelect(e, 'selfie')}
                  className="hidden"
                />
                {selfieImage && (
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    ✓ {selfieImage.name}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setStep('id')}
                  className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep('review')}
                  disabled={!selfieImage}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  Review
                </button>
              </div>
            </div>
          )}

          {/* Review */}
          {step === 'review' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 text-center">
                Review your documents before submitting for verification.
              </p>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">ID Photo</p>
                  <img src={idPreview} alt="ID" className="w-full h-auto rounded border border-gray-200" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Selfie</p>
                  <img src={selfiePreview} alt="Selfie" className="w-full h-auto rounded border border-gray-200" />
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2 text-sm text-blue-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p>Your documents will be processed securely and deleted after verification.</p>
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2 text-sm text-red-700">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => setStep('selfie')}
                  disabled={isLoading}
                  className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium transition-colors"
                >
                  {isLoading ? 'Verifying...' : 'Submit for Verification'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
