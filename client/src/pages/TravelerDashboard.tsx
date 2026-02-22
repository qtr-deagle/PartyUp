import { useState } from "react";
import { Link } from "wouter";
import Weather from "@/components/Weather";

// Dashboard Widgets
import UpcomingTripCard from "@/components/dashboard/UpcomingTripCard";
import SuggestedBuddies from "@/components/dashboard/SuggestedBuddies";
import MessagesPreview from "@/components/dashboard/MessagesPreview";
import RecentMatches from "@/components/dashboard/RecentMatches";
import TravelStats from "@/components/dashboard/TravelStats";
import TrustSafety from "@/components/dashboard/TrustSafety";
import NotificationsPreview from "@/components/dashboard/NotificationsPreview";
import QuickActionCards from "@/components/dashboard/QuickActionCards";
import NearbyTravelers from "@/components/dashboard/NearbyTravelers";
import ActivityFeed from "@/components/dashboard/ActivityFeed";

export default function TravelerDashboard() {
  // Mock data - replace with real data from API/hooks
  const [upcomingTrip] = useState({
    id: 1,
    destination: "New York",
    origin: "Boston",
    departureDate: "2026-03-15T10:00:00",
    returnDate: "2026-03-20T18:00:00",
    buddiesCount: 3,
    seatsAvailable: 2,
    status: "upcoming" as const,
  });

  const [suggestedBuddies] = useState([
    {
      id: 1,
      name: "Anna Martinez",
      avatar: undefined,
      destination: "New York",
      travelDates: "Mar 15-20, 2026",
      matchPercentage: 92,
      isOnline: true,
    },
    {
      id: 2,
      name: "Mark Johnson",
      avatar: undefined,
      destination: "Boston",
      travelDates: "Mar 18-22, 2026",
      matchPercentage: 85,
      isOnline: false,
    },
    {
      id: 3,
      name: "Sarah Chen",
      avatar: undefined,
      destination: "Philadelphia",
      travelDates: "Mar 20-25, 2026",
      matchPercentage: 78,
      isOnline: true,
    },
  ]);

  const [messages] = useState([
    {
      id: 1,
      userId: 1,
      userName: "Anna Martinez",
      userAvatar: undefined,
      lastMessage: "Hey! Are you still going to New York next week?",
      timestamp: "2026-02-22T10:30:00",
      unreadCount: 2,
      isOnline: true,
    },
    {
      id: 2,
      userId: 2,
      userName: "Mark Johnson",
      userAvatar: undefined,
      lastMessage: "Thanks for joining the trip! Looking forward to it.",
      timestamp: "2026-02-21T15:45:00",
      unreadCount: 0,
      isOnline: false,
    },
    {
      id: 3,
      userId: 3,
      userName: "Sarah Chen",
      userAvatar: undefined,
      lastMessage: "Would you like to carpool together?",
      timestamp: "2026-02-20T09:20:00",
      unreadCount: 1,
      isOnline: true,
    },
  ]);

  const [recentMatches] = useState([
    {
      id: 1,
      name: "Emma Wilson",
      avatar: undefined,
      destination: "Miami",
      matchedDate: "2026-02-20T14:30:00",
    },
    {
      id: 2,
      name: "David Lee",
      avatar: undefined,
      destination: "Chicago",
      matchedDate: "2026-02-19T11:20:00",
    },
    {
      id: 3,
      name: "Lisa Brown",
      avatar: undefined,
      destination: "Seattle",
      matchedDate: "2026-02-18T16:45:00",
    },
  ]);

  const [travelStats] = useState({
    tripsCreated: 8,
    buddiesJoined: 24,
    reviewsReceived: 15,
    trustScore: 87,
  });

  const [trustData] = useState({
    trustLevel: 87,
    isVerified: true,
    reviewsCount: 15,
    verificationBadges: ["ID Verified", "Phone Verified", "Email Verified"],
  });

  const [notifications] = useState([
    {
      id: 1,
      type: "trip" as const,
      title: "Trip Approved",
      message: "Your trip to New York has been approved and is now live!",
      timestamp: "2026-02-22T11:00:00",
      isRead: false,
    },
    {
      id: 2,
      type: "match" as const,
      title: "New Match",
      message: "You matched with Anna Martinez for your New York trip",
      timestamp: "2026-02-22T09:30:00",
      isRead: false,
    },
    {
      id: 3,
      type: "message" as const,
      title: "New Message",
      message: "Mark Johnson sent you a message",
      timestamp: "2026-02-21T15:45:00",
      isRead: true,
    },
  ]);

  const [nearbyTravelers] = useState([
    {
      id: 1,
      name: "Alex Turner",
      avatar: undefined,
      destination: "New York",
      distance: 2.5,
      isOnline: true,
      travelingSoon: true,
    },
    {
      id: 2,
      name: "Jessica Kim",
      avatar: undefined,
      destination: "Boston",
      distance: 3.8,
      isOnline: true,
      travelingSoon: false,
    },
    {
      id: 3,
      name: "Michael Ross",
      avatar: undefined,
      destination: undefined,
      distance: 1.2,
      isOnline: false,
      travelingSoon: false,
    },
  ]);

  const [activities] = useState([
    {
      id: 1,
      type: "like" as const,
      userName: "Anna Martinez",
      userAvatar: undefined,
      action: "liked your profile",
      subject: "",
      timestamp: "2026-02-22T12:30:00",
    },
    {
      id: 2,
      type: "join" as const,
      userName: "Mark Johnson",
      userAvatar: undefined,
      action: "joined your trip to",
      subject: "New York",
      timestamp: "2026-02-22T10:15:00",
    },
    {
      id: 3,
      type: "trending" as const,
      userName: undefined,
      userAvatar: undefined,
      action: "3 travelers going to",
      subject: "Cebu this week",
      timestamp: "2026-02-22T08:45:00",
    },
  ]);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Welcome back, Traveler!
          </h1>
          <p className="text-muted-foreground">
            Find your next adventure and travel companion
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <QuickActionCards />
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-8 space-y-6">
            {/* Row 1: Upcoming Trip & Weather */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <UpcomingTripCard
                  trip={upcomingTrip}
                  onCreateTrip={() => (window.location.href = "/post-ride")}
                />
              </div>
              <div className="md:col-span-1">
                <Weather />
              </div>
            </div>

            {/* Row 2: Recent Matches */}
            <RecentMatches matches={recentMatches} />

            {/* Row 3: Suggested Buddies & Messages */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SuggestedBuddies buddies={suggestedBuddies} />
              <MessagesPreview messages={messages} />
            </div>

            {/* Row 4: Activity Feed */}
            <ActivityFeed activities={activities} />
          </div>

          {/* Right Column - Sidebar Widgets */}
          <div className="lg:col-span-4 space-y-6">
            {/* Trust & Safety */}
            <TrustSafety trustData={trustData} />

            {/* Travel Stats */}
            <TravelStats stats={travelStats} />

            {/* Notifications Preview */}
            <NotificationsPreview notifications={notifications} />

            {/* Nearby Travelers */}
            <NearbyTravelers travelers={nearbyTravelers} />
          </div>
        </div>
      </div>
    </div>
  );
}
