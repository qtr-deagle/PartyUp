import React, { useState } from 'react';
import {
  BadgeCheck,
  Car,
  ChevronDown,
  Compass,
  IdCard,
  Map as MapIcon,
  Menu,
  MessageCircle,
  ShieldAlert,
  Star,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import { LEGAL_CONTACT_EMAIL } from '@/content/legal';

/**
 * PartyUp public landing page (marketing only, no auth).
 *
 * Copy describes what the mobile app actually does today: Discover plan
 * matching, fuel-sharing carpools (2% fee on top of the contribution), tours
 * and Guild PartyUps, guilds/ranks/missions, chat, and the verification and
 * safety features. Keep it in sync when those change.
 */
// Latest Android build from EAS (preview profile). Update when a new APK is built.
const APK_DOWNLOAD_URL = 'https://expo.dev/artifacts/eas/bHLfM7iaZy3qSpj19rJt7XaSRBTsEvqMtR3JOWv_Wsc.apk';

const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#safety', label: 'Safety' },
  { href: '#faq', label: 'FAQ' },
];

const features = [
  {
    icon: Compass,
    title: 'Discover by travel plan',
    description:
      'Set how you ride, where you like to go, and what you like to eat. Discover shows travelers with a match score, and you swipe to connect.',
  },
  {
    icon: MapIcon,
    title: 'Nearby travelers & trips',
    description: 'See travelers and open trips around you on the map, and choose whether others can see your live location.',
  },
  {
    icon: Car,
    title: 'Fuel-sharing carpools',
    description:
      'Drivers post a route with pickup points. Riders pick a stop and offer a fuel contribution within the suggested range. No profit rides, just shared costs.',
  },
  {
    icon: Users,
    title: 'Tours & Guild PartyUps',
    description: 'Join group tours, or outings organized inside your guild, with an itinerary and a group chat for everyone going.',
  },
  {
    icon: Trophy,
    title: 'Guilds, ranks & missions',
    description: 'Join a guild, complete missions, climb from Bronze to Legend, and unlock medals, banners and avatar frames.',
  },
  {
    icon: MessageCircle,
    title: 'Chat that keeps up',
    description: 'Direct messages, trip and guild group chats, photos, reactions and read receipts, with push notifications.',
  },
];

const steps = [
  { title: 'Sign up', description: 'Download the Android app and create an account with your Gmail address. You must be 18 or older.' },
  { title: 'Get verified', description: 'Upload your ID and a selfie. A PartyUp admin reviews it and confirms you live in Bulacan.' },
  { title: 'Set your plan', description: 'Tell PartyUp how you like to travel, then swipe through travelers who match.' },
  { title: 'Go together', description: 'Join a carpool, tour or Guild PartyUp, chat with the group, and head out with safety features on.' },
];

const safety = [
  {
    icon: IdCard,
    title: 'ID & selfie verification',
    description: 'Every traveler is checked with an automated face match and reviewed by a PartyUp admin before they can join trips.',
  },
  {
    icon: BadgeCheck,
    title: 'Licensed, reviewed drivers',
    description: "Drivers need a valid driver's license (with a QR check) and a reviewed vehicle before they can host a carpool.",
  },
  {
    icon: ShieldAlert,
    title: 'Warning Mode & SOS',
    description: 'Start a countdown when something feels off. If you don\'t cancel it, your trusted circle gets an SOS with your live location.',
  },
  {
    icon: Star,
    title: 'Trust scores & reports',
    description: 'Ratings after every trip build a trust score. Report anyone, block them, or contact support from inside the app.',
  },
];

