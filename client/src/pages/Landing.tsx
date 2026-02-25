import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, Car, MapPin, Shield, MessageCircle, Zap } from "lucide-react";
import { useLocation } from "wouter";

export default function Landing() {
  const [, setLocation] = useLocation();

  const handleTravelerLogin = () => {
    // Store role in sessionStorage and redirect to login
    sessionStorage.setItem("selectedRole", "traveler");
    setLocation("/login");
  };

  const handleRenterLogin = () => {
    // Store role in sessionStorage and redirect to login
    sessionStorage.setItem("selectedRole", "car_renter");
    setLocation("/login");
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-accent/5">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
              P
            </div>
            <span className="text-xl font-bold text-foreground">PartyUp</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </a>
            <a href="#safety" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Safety
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-20 md:py-32">
        <div className="max-w-3xl mx-auto text-center animate-fadeIn">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
            Travel Together.{" "}
            <span className="bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">Safer.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-balance">
            Connect with trusted travel companions, share rides, and rent vehicles from verified hosts. Your journey starts here.
          </p>

          {/* Role Selection */}
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-12">
            {/* Traveler Card */}
            <Card className="p-8 bg-card text-card-foreground rounded-xl shadow-md p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer border-2 border-border hover:border-primary/50 transition-all">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">I'm a Traveler</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Find travel buddies, join carpools, and rent vehicles for your adventures.
              </p>
              <Button onClick={handleTravelerLogin} className="w-full bg-primary text-primary-foreground rounded-xl font-semibold px-6 py-2.5 transition-all duration-300 hover:shadow-lg active:scale-95">
                Continue as Traveler
              </Button>
            </Card>

            {/* Car Renter Card */}
            <Card className="p-8 bg-card text-card-foreground rounded-xl shadow-md p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer border-2 border-border hover:border-accent/50 transition-all">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
                  <Car className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">I'm a Car Renter</h3>
              <p className="text-sm text-muted-foreground mb-6">
                List your vehicles and earn by renting to verified travelers.
              </p>
              <Button onClick={handleRenterLogin} variant="outline" className="w-full border-2 border-primary text-primary rounded-xl font-semibold px-6 py-2.5 transition-all duration-300 hover:bg-primary hover:text-primary-foreground">
                Continue as Car Renter
              </Button>
            </Card>
          </div>

          {/* Admin Login Link */}
          <p className="text-xs text-muted-foreground">
            Admin?{" "}
            <button
              onClick={() => {
                sessionStorage.setItem("selectedRole", "admin");
                setLocation("/login");
              }}
              className="text-primary hover:underline font-medium"
            >
              Access admin portal
            </button>
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container py-20 md:py-32 border-t border-border">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-16">Why Choose PartyUp?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Shield,
              title: "Trust & Safety",
              description: "Verified profiles, emergency contacts, and real-time trip sharing keep everyone safe.",
            },
            {
              icon: MessageCircle,
              title: "Real-time Chat",
              description: "Connect instantly with travel companions and car renters through our secure messaging.",
            },
            {
              icon: MapPin,
              title: "Smart Matching",
              description: "Find compatible travelers based on interests, budget, and travel style.",
            },
            {
              icon: Zap,
              title: "Instant Bookings",
              description: "Seamless booking experience with secure payments and instant confirmations.",
            },
            {
              icon: Users,
              title: "Community Driven",
              description: "Join a trusted community of travelers and car owners worldwide.",
            },
            {
              icon: Car,
              title: "Flexible Rentals",
              description: "Wide selection of vehicles at competitive prices from verified hosts.",
            },
          ].map((feature, idx) => (
            <Card key={idx} className="p-6 bg-card text-card-foreground rounded-xl shadow-md p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                <feature.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="container py-20 md:py-32 border-t border-border">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-16">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {[
            { num: "1", title: "Sign Up", desc: "Create your profile and verify your identity" },
            { num: "2", title: "Connect", desc: "Find and match with travelers or renters" },
            { num: "3", title: "Communicate", desc: "Chat in real-time to plan your journey" },
            { num: "4", title: "Travel", desc: "Enjoy your trip with confidence and safety" },
          ].map((step, idx) => (
            <div key={idx} className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg mx-auto mb-3">
                {step.num}
              </div>
              <h3 className="font-semibold text-foreground mb-1">{step.title}</h3>
              <p className="text-xs text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Safety Section */}
      <section id="safety" className="container py-20 md:py-32 border-t border-border">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-8">Your Safety Matters</h2>
          <Card className="p-8 bg-card text-card-foreground rounded-xl shadow-md p-4 border-2 border-primary/20">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Verification
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✓ ID verification for all users</li>
                  <li>✓ Background checks available</li>
                  <li>✓ Phone number verification</li>
                  <li>✓ Review and rating system</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-accent" />
                  Protection
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✓ Emergency SOS button</li>
                  <li>✓ Real-time trip sharing</li>
                  <li>✓ Trusted contacts alerts</li>
                  <li>✓ 24/7 support team</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-muted/30">
        <div className="container text-center text-sm text-muted-foreground">
          <p>&copy; 2026 PartyUp. All rights reserved. Travel safely, travel together.</p>
        </div>
      </footer>
    </div>
  );
}
