import React, { useState } from 'react';
import Layout from '@/components/Layout';
import CreateRideModal from '@/components/CreateRideModal';
import { MapPin, Calendar, Users, Star, Plus, Search, ArrowRight, Zap, CreditCard, Smartphone, Lock } from 'lucide-react';
import { toast } from 'sonner';

export default function Carpooling() {
  const [activeTab, setActiveTab] = useState<'find' | 'create' | 'active' | 'history'>('find');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateRide, setShowCreateRide] = useState(false);
  const [bookingRideId, setBookingRideId] = useState<number | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'gcash' | 'maya'>('gcash');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [selectedRideForPayment, setSelectedRideForPayment] = useState<any>(null);
  const [cardData, setCardData] = useState({ cardNumber: '', expiry: '', cvc: '', name: '' });
  const [gcashNumber, setGcashNumber] = useState('');

  const getDeadlineStatus = () => {
    if (!selectedRideForPayment) return null;
    const deadline = new Date(selectedRideForPayment.paymentDeadline);
    const today = new Date('2026-02-11'); // Using fixed date for demo
    const daysLeft = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
    
    return {
      daysLeft,
      isPassed: daysLeft < 0,
      isUrgent: daysLeft <= 3,
      isSoon: daysLeft <= 7,
    };
  };

  const calculateRidePrice = () => {
    return selectedRideForPayment?.costPerSeat || '0';
  };

  const handleProcessPayment = async () => {
    if (paymentMethod === 'card') {
      if (!cardData.cardNumber || !cardData.expiry || !cardData.cvc || !cardData.name) {
        toast.error('Please fill in all card details');
        return;
      }
    } else {
      if (!gcashNumber) {
        toast.error('Please enter your GCash number');
        return;
      }
    }

    // Check if deadline has passed
    if (getDeadlineStatus()?.isPassed) {
      toast.error('Payment deadline has passed. Contact the driver to join.');
      return;
    }

    setProcessingPayment(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success(`Payment of ₱${calculateRidePrice()} processed successfully!`);
      
      // Show commitment lock message
      setTimeout(() => {
        toast.info('🔒 You are now committed to this trip. Non-refundable unless trip is cancelled.');
        setShowPaymentModal(false);
        setBookingRideId(selectedRideForPayment.id);
        setTimeout(() => {
          toast.success('Ride request sent! Driver will confirm shortly.');
          setBookingRideId(null);
        }, 800);
      }, 500);
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleCreateRide = (ride: {
    from: string;
    to: string;
    date: string;
    time: string;
    seats: number;
    description: string;
    pricePerPerson: number;
  }) => {
    console.log('Ride created:', ride);
    setShowCreateRide(false);
    toast.success('Ride created successfully!');
  };

  const handleRequestRide = (rideId: number) => {
    const ride = availableRides.find(r => r.id === rideId);
    if (ride) {
      setSelectedRideForPayment(ride);
      setShowPaymentModal(true);
    }
  };

  const availableRides = [
    {
      id: 1,
      driver: 'John Doe',
      from: 'Makati',
      to: 'Laguna',
      date: '2026-02-25',
      time: '08:00 AM',
      seats: 3,
      booked: 1,
      rating: 4.8,
      verified: true,
      distance: '45 km',
      costPerSeat: 360,
      paymentDeadline: '2026-02-18', // 1 week before departure
      paymentDeadlineLabel: '7 days',
    },
    {
      id: 2,
      driver: 'Sarah Wilson',
      from: 'BGC',
      to: 'Tagaytay',
      date: '2026-02-25',
      time: '10:30 AM',
      seats: 2,
      booked: 0,
      rating: 4.9,
      verified: true,
      distance: '60 km',
      costPerSeat: 480,
      paymentDeadline: '2026-02-18',
      paymentDeadlineLabel: '7 days',
    },
    {
      id: 3,
      driver: 'Mike Chen',
      from: 'Quezon City',
      to: 'Cavite',
      date: '2026-02-26',
      time: '02:00 PM',
      seats: 4,
      booked: 2,
      rating: 4.7,
      verified: true,
      distance: '35 km',
      costPerSeat: 280,
      paymentDeadline: '2026-02-19',
      paymentDeadlineLabel: '8 days',
    },
  ];

  const activeRides = [
    {
      id: 101,
      from: 'Makati',
      to: 'Laguna',
      date: '2026-02-25',
      time: '08:00 AM',
      seats: 3,
      booked: 1,
      status: 'in-progress',
      passengers: ['Maria Santos'],
    },
  ];

  const rideHistory = [
    {
      id: 201,
      from: 'Makati',
      to: 'Laguna',
      date: '2026-02-20',
      status: 'completed',
    },
    {
      id: 202,
      from: 'BGC',
      to: 'Boracay',
      date: '2026-02-15',
      status: 'completed',
    },
  ];

  const filteredRides = availableRides.filter(ride =>
    ride.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ride.to.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="bg-background dark:bg-background min-h-screen md:pb-0 pb-24">
        <div className="md:hidden sticky top-0 bg-card dark:bg-card border-b border-border z-10">
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search rides..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-secondary dark:bg-secondary border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-t border-border">
            {[
              { id: 'find', label: 'Find', icon: '🔍' },
              { id: 'create', label: 'Create', icon: '➕' },
              { id: 'active', label: 'Active', icon: '🚗' },
              { id: 'history', label: 'History', icon: '📋' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-2.5 text-center text-xs font-medium transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:block p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8 flex items-start justify-end">
              <button onClick={() => setShowCreateRide(true)} className="px-6 py-3 bg-primary dark:bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 dark:hover:bg-primary/90 transition-all flex items-center gap-2">
                <Plus className="w-5 h-5" /> Create Ride
              </button>
            </div>

            {/* Available Rides for Desktop */}
            {activeTab === 'find' && (
              <div className="space-y-4">
                {filteredRides.map((ride) => (
                  <div key={ride.id} className="p-6 bg-card dark:bg-card border border-border rounded-2xl hover:border-primary dark:hover:border-primary transition-all">
                    <div className="flex gap-6 items-start">
                      <div className="w-14 h-14 rounded-full bg-primary/20 border-2 border-primary/50 flex items-center justify-center shrink-0">
                        <span className="text-xl font-bold text-primary">{ride.driver[0]}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-foreground text-lg">{ride.driver}</h3>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                                <Star className="w-4 h-4 fill-current" /> {ride.rating}
                              </span>
                              {ride.verified && (
                                <span className="px-2 py-1 bg-accent/20 border border-accent/50 text-accent text-xs font-semibold rounded-full">✓ Verified</span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="px-2 py-1 bg-accent/20 border border-accent/50 text-accent text-xs font-semibold rounded-full">✓ Verified</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 py-4 mb-4 border-y border-border">
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground mb-1">FROM</p>
                            <p className="text-foreground font-semibold flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-primary" /> {ride.from}
                            </p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-primary" />
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground mb-1">TO</p>
                            <p className="text-foreground font-semibold flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-blue-400" /> {ride.to}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-6 mb-4">
                          <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            <Calendar className="w-4 h-4" /> {ride.date} at {ride.time}
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            <Users className="w-4 h-4" /> {ride.seats - ride.booked}/{ride.seats} seats left
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            <Zap className="w-4 h-4" /> {ride.distance}
                          </div>
                        </div>

                          <div className="flex gap-3">
                          <button className="flex-1 py-2.5 border border-primary/30 text-primary rounded-lg hover:bg-primary/5 transition-all font-semibold text-sm">
                            View Details
                          </button>
                          <button 
                            onClick={() => handleRequestRide(ride.id)}
                            disabled={bookingRideId === ride.id}
                            className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all font-semibold text-sm disabled:opacity-50"
                          >
                            {bookingRideId === ride.id ? 'Requesting...' : 'Request Ride'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'create' && (
              <div className="p-12 bg-white dark:bg-linear-to-br dark:from-slate-900 dark:to-slate-800 border border-slate-200 dark:border-blue-600/20 rounded-2xl text-center">
                <Plus className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Share Your Ride</h3>
                <p className="text-slate-400 mb-6 max-w-md mx-auto">Offer a carpool and help fellow travelers reach their destination together</p>
                <button onClick={() => setShowCreateRide(true)} className="px-8 py-3 bg-blue-600 dark:bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-700 transition-all">
                  Offer Ride
                </button>
              </div>
            )}

            {activeTab === 'active' && (
              <div className="space-y-4">
                {activeRides.map((ride) => (
                  <div key={ride.id} className="p-6 bg-linear-to-br from-green-500/10 to-green-500/10 border border-green-500/30 rounded-2xl">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                          <span className="text-green-400 font-semibold">In Progress</span>
                        </div>
                        <h3 className="text-xl font-bold text-white">{ride.from} → {ride.to}</h3>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 py-4 border-y border-green-500/20">
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Date & Time</p>
                        <p className="text-white font-semibold">{ride.date} {ride.time}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Passengers</p>
                        <p className="text-white font-semibold">{ride.booked}/{ride.seats}</p>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button className="flex-1 py-2.5 border border-primary/30 text-primary rounded-lg hover:bg-primary/5 transition-all font-semibold">
                        View Details
                      </button>
                      <button className="flex-1 py-2.5 border border-primary/30 text-primary rounded-lg hover:bg-primary/5 transition-all font-semibold">
                        Contact Passengers
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-4">
                {rideHistory.map((ride) => (
                  <div key={ride.id} className="p-6 bg-slate-900 border border-slate-700 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-foreground">{ride.from} → {ride.to}</h3>
                        <p className="text-muted-foreground text-sm">{ride.date}</p>
                      </div>
                      <span className="px-4 py-2 bg-accent/20 text-accent rounded-full text-sm font-semibold">✓ Completed</span>
                    </div>
                  </div>
                ))}"
              </div>
            )}
          </div>
        </div>

        {/* Mobile Content */}
        <div className="md:hidden p-4">
          {activeTab === 'find' && (
            <div className="space-y-4">
              {filteredRides.map((ride) => (
                <div key={ride.id} className="p-4 bg-card/50 dark:bg-card/50 border border-border rounded-xl">
                  <div className="flex gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-primary/20 border-2 border-primary/50 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-primary">{ride.driver[0]}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground text-sm">{ride.driver}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-600 dark:text-yellow-400" />
                        <span className="text-xs text-yellow-600 dark:text-yellow-400 font-semibold">{ride.rating}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">Available</p>
                      <p className="text-xs text-muted-foreground">{ride.seats - ride.booked} seats</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4 pb-4 border-b border-border">
                    <p className="text-sm text-card-foreground font-semibold">{ride.from} → {ride.to}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {ride.date} at {ride.time}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Users className="w-3 h-3" /> {ride.seats - ride.booked} seats left
                    </p>
                  </div>

                  <button 
                    onClick={() => handleRequestRide(ride.id)}
                    disabled={bookingRideId === ride.id}
                    className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold text-sm disabled:opacity-50"
                  >
                    {bookingRideId === ride.id ? 'Requesting...' : 'Request Ride'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'create' && (
              <div className="p-12 bg-card dark:bg-card border border-border rounded-2xl text-center">
                <Plus className="w-16 h-16 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">Share Your Ride</h3>
                <p className="text-sm text-muted-foreground mb-4">Offer a carpool and help fellow travelers reach their destination together</p>
                <button onClick={() => setShowCreateRide(true)} className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all">
                Offer Ride
              </button>
            </div>
          )}

          {activeTab === 'active' && (
            <div className="space-y-4">
              {activeRides.map((ride) => (
                <div key={ride.id} className="p-4 bg-accent/10 border border-accent/30 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse"></div>
                    <span className="text-accent font-semibold text-xs">In Progress</span>
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{ride.from} → {ride.to}</h3>
                  <div className="space-y-1 text-sm mb-3 pb-3 border-b border-accent/20">
                    <p className="text-muted-foreground">{ride.date} at {ride.time}</p>
                    <p className="text-foreground font-semibold">{ride.booked}/{ride.seats} passengers</p>
                  </div>
                  <button className="w-full py-2 border border-green-700/30 bg-green-200 text-green-700 rounded-lg font-semibold text-sm">
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              {rideHistory.map((ride) => (
                <div key={ride.id} className="p-4 bg-card dark:bg-card border border-border rounded-lg">
                  <h3 className="font-semibold text-foreground mb-1 text-sm">{ride.from} → {ride.to}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{ride.date}</p>
                  <span className="text-xs px-2 py-1 bg-accent/20 text-accent rounded-full font-semibold">✓ Completed</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Ride Modal */}
        {/* Payment Modal */}
        {showPaymentModal && selectedRideForPayment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-xl w-full max-w-sm shadow-2xl">
              {/* Modal Header */}
              <div className="bg-linear-to-r from-primary/20 to-accent/20 p-3 border-b border-border">
                <h2 className="text-lg font-bold text-foreground">Confirm Booking</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {selectedRideForPayment.from} → {selectedRideForPayment.to}
                </p>
              </div>

              {/* Modal Content */}
              <div className="p-3 space-y-2">
                {/* Ride Summary */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded p-2 space-y-1">
                  <p className="text-xs font-semibold text-blue-700">💰 FUEL COST</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between"><span className="text-muted-foreground">Distance:</span><span className="font-semibold">{selectedRideForPayment.distance}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Seats:</span><span className="font-semibold">{selectedRideForPayment.seats}</span></div>
                  </div>
                  <div className="flex justify-between text-xs pt-1 border-t border-blue-500/20">
                    <span className="font-semibold">Each passenger's share:</span>
                    <span className="text-base font-bold text-blue-600">₱{calculateRidePrice()}</span>
                  </div>
                </div>

                {/* Payment Deadline */}
                {getDeadlineStatus() && (
                  <div className={`rounded p-2 border text-xs ${
                    getDeadlineStatus().isPassed 
                      ? 'bg-red-500/10 border-red-500/30' 
                      : getDeadlineStatus().isUrgent 
                      ? 'bg-orange-500/10 border-orange-500/30'
                      : 'bg-green-500/10 border-green-500/30'
                  }`}>
                    <p className="font-semibold mb-1 flex items-center gap-1">
                      {getDeadlineStatus().isPassed ? (
                        <span className="text-red-700">❌ Deadline Passed</span>
                      ) : getDeadlineStatus().isUrgent ? (
                        <span className="text-orange-700">⏰ {getDeadlineStatus().daysLeft} days left</span>
                      ) : (
                        <span className="text-green-700">📅 {getDeadlineStatus().daysLeft} days</span>
                      )}
                    </p>
                    <p className="text-muted-foreground">Pay by <strong>{selectedRideForPayment.paymentDeadline}</strong></p>
                    {getDeadlineStatus().isUrgent && !getDeadlineStatus().isPassed && (
                      <p className="text-orange-700 bg-orange-500/20 p-1 rounded mt-1">
                        🔒 After payment: ₱50 cancellation fee applies
                      </p>
                    )}
                  </div>
                )}

                {/* Payment Method Selection */}
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-foreground">Payment Method</p>
                  
                  <button
                    onClick={() => {
                      setPaymentMethod('maya');
                      setGcashNumber('');
                    }}
                    className={`w-full p-2 rounded border-2 transition-all flex items-center gap-2 text-left text-xs ${
                      paymentMethod === 'maya'
                        ? 'border-purple-500 bg-purple-500/5'
                        : 'border-border hover:border-purple-500/50'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                    <div>
                      <p className="font-semibold">Maya</p>
                      <p className="text-xs text-muted-foreground">Digital wallet</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setPaymentMethod('gcash');
                      setCardData({ cardNumber: '', expiry: '', cvc: '', name: '' });
                    }}
                    className={`w-full p-2 rounded border-2 transition-all flex items-center gap-2 text-left text-xs ${
                      paymentMethod === 'gcash'
                        ? 'border-blue-500 bg-blue-500/5'
                        : 'border-border hover:border-blue-500/50'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <div>
                      <p className="font-semibold">GCash</p>
                      <p className="text-xs text-muted-foreground">Mobile wallet</p>
                    </div>
                  </button>
                </div>

                {/* Payment Form - Compact */}
                {paymentMethod === 'maya' ? (
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      placeholder="Name"
                      value={cardData.name}
                      onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                      className="w-full px-2 py-1.5 bg-secondary border border-border rounded text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <input
                      type="text"
                      placeholder="Card Number"
                      maxLength={16}
                      value={cardData.cardNumber}
                      onChange={(e) => setCardData({ ...cardData, cardNumber: e.target.value.replace(/\D/g, '') })}
                      className="w-full px-2 py-1.5 bg-secondary border border-border rounded text-xs focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                    />
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="MM/YY"
                        maxLength={5}
                        value={cardData.expiry}
                        onChange={(e) => {
                          let val = e.target.value.replace(/\D/g, '');
                          if (val.length >= 2) val = val.slice(0, 2) + '/' + val.slice(2, 4);
                          setCardData({ ...cardData, expiry: val });
                        }}
                        className="flex-1 px-2 py-1.5 bg-secondary border border-border rounded text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <input
                        type="text"
                        placeholder="CVC"
                        maxLength={3}
                        value={cardData.cvc}
                        onChange={(e) => setCardData({ ...cardData, cvc: e.target.value.replace(/\D/g, '') })}
                        className="flex-1 px-2 py-1.5 bg-secondary border border-border rounded text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Lock className="w-3 h-3" />
                      Secure & encrypted
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      placeholder="GCash number (09XX...)"
                      value={gcashNumber}
                      onChange={(e) => setGcashNumber(e.target.value)}
                      className="w-full px-2 py-1.5 bg-secondary border border-border rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded p-1.5 text-xs text-blue-700">
                      You'll get a prompt on your GCash app
                    </div>
                  </div>
                )}

                {/* Info Text */}
                <p className="text-xs text-muted-foreground bg-secondary/50 p-1.5 rounded">
                  ℹ️ Your share of fuel cost split evenly. No commission. After payment you're committed to the trip.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-2 p-3 border-t border-border bg-secondary/30">
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setCardData({ cardNumber: '', expiry: '', cvc: '', name: '' });
                    setGcashNumber('');
                  }}
                  disabled={processingPayment || getDeadlineStatus()?.isPassed}
                  className="flex-1 py-2 border border-border text-foreground rounded text-xs hover:bg-secondary transition-all font-semibold disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProcessPayment}
                  disabled={processingPayment || getDeadlineStatus()?.isPassed}
                  className={`flex-1 py-2 rounded text-xs transition-all font-semibold text-primary-foreground ${
                    getDeadlineStatus()?.isPassed 
                      ? 'bg-red-500 hover:bg-red-600 cursor-not-allowed'
                      : getDeadlineStatus()?.isUrgent
                      ? 'bg-orange-500 hover:bg-orange-600'
                      : 'bg-primary hover:bg-primary/90'
                  } disabled:opacity-50`}
                >
                  {processingPayment ? 'Processing...' : getDeadlineStatus()?.isPassed ? '❌ Deadline Passed' : `Agree & Request to Join`}
                </button>
              </div>
            </div>
          </div>
        )}

        <CreateRideModal
          isOpen={showCreateRide}
          onClose={() => setShowCreateRide(false)}
          onSubmit={handleCreateRide}
        />
      </div>
    </Layout>
  );
}
