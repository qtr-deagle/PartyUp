import React, { useState } from 'react';
import { Users, MapPin, Shield, MessageCircle, Star, Zap, ChevronDown, Menu, X } from 'lucide-react';

/**
 * PartyUp Public Landing Page
 * 
 * Design: Minimalist Luxury (matches entire design system)
 * Pure marketing landing page - no system/auth elements
 * - Hero section: Travel buddy matching + Carpool features
 * - Features section: Key benefits with icons
 * - Testimonials: User reviews
 * - App Preview: Phone mockup showing app UI
 * - FAQ: Common questions
 * - CTA section: App download call-to-action
 * - Responsive mobile/desktop
 */
export default function PublicLanding() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const features = [
    {
      icon: Users,
      title: 'Smart Matching',
      description: 'Find travel buddies with shared interests, budget, and travel style using our AI-powered algorithm',
    },
    {
      icon: MapPin,
      title: 'Location-Based Discovery',
      description: 'Connect with travelers going to the same destination at the same time with geofencing technology',
    },
    {
      icon: Shield,
      title: 'Safety Verified',
      description: 'Verified profiles, ID checks, ratings, and SOS features ensure safe travels for everyone',
    },
    {
      icon: MessageCircle,
      title: 'Real-Time Chat',
      description: 'Message fellow travelers directly to plan your trip, share experiences, and build friendships',
    },
    {
      icon: Zap,
      title: 'Carpool Integration',
      description: 'Share rides, split costs, and reduce your travel expense with trusted drivers on the platform',
    },
    {
      icon: Star,
      title: 'Community Ratings',
      description: 'Build your reputation through reviews and ratings. Trust-based system rewards good travelers',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah M.',
      role: 'Solo Traveler',
      image: '👩‍🦰',
      text: "PartyUp helped me find amazing travel buddies for my Paris trip. I made friends I'm still in touch with!",
      rating: 5,
    },
    {
      name: 'James D.',
      role: 'Budget Backpacker',
      image: '👨‍🦱',
      text: 'The carpool feature saved me so much money on gas. Plus, the drivers are verified and super friendly.',
      rating: 5,
    },
    {
      name: 'Alex T.',
      role: 'Group Organizer',
      image: '👨‍💼',
      text: 'Found the perfect group for mountain hiking. The matching algorithm really nailed our compatibility!',
      rating: 5,
    },
  ];

  const faqs = [
    {
      question: 'How does the matching algorithm work?',
      answer:
        'Our algorithm analyzes your travel interests, budget, style, and dates to find the best matches. We compute compatibility scores based on shared preferences and geolocation proximity.',
    },
    {
      question: 'Is it safe to travel with strangers?',
      answer:
        'Safety is our priority. All users are verified through ID checks, phone verification, and ratings. We also offer SOS features and live tracking for trips. Our community moderation team reviews all accounts.',
    },
    {
      question: 'How does the carpool feature work?',
      answer:
        'Drivers can list their vehicles with rates, and travelers can request seats. Payments are processed securely through Stripe, and both parties are verified before the ride.',
    },
    {
      question: 'Can I cancel a trip or booking?',
      answer:
        'Yes, you can cancel with refunds depending on the timing. Most cancellations within 48 hours get a full refund. See our cancellation policy for details.',
    },
    {
      question: 'What are the fees?',
      answer:
        'PartyUp is free to use for finding travel buddies. For carpool bookings, we take a 5% commission on bookings. No hidden fees.',
    },
    {
      question: 'Is PartyUp available on mobile?',
      answer:
        'Yes! PartyUp is fully responsive on mobile web, and native iOS/Android apps are coming soon. Download our app from the App Store or Google Play.',
    },
  ];

  return (
    <div className="bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-card/80 backdrop-blur-sm border-b border-border z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
              P
            </div>
            <span className="text-xl font-bold text-primary">PartyUp</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition">
              Features
            </a>
            <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition">
              Testimonials
            </a>
            <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition">
              FAQ
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-secondary rounded-lg transition"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-card border-t border-border p-4 space-y-3">
            <a href="#features" className="block text-sm text-muted-foreground hover:text-foreground transition">
              Features
            </a>
            <a href="#testimonials" className="block text-sm text-muted-foreground hover:text-foreground transition">
              Testimonials
            </a>
            <a href="#faq" className="block text-sm text-muted-foreground hover:text-foreground transition">
              FAQ
            </a>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 md:px-8 bg-linear-to-br from-background to-secondary">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Find Your Perfect <span className="text-primary">Travel Buddy</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Connect with travelers going your way. Share experiences, split costs, and build friendships on the road.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#features"
                className="px-8 py-4 bg-secondary text-foreground rounded-lg font-medium text-lg border border-border hover:bg-secondary/80 transition"
              >
                Learn More
              </a>
              <a
                href="#app-preview"
                className="px-8 py-4 bg-primary text-primary-foreground rounded-lg font-medium text-lg hover:shadow-lg transition"
              >
                Download the App
              </a>
            </div>
          </div>

          {/* Hero Features Preview */}
          <div className="grid md:grid-cols-2 gap-6 mt-16">
            <div className="bg-card rounded-2xl shadow-elevation-3 p-6 border border-border">
              <div className="text-3xl mb-3">👥</div>
              <h3 className="text-xl font-bold mb-2">Travel Buddy Matching</h3>
              <p className="text-muted-foreground text-sm">
                AI-powered algorithm matches you with travelers who share your interests, budget, and travel style.
              </p>
              <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                <div>✓ Shared interests matching</div>
                <div>✓ Smart compatibility scoring</div>
                <div>✓ Geolocation filtering</div>
              </div>
            </div>

            <div className="bg-card rounded-2xl shadow-elevation-3 p-6 border border-border">
              <div className="text-3xl mb-3">🚗</div>
              <h3 className="text-xl font-bold mb-2">Carpool & Rideshare</h3>
              <p className="text-muted-foreground text-sm">
                Share rides with verified drivers, split costs, and travel together safely with real-time tracking.
              </p>
              <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                <div>✓ Cost splitting</div>
                <div>✓ Verified drivers</div>
                <div>✓ Secure payments</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose PartyUp?</h2>
            <p className="text-lg text-muted-foreground">Everything you need for safe, fun, and affordable travel</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
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

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 md:px-8 bg-secondary">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Loved by Travelers</h2>
            <p className="text-lg text-muted-foreground">Real stories from our community</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-card rounded-2xl p-6 border border-border shadow-elevation-3">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-4xl">{testimonial.image}</span>
                  <div>
                    <h4 className="font-bold text-foreground">{testimonial.name}</h4>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>

                <div className="flex gap-1 mb-3">
                  {Array(testimonial.rating)
                    .fill(0)
                    .map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber text-amber" />
                    ))}
                </div>

                <p className="text-muted-foreground italic">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* App Preview Section */}
      <section id="app-preview" className="py-20 px-4 md:px-8 bg-secondary">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Download Now</h2>
            <p className="text-lg text-muted-foreground">Get the PartyUp Android app and start your adventure</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Phone Mockup */}
            <div className="flex justify-center">
              <div className="relative w-64 h-96">
                {/* Phone Frame */}
                <div className="absolute inset-0 bg-black rounded-3xl shadow-2xl" style={{ padding: '12px' }}>
                  {/* Screen */}
                  <div className="w-full h-full bg-background rounded-3xl overflow-hidden flex flex-col">
                    {/* Status Bar */}
                    <div className="bg-primary px-4 py-2 text-white text-xs font-semibold">9:41</div>

                    {/* App Content */}
                    <div className="flex-1 overflow-auto p-4 space-y-3">
                      {/* Header */}
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
                          P
                        </div>
                        <span className="text-lg font-bold text-primary">PartyUp</span>
                      </div>

                      {/* Traveler Card */}
                      <div className="bg-card rounded-xl border border-border p-3 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-sm">Sarah, 24</h3>
                            <p className="text-xs text-muted-foreground">First time in Paris</p>
                          </div>
                          <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded">92%</span>
                        </div>
                        <div className="flex gap-1 text-xs">
                          <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded">Food</span>
                          <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded">Culture</span>
                        </div>
                      </div>

                      {/* Second Card */}
                      <div className="bg-card rounded-xl border border-border p-3 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-sm">James, 28</h3>
                            <p className="text-xs text-muted-foreground">Budget trip</p>
                          </div>
                          <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded">85%</span>
                        </div>
                        <div className="flex gap-1 text-xs">
                          <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded">Adventure</span>
                        </div>
                      </div>

                      {/* Buttons */}
                      <div className="flex gap-2 pt-2">
                        <button className="flex-1 bg-secondary text-foreground text-xs py-2 rounded font-medium border border-border">Skip</button>
                        <button className="flex-1 bg-primary text-primary-foreground text-xs py-2 rounded font-medium">Connect</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Phone Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-10"></div>
              </div>
            </div>

            {/* Download Info */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold">Get the App</h3>
                <p className="text-muted-foreground">
                  Download PartyUp on your Android device and start discovering travel companions right now.
                </p>
              </div>

              {/* Features List */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-primary font-bold text-xl">✓</span>
                  <span>Push notifications for new matches</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-primary font-bold text-xl">✓</span>
                  <span>Real-time chat with travelers</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-primary font-bold text-xl">✓</span>
                  <span>Live location tracking on trips</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-primary font-bold text-xl">✓</span>
                  <span>Offline mode with cached data</span>
                </div>
              </div>

              {/* Download Buttons */}
              <div className="pt-4 space-y-3">
                <a
                  href="https://play.google.com/store/apps/details?id=com.partyup"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full px-6 py-4 bg-primary text-primary-foreground rounded-lg font-medium text-lg hover:shadow-lg transition text-center"
                >
                  Download the App
                </a>
              </div>

              <p className="text-xs text-muted-foreground text-center py-3">
                Available on Android devices
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 md:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-muted-foreground">Everything you need to know</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-card rounded-lg border border-border overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-secondary transition"
                >
                  <h3 className="font-semibold text-foreground text-left">{faq.question}</h3>
                  <ChevronDown
                    className={`w-5 h-5 text-muted-foreground transition-transform ${
                      expandedFaq === index ? 'rotate-180' : ''
                    }`}
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

      {/* CTA Section */}
      <section className="py-20 px-4 md:px-8 bg-linear-to-br from-primary/10 to-primary/5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Download?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Get PartyUp on your Android device and start finding your perfect travel companions
          </p>

          <a
            href="https://play.google.com/store/apps/details?id=com.partyup"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-4 bg-primary text-primary-foreground rounded-lg font-medium text-lg hover:shadow-lg transition"
          >
            📱 Download the App
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4">PartyUp</h4>
              <p className="text-sm text-muted-foreground">Find your travel buddy, share the journey.</p>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Security
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Careers
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
            <p>&copy; 2026 PartyUp. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-foreground transition">
                Twitter
              </a>
              <a href="#" className="hover:text-foreground transition">
                Instagram
              </a>
              <a href="#" className="hover:text-foreground transition">
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
