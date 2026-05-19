import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Mail, Lock, User, Eye, EyeOff, Loader2, Calendar, FileText } from 'lucide-react';

/**
 * PartyUp Registration Page
 * 
 * Design: Minimalist Luxury (Matches Login)
 * - Three-step registration for better UX & data collection
 * - Step 1: Email & Password (credentials)
 * - Step 2: Name & Date of Birth & ID Verification (profile/safety)
 * - Step 3: Travel Interests (matching algorithm optimization)
 * - Date of birth for age verification (18+ only requirement)
 * - ID verification for safety and compliance
 * - Interests for data-driven matching and user tracking
 * - OAuth integration options
 */
export default function Register() {
  const [step, setStep] = useState<'credentials' | 'profile' | 'interests'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [idFile, setIdFile] = useState<File | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { register, oauthLogin } = useAuth();
  const [, setLocation] = useLocation();

  // Travel Interests for matching algorithm & data collection
  const availableInterests = [
    { id: 'backpacking', label: '🎒 Backpacking' },
    { id: 'luxury-travel', label: '✨ Luxury Travel' },
    { id: 'adventure', label: '🏔️ Adventure' },
    { id: 'culture', label: '🏛️ Cultural' },
    { id: 'beach', label: '🏖️ Beach' },
    { id: 'mountains', label: '⛰️ Hiking' },
    { id: 'city', label: '🏙️ City' },
    { id: 'food', label: '🍜 Food' },
    { id: 'nightlife', label: '🎉 Nightlife' },
    { id: 'photography', label: '📸 Photography' },
    { id: 'wellness', label: '🧘 Wellness' },
    { id: 'budget', label: '💰 Budget' },
  ];

  const toggleInterest = (interestId: string) => {
    setInterests((prev) =>
      prev.includes(interestId)
        ? prev.filter((id) => id !== interestId)
        : [...prev, interestId]
    );
  };

  // Step 1 validation: Email & Password
  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Email is required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setStep('profile');
    setError('');
  };

  // Calculate age from date of birth
  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Step 2 validation & move to Step 3
  const handleStep2Next = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name) {
      setError('Full name is required');
      return;
    }

    if (!dateOfBirth) {
      setError('Date of birth is required for age verification');
      return;
    }

    const age = calculateAge(dateOfBirth);
    if (age < 18) {
      setError('You must be at least 18 years old to join PartyUp');
      return;
    }

    if (!idNumber) {
      setError('ID number is required for verification');
      return;
    }

    setStep('interests');
    setError('');
  };

  // Step 3 submission with interests
  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (interests.length === 0) {
      setError('Please select at least one interest');
      return;
    }

    setIsLoading(true);

    try {
      // Pass interests to register function (backend will store them)
      await register(email, password, name, 'user', interests);
      setLocation('/');
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: string) => {
    setIsLoading(true);
    try {
      await oauthLogin(provider);
      // Route based on role
      const storedUser = localStorage.getItem('partyup_user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user?.role === 'admin') {
          setLocation('/admin/dashboard');
        } else if (user?.role === 'staff') {
          setLocation('/staff/dashboard');
        } else {
          setLocation('/');
        }
      }
    } catch (err) {
      setError(`${provider} login failed`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-background to-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-primary mb-1">Join PartyUp</h1>
          <p className="text-xs text-muted-foreground">
            {step === 'credentials'
              ? 'Create your account'
              : step === 'profile'
                ? 'Complete your profile (18+ required)'
                : 'Select your interests'}
          </p>
        </div>

        {/* Registration Card */}
        <div className="bg-card rounded-2xl shadow-elevation-3 p-8 space-y-6">
          {/* Step Indicator */}
          <div className="flex gap-2">
            <div className={`h-1 flex-1 rounded-full transition-smooth ${step === 'credentials' || step === 'profile' || step === 'interests' ? 'bg-primary' : 'bg-primary/30'}`}></div>
            <div className={`h-1 flex-1 rounded-full transition-smooth ${step === 'profile' || step === 'interests' ? 'bg-primary' : 'bg-primary/30'}`}></div>
            <div className={`h-1 flex-1 rounded-full transition-smooth ${step === 'interests' ? 'bg-primary' : 'bg-primary/30'}`}></div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* STEP 1: Email & Password */}
          {step === 'credentials' && (
            <form onSubmit={handleStep1Next} className="space-y-4">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-smooth"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">At least 8 characters</p>
              </div>

              {/* Confirm Password Input */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-smooth"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Next Button */}
              <button
                type="submit"
                className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium transition-smooth hover:shadow-lg"
              >
                Next →
              </button>
            </form>
          )}

          {/* STEP 2: Name & Date of Birth */}
          {step === 'profile' && (
            <form onSubmit={handleStep2Next} className="space-y-4">
              {/* Name Input */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-10 pr-4 py-3 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
                    required
                  />
                </div>
              </div>

              {/* Date of Birth Input */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Date of Birth (Must be 18+)
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">⚠️ PartyUp is 18+ only. Age will be verified.</p>
              </div>

              {/* ID Number Input */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Government ID Number
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value.toUpperCase())}
                    placeholder="Passport, License, or ID Number"
                    className="w-full pl-10 pr-4 py-3 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Required for identity verification and safety compliance</p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setStep('credentials');
                    setError('');
                  }}
                  className="flex-1 py-3 bg-secondary text-foreground rounded-lg font-medium transition-smooth hover:bg-secondary/80"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-primary text-primary-foreground rounded-lg font-medium transition-smooth hover:shadow-lg"
                >
                  Next →
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Travel Interests */}
          {step === 'interests' && (
            <form onSubmit={handleStep3Submit} className="space-y-4">
              {/* Interests Grid */}
              <div className="grid grid-cols-2 gap-3">
                {availableInterests.map((interest) => (
                  <button
                    key={interest.id}
                    type="button"
                    onClick={() => toggleInterest(interest.id)}
                    className={`p-3 rounded-lg border-2 transition-smooth text-sm font-medium flex flex-col items-center gap-1.5 ${
                      interests.includes(interest.id)
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-secondary hover:border-primary/50'
                    }`}
                  >
                    <span className="text-lg">{interest.label.split(' ')[0]}</span>
                    <span className="text-xs">{interest.label.split(' ').slice(1).join(' ')}</span>
                  </button>
                ))}
              </div>

              {/* Selected Count */}
              {interests.length > 0 && (
                <p className="text-xs text-center text-muted-foreground">
                  {interests.length} interest{interests.length !== 1 ? 's' : ''} selected
                </p>
              )}

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setStep('profile');
                    setError('');
                  }}
                  className="flex-1 py-3 bg-secondary text-foreground rounded-lg font-medium transition-smooth hover:bg-secondary/80"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading || interests.length === 0}
                  className="flex-1 py-3 bg-primary text-primary-foreground rounded-lg font-medium transition-smooth hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                  {isLoading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          )}

          {/* Divider (Step 1 only) */}
          {step === 'credentials' && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
                </div>
              </div>

              {/* OAuth Options */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleOAuthLogin('google')}
                  disabled={isLoading}
                  className="py-3 px-4 bg-secondary rounded-lg border border-border hover:bg-secondary/80 transition-smooth disabled:opacity-50 flex items-center justify-center gap-2 font-medium text-sm"
                >
                  <span>🔵</span> Google
                </button>
                <button
                  onClick={() => handleOAuthLogin('github')}
                  disabled={isLoading}
                  className="py-3 px-4 bg-secondary rounded-lg border border-border hover:bg-secondary/80 transition-smooth disabled:opacity-50 flex items-center justify-center gap-2 font-medium text-sm"
                >
                  <span>⚫</span> GitHub
                </button>
              </div>

              {/* Sign In Link */}
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <a href="/login" className="text-primary font-medium hover:underline">
                  Sign in
                </a>
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
