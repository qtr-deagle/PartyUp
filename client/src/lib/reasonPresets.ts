// Quick reasons for staff decisions: short chip labels, full sentences sent.
// Rendered by components/ReasonChips.tsx (via ConfirmActionDialog's
// notes.presets). The mobile app keeps a copy of idReject and vehicleReject
// in partyup-mobile/lib/reasonPresets.ts — keep the wording in sync.

export type ReasonPreset = { label: string; text: string };

export type ReasonValue = { selected: number[]; details: string };

export const EMPTY_REASON: ReasonValue = { selected: [], details: '' };

/** Picked sentences in click order, then the typed details. */
export function composeReason(presets: ReasonPreset[] | undefined, value: ReasonValue) {
  const parts = value.selected.map((index) => presets?.[index]?.text).filter(Boolean) as string[];
  const details = value.details.trim();
  if (details) parts.push(details);
  return parts.join(' ');
}

export const REASON_PRESETS = {
  idReject: [
    { label: 'Blurry photo', text: 'The ID photo is blurry or hard to read.' },
    { label: 'Face mismatch', text: "Your selfie doesn't match the photo on your ID." },
    { label: 'Expired / invalid ID', text: 'The ID is expired or not an accepted government ID.' },
    { label: 'Face or ID covered', text: 'Your face or part of the ID is covered or cut off.' },
    { label: 'Name mismatch', text: "The name on your ID doesn't match your profile name." },
    { label: 'Not from Bulacan', text: "Your ID address isn't in Bulacan. PartyUp is for Bulacan residents only." },
  ],
  vehicleReject: [
    { label: 'Poor image quality', text: 'The vehicle photos are blurry or too dark.' },
    { label: "Photos don't match", text: "The photos don't match the vehicle details you entered." },
    { label: 'Plate / OR-CR unreadable', text: "The plate number or OR/CR can't be read." },
    { label: 'Looks suspicious', text: 'The vehicle or documents look altered or suspicious.' },
    { label: 'Owner authorization', text: "The owner's authorization is missing or invalid." },
    { label: 'Registration date wrong', text: "The registration date you entered doesn't match your OR/CR." },
    { label: 'Registration expired', text: 'The OR/CR registration has expired. Please renew it first.' },
  ],
  licenseReject: [
    { label: "QR doesn't match", text: "The license QR code doesn't match the license photo." },
    { label: 'Expired license', text: "The driver's license is expired." },
    { label: 'Blurry photo', text: 'The license photo is blurry or hard to read.' },
    { label: 'Name mismatch', text: "The name on the license doesn't match your profile." },
    { label: 'Student permit', text: 'Student permits are not accepted. Please upload a full license.' },
  ],
  leaderDecline: [
    { label: 'Needs more trips', text: 'You need a few more completed trips before leading a guild.' },
    { label: 'Pitch too short', text: 'Your pitch needs more detail about how you will run the guild.' },
    { label: 'Name not allowed', text: 'The guild name is taken or not allowed. Please choose another.' },
    { label: 'Recent reports', text: 'Your account has recent reports that need to be cleared first.' },
    { label: 'Too many guilds', text: "We're not opening new guilds in your area right now." },
  ],
  leaderApprove: [
    { label: 'Welcome', text: 'Welcome aboard, Guild Leader!' },
    { label: 'Read the guide', text: 'Please read the Guild Leader guide in the app before inviting members.' },
    { label: 'Keep it safe', text: 'Keep your guild friendly and report anything unsafe to the PartyUp team.' },
  ],
  redemptionDecline: [
    { label: 'Out of stock', text: 'This reward is out of stock right now.' },
    { label: 'Not eligible', text: "Your account isn't eligible for this reward yet." },
    { label: 'Duplicate request', text: 'This looks like a duplicate of an earlier request.' },
    { label: 'Suspicious activity', text: 'We noticed unusual activity on the points used for this reward.' },
  ],
  redemptionFulfil: [
    { label: 'Sent by email', text: 'Your reward was sent to your email.' },
    { label: 'Ready for pickup', text: 'Your reward is ready for pickup. We will message you the details.' },
    { label: 'Applied to account', text: 'Your reward has been applied to your account.' },
  ],
  pointsAdjust: [
    { label: 'Event bonus', text: 'Event bonus' },
    { label: 'Correction', text: 'Correction of a points error' },
    { label: 'Bug compensation', text: 'Compensation for an app issue' },
    { label: 'Rule violation', text: 'Penalty for breaking guild rules' },
  ],
  reportResolve: [
    { label: 'Warning issued', text: 'We reviewed the report and gave the user a warning.' },
    { label: 'Account suspended', text: 'We reviewed the report and suspended the account.' },
    { label: 'Content removed', text: 'We removed the content you reported.' },
    { label: 'Settled with both', text: 'We talked to both sides and settled the issue.' },
  ],
  reportDismiss: [
    { label: 'Not enough evidence', text: "We couldn't find enough evidence to take action." },
    { label: 'No rule broken', text: "After review, this doesn't break PartyUp's community rules." },
    { label: 'Duplicate', text: 'This was already handled in an earlier report.' },
    { label: 'Already resolved', text: 'This issue was already resolved.' },
  ],
  paymentResolve: [
    { label: 'Refunded', text: 'The payment was refunded.' },
    { label: 'Paid confirmed', text: 'We confirmed the payment went through.' },
    { label: 'Settled with both', text: 'We talked to the driver and rider and settled the payment.' },
    { label: 'No issue found', text: "We checked the payment records and couldn't find a problem." },
  ],
  paymentSettle: [
    { label: 'Seen in PayMongo', text: 'Seen as paid in the PayMongo dashboard.' },
    { label: 'Webhook delayed', text: "PayMongo confirmed it, but the app update was delayed." },
    { label: 'Receipt checked', text: "Checked the rider's PayMongo receipt." },
  ],
  paymentCancel: [
    { label: 'Checkout abandoned', text: 'Rider abandoned the checkout.' },
    { label: 'Duplicate payment', text: 'Duplicate payment request.' },
    { label: 'Trip cancelled', text: 'The trip was cancelled.' },
    { label: 'Rider left trip', text: 'The rider left the trip before paying.' },
  ],
  sosResolve: [
    { label: 'False alarm', text: 'False alarm, confirmed with the traveler.' },
    { label: 'Safe by phone', text: 'Traveler reached by phone and is safe.' },
    { label: 'Contact confirmed', text: 'A trusted contact confirmed the traveler is safe.' },
    { label: 'Authorities called', text: 'Escalated to local authorities.' },
    { label: 'Trip ended safely', text: 'The trip ended and everyone arrived safely.' },
  ],
  accountDeletion: [
    { label: 'User requested', text: 'The user asked for their account to be deleted.' },
    { label: 'Repeated violations', text: 'Repeated violations of the community rules.' },
    { label: 'Fake account', text: 'Fake or impersonating account.' },
    { label: 'Duplicate account', text: 'Duplicate of another account.' },
  ],
} satisfies Record<string, ReasonPreset[]>;
