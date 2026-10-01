import { formatLegalName, type IdVerificationRow } from '@/lib/verification';

// Shown next to the ID photos so staff can compare the name the user
// declared at sign-up with the one printed on the ID.
export default function LegalNameCheck({ profile }: { profile: IdVerificationRow['profiles'] }) {
  const legalName = formatLegalName(profile);

  if (!legalName) {
    return (
      <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
        <p className="text-xs font-semibold uppercase text-amber-800">Legal name not provided</p>
        <p className="mt-0.5 text-xs text-amber-700">
          This account predates the legal-name fields. Compare the ID against the display name above.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2">
      <p className="text-xs font-semibold uppercase text-muted-foreground">Legal name (should match the ID)</p>
      <p className="mt-0.5 font-mono text-base font-semibold text-foreground">{legalName}</p>
      {!profile?.middle_name && <p className="mt-0.5 text-xs text-muted-foreground">User declared no middle name.</p>}
    </div>
  );
}