const faqs = [
  {
    question: 'How does matching work?',
    answer:
      'You fill in a short travel plan: how you ride (motor or car), where you like to go (beach, mountain, cities), food and drink preferences, and optionally who you prefer to travel with. Discover compares plans and shows a match percentage, so the people at the top travel the way you do.',
  },
  {
    question: 'Is it safe to travel with strangers?',
    answer:
      "Everyone passes an ID and selfie check reviewed by a PartyUp admin, and drivers also need a verified license and vehicle. During a trip you can share your live location, start Warning Mode, or send an SOS to your trusted circle. Ratings and reports keep the community accountable.",
  },
  {
    question: 'How do carpools work?',
    answer:
      'A verified driver posts a route with pickup points and a suggested fuel contribution for each stop. You choose your stop, offer an amount within the range, and the driver accepts. Pay in the app with GCash or PayMaya through PayMongo, so every payment is confirmed automatically.',
  },
  {
    question: 'What are the fees?',
    answer:
      "Finding travel buddies, chatting and joining guilds is free. Carpool riders pay a 2% platform fee on top of their fuel contribution. For paid tours, PartyUp keeps 2% of the price from the organizer's share, so riders pay the listed price.",
  },
  {
    question: 'Who can join PartyUp?',
    answer:
      'Adults (18+) who live in Bulacan. Your ID must show a Bulacan address to get verified, but your trips can go anywhere.',
  },
  {
    question: 'What happens to my data?',
    answer:
      "We only use it to run PartyUp and keep travelers safe, and we never sell it. You can delete your account from Settings in the app at any time. It's deactivated right away and permanently deleted after 30 days. See our Privacy Policy for details.",
  },
  {
    question: 'Is there an iPhone app?',
    answer: 'Not yet. PartyUp is available on Android today.',
  },
];

function DownloadButton({ className = '' }: { className?: string }) {
  return (
    <a
      href={APK_DOWNLOAD_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground rounded-lg font-medium text-lg hover:shadow-lg transition ${className}`}
    >
      Download for Android
    </a>
  );
}

export default function PublicLanding() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <div className="bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-card/80 backdrop-blur-sm border-b border-border z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
              P
            </div>
            <span className="text-xl font-bold text-primary">PartyUp</span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition">
                {link.label}
              </a>
            ))}
            <a
              href="#download"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:shadow-lg transition"
            >
              Get the app
            </a>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-secondary rounded-lg transition"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-card border-t border-border p-4 space-y-3">
            {[...NAV_LINKS, { href: '#download', label: 'Get the app' }].map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm text-muted-foreground hover:text-foreground transition"
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 md:px-8 bg-linear-to-br from-background to-secondary">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block mb-5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              For verified travelers in Bulacan
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Find your <span className="text-primary">travel buddy</span>, share the ride
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Match with travelers who like the same trips, split fuel on carpools, join tours with your guild, and travel with safety
              features built in.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#how-it-works"
                className="px-8 py-4 bg-secondary text-foreground rounded-lg font-medium text-lg border border-border hover:bg-secondary/80 transition"
              >
                How it works
              </a>
              <DownloadButton />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-16">
            <div className="bg-card rounded-2xl shadow-elevation-3 p-6 border border-border">
              <Compass className="w-8 h-8 text-primary mb-3" />
              <h3 className="text-xl font-bold mb-2">Travel plan matching</h3>
              <p className="text-muted-foreground text-sm">
                Your ride style, favorite destinations and food picks become a plan. Discover ranks travelers by how well their plan matches yours.
              </p>
              <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                <div>✓ Match percentage on every card</div>
                <div>✓ Optional travel-companion gender preference</div>
                <div>✓ Nearby travelers on the map</div>
              </div>
            </div>

            <div className="bg-card rounded-2xl shadow-elevation-3 p-6 border border-border">
              <Car className="w-8 h-8 text-primary mb-3" />
              <h3 className="text-xl font-bold mb-2">Fuel-sharing carpools</h3>
              <p className="text-muted-foreground text-sm">
                Ride with licensed, verified drivers. Pick your pickup point and chip in for fuel. Never pay for a profit ride.
              </p>
              <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                <div>✓ Pickup points along the route</div>
                <div>✓ Suggested contribution range per stop</div>
                <div>✓ GCash & PayMaya via PayMongo, plus a 2% platform fee</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 md:px-8 scroll-mt-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything for traveling together</h2>
            <p className="text-lg text-muted-foreground">From finding your crew to getting home safe</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="bg-card rounded-2xl shadow-elevation-3 p-6 border border-border hover:border-primary transition-all duration-300"
                >
                  <Icon className="w-10 h-10 text-primary mb-4" />
                  <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-4 md:px-8 bg-secondary scroll-mt-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How it works</h2>
            <p className="text-lg text-muted-foreground">From download to your first trip in four steps</p>
          </div>

          <ol className="grid md:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <li key={step.title} className="bg-card rounded-2xl p-6 border border-border shadow-elevation-3">
                <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mb-4">
                  {index + 1}
                </div>
                <h3 className="font-bold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Safety */}
      <section id="safety" className="py-20 px-4 md:px-8 scroll-mt-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Safety built in</h2>
            <p className="text-lg text-muted-foreground">Know who you're traveling with, and get help fast if you need it</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {safety.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex gap-4 bg-card rounded-2xl p-6 border border-border shadow-elevation-3">
                  <div className="w-11 h-11 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Download */}
      <section id="download" className="py-20 px-4 md:px-8 bg-secondary scroll-mt-20">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Phone mockup: a Discover card */}
            <div className="flex justify-center">
              <div className="relative w-64 h-[26rem]">
                <div className="absolute inset-0 bg-black rounded-3xl shadow-2xl p-3">
                  <div className="w-full h-full bg-background rounded-3xl overflow-hidden flex flex-col">
                    <div className="bg-primary px-4 py-2 text-white text-xs font-semibold">9:41</div>

                    <div className="flex-1 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold">Discover</span>
                        <span className="text-[10px] font-semibold text-muted-foreground">Malolos · 4 km</span>
                      </div>

                      <div className="bg-card rounded-2xl border border-border p-4 space-y-3 shadow-elevation-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-1">
                              <h3 className="font-bold text-sm">Bea, 24</h3>
                              <BadgeCheck className="w-3.5 h-3.5 text-primary" />
                            </div>
                            <p className="text-[11px] text-muted-foreground">Gold · Tara Na Guild</p>
                          </div>
                          <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded-lg">92% match</span>
                        </div>
                        <div className="flex flex-wrap gap-1 text-[10px]">
                          <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded">Car riding</span>
                          <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded">Mountain</span>
                          <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded">Food finding</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">"Weekend trip to Sierra Madre. Looking for 2 more!"</p>
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> 4.9 trust · 12 trips
                        </div>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <span className="flex-1 text-center bg-secondary text-foreground text-xs py-2 rounded-lg font-medium border border-border">
                          Pass
                        </span>
                        <span className="flex-1 text-center bg-primary text-primary-foreground text-xs py-2 rounded-lg font-medium">
                          Connect
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-10"></div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold">Get PartyUp</h2>
                <p className="text-muted-foreground">
                  Download the Android app, get verified, and find people heading your way this weekend.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  'Push notifications for requests, chats and trips',
                  'Live location sharing during trips',
                  'Warning Mode and one-tap SOS',
                  'Trip history, ratings and guild rewards',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <span className="text-primary font-bold text-xl">✓</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <DownloadButton className="w-full" />
                <p className="text-xs text-muted-foreground text-center py-3">Android only for now · Free to download</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-4 md:px-8 scroll-mt-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently asked questions</h2>
            <p className="text-lg text-muted-foreground">Everything you need to know</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={faq.question} className="bg-card rounded-lg border border-border overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-secondary transition"
                  aria-expanded={expandedFaq === index}
                >
                  <h3 className="font-semibold text-foreground text-left">{faq.question}</h3>
                  <ChevronDown
                    className={`w-5 h-5 shrink-0 text-muted-foreground transition-transform ${expandedFaq === index ? 'rotate-180' : ''}`}
                  />
                </button>

                {expandedFaq === index && (
                  <div className="px-6 py-4 border-t border-border bg-muted/20">
                    <p className="text-muted-foreground text-sm">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 md:px-8 bg-linear-to-br from-primary/10 to-primary/5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to party up?</h2>
          <p className="text-lg text-muted-foreground mb-8">Your next travel buddy might be one town over.</p>
          <DownloadButton />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4">PartyUp</h4>
              <p className="text-sm text-muted-foreground">
                Find your travel buddy, share the journey. A student project from Bulacan, Philippines.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4">Explore</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {[...NAV_LINKS, { href: '#download', label: 'Download' }].map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="hover:text-foreground transition">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="/privacy" className="hover:text-foreground transition">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="/terms" className="hover:text-foreground transition">
                    Terms & Conditions
                  </a>
                </li>
                <li>
                  <a href={`mailto:${LEGAL_CONTACT_EMAIL}`} className="hover:text-foreground transition">
                    Contact us
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
            <p>&copy; 2026 PartyUp. All rights reserved.</p>
            <a href={`mailto:${LEGAL_CONTACT_EMAIL}`} className="hover:text-foreground transition">
              {LEGAL_CONTACT_EMAIL}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
