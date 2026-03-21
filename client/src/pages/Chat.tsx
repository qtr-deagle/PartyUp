import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Send, Search, Phone, Video, MapPin, AlertTriangle, Flag, ArrowLeft, Zap, MessageCircle, X } from 'lucide-react';

interface Message {
  id: number;
  sender: 'user' | 'other';
  text: string;
  timestamp: string;
  type?: 'text' | 'audio';
}

interface Conversation {
  id: number;
  name: string;
  age: number;
  destination: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  online?: boolean;
  rating: number;
  verified: boolean;
}

/**
 * PartyUp Chat Screen - Secure Messaging
 * 
 * Design: Professional, Safe Communication
 * - Dark gradient theme (navy → teal)
 * - Safety features: Location sharing, warning alert, report user
 * - Glassmorphic cards with teal accents
 * - Secure messaging indicators
 */
export default function Chat() {
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [conversations] = useState<Conversation[]>([
    {
      id: 1,
      name: 'Sarah',
      age: 24,
      destination: 'Boracay',
      lastMessage: 'See you there! 🏖️',
      timestamp: '19:23',
      unread: 1,
      online: true,
      rating: 4.8,
      verified: true,
    },
    {
      id: 2,
      name: 'Mike',
      age: 26,
      destination: 'Tagaytay',
      lastMessage: 'Leaving in 30 mins',
      timestamp: '10:17',
      unread: 0,
      online: false,
      rating: 4.6,
      verified: true,
    },
    {
      id: 3,
      name: 'Emma',
      age: 23,
      destination: 'Batangas',
      lastMessage: 'What time are we meeting?',
      timestamp: 'Yesterday',
      unread: 2,
      online: true,
      rating: 4.9,
      verified: true,
    },
  ]);

  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: 'other', text: 'Hi! Are you ready for the trip?', timestamp: '18:47', type: 'text' },
    { id: 2, sender: 'user', text: 'Yes! See you soon 🎉', timestamp: '18:49', type: 'text' },
    { id: 3, sender: 'other', text: 'Great! I will share my location', timestamp: '18:50', type: 'text' },
  ]);

  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [shareLocation, setShareLocation] = useState(false);

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      setMessages([
        ...messages,
        {
          id: messages.length + 1,
          sender: 'user',
          text: messageInput,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'text',
        },
      ]);
      setMessageInput('');
    }
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      {/* Mobile View */}
      <div className="md:hidden h-screen flex flex-col bg-card">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="sticky top-0 bg-card border-b border-border z-30 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <button onClick={() => setSelectedConversation(null)} className="text-primary text-2xl">
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary/30 border-primary/50 flex items-center justify-center font-bold text-primary text-sm shrink-0 border-2">
                      {selectedConversation.name[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-bold text-foreground">{selectedConversation.name}, {selectedConversation.age}</h2>
                        {selectedConversation.verified && (
                          <span className="text-accent text-xs">✓</span>
                        )}
                      </div>
                      {selectedConversation.online && (
                        <p className="text-xs text-primary">Active now</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <button className="w-9 h-9 flex items-center justify-center hover:bg-secondary rounded-full transition-all">
                  <Phone className="w-4 h-4 text-primary" />
                </button>
                <button className="w-9 h-9 flex items-center justify-center hover:bg-secondary rounded-full transition-all">
                  <Video className="w-4 h-4 text-primary" />
                </button>
              </div>
            </div>

            {/* Safety Bar */}
            <div className="px-4 py-2 bg-primary/10 border-b border-border flex gap-2 text-xs">
              <button
                onClick={() => setShareLocation(!shareLocation)}
                className={`flex items-center gap-1 px-2 py-1.5 rounded-lg transition-all ${
                  shareLocation
                    ? 'bg-primary/20 text-primary'
                    : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                }`}
              >
                <MapPin className="w-3 h-3" />
                Location
              </button>
              <button className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-yellow-200/30 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-200/50 transition-all">
                <AlertTriangle className="w-3 h-3" />
                Warning
              </button>
              <button className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-destructive/20 text-destructive hover:bg-destructive/30 transition-all ml-auto">
                <Flag className="w-3 h-3" />
                Report
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 pb-28 space-y-3 flex flex-col">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-none font-medium shadow-md'
                        : 'bg-secondary border border-border text-foreground rounded-bl-none'
                    }`}
                  >
                    <p>{message.text}</p>
                    <span className={`text-xs mt-1 block ${
                      message.sender === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    }`}>
                      {message.timestamp}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Location Sharing Indicator */}
            {shareLocation && (
              <div className="px-4 py-2 bg-primary/10 border-y border-primary/20 flex items-center gap-2 text-xs text-primary">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                <span>📍 Sharing your location with {selectedConversation.name}</span>
              </div>
            )}

            {/* Message Input */}
            <div className="bg-card border-t border-border p-4 space-y-2 sticky bottom-16 z-30">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type message..."
                  className="flex-1 px-4 py-2.5 bg-secondary border border-border rounded-full text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  onClick={handleSendMessage}
                  className="w-10 h-10 flex items-center justify-center bg-primary text-primary-foreground rounded-full hover:shadow-lg hover:shadow-primary/50 transition-all hover:bg-primary/90"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="sticky top-0 bg-card border-b border-border z-30 p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-secondary border border-border rounded-full text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  className="w-full p-4 border-b border-border hover:bg-secondary/40 transition-all text-left"
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-primary/30 border-primary/50 flex items-center justify-center font-bold text-primary text-sm shrink-0 border-2">
                        {conversation.name[0]}
                      </div>
                      {conversation.online && (
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-accent rounded-full border-2 border-card"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-foreground">{conversation.name}, {conversation.age}</h3>
                          {conversation.verified && (
                            <span className="text-accent text-xs">✓</span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">{conversation.timestamp}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mb-1">{conversation.lastMessage}</p>
                      <div className="flex items-center gap-1 text-xs text-primary">
                        <span>📍 {conversation.destination}</span>
                      </div>
                    </div>
                    {conversation.unread > 0 && (
                      <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                        {conversation.unread}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Desktop View */}
      <div className="hidden md:flex h-screen bg-background">
        {/* Conversations Sidebar */}
        <div className="w-96 border-r border-border flex flex-col bg-card">
          <div className="p-6 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-secondary border border-border rounded-full text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation)}
                className={`w-full p-4 border-b border-border hover:bg-secondary/40 transition-all text-left ${
                  selectedConversation?.id === conversation.id ? 'bg-primary/10 border-primary/30' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full bg-primary/30 border-primary/50 flex items-center justify-center font-bold text-primary shrink-0 border-2">
                      {conversation.name[0]}
                    </div>
                    {conversation.online && (
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-accent rounded-full border-2 border-card"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-foreground">{conversation.name}, {conversation.age}</h3>
                        {conversation.verified && (
                          <span className="text-accent text-xs">✓</span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">{conversation.timestamp}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mb-1">{conversation.lastMessage}</p>
                    <div className="flex items-center gap-1 text-xs text-primary">
                      <MapPin className="w-3 h-3" /> {conversation.destination}
                    </div>
                  </div>
                  {conversation.unread > 0 && (
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                      {conversation.unread}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat View */}
        {selectedConversation ? (
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="p-6 border-b border-border flex items-center justify-between bg-card">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-primary/30 border-primary/50 flex items-center justify-center font-bold text-primary text-lg border-2">
                    {selectedConversation.name[0]}
                  </div>
                  {selectedConversation.online && (
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-accent rounded-full border-2 border-card"></div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-bold text-foreground">{selectedConversation.name}, {selectedConversation.age}</h2>
                    {selectedConversation.verified && (
                      <span className="text-accent text-sm">✓ Verified</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>📍 {selectedConversation.destination}</span>
                    <span>⭐ {selectedConversation.rating}</span>
                    {selectedConversation.online && <span className="text-primary">● Active</span>}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="w-11 h-11 flex items-center justify-center hover:bg-secondary rounded-full transition-all border border-border">
                  <Phone className="w-5 h-5 text-primary" />
                </button>
                <button className="w-11 h-11 flex items-center justify-center hover:bg-secondary rounded-full transition-all border border-border">
                  <Video className="w-5 h-5 text-primary" />
                </button>
                <button
                  onClick={() => setShareLocation(!shareLocation)}
                  className={`w-11 h-11 flex items-center justify-center rounded-full transition-all border ${
                    shareLocation
                      ? 'bg-primary/20 border-primary/50 text-primary'
                      : 'hover:bg-secondary border-border text-primary'
                  }`}
                >
                  <MapPin className="w-5 h-5" />
                </button>
                <button className="w-11 h-11 flex items-center justify-center hover:bg-destructive/10 rounded-full transition-all border border-border">
                  <Flag className="w-5 h-5 text-destructive" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-md px-5 py-3.5 rounded-2xl text-sm leading-relaxed ${
                      message.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none font-medium shadow-lg shadow-blue-600/20'
                        : 'bg-gray-200 border border-gray-300 text-gray-900 rounded-bl-none'
                    }`}
                  >
                    <p>{message.text}</p>
                    <span className={`text-xs mt-2 block ${
                      message.sender === 'user' ? 'text-white/70' : 'text-gray-600'
                    }`}>
                      {message.timestamp}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Location Sharing Indicator */}
            {shareLocation && (
              <div className="px-6 py-3 bg-blue-50 border-y border-blue-200 flex items-center gap-2 text-sm text-blue-600 font-medium">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></div>
                <span>📍 Sharing your live location with {selectedConversation.name}</span>
              </div>
            )}

            {/* Message Input */}
            <div className="bg-white border-t border-slate-200 p-6">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type message..."
                  className="flex-1 px-5 py-2.5 bg-gray-100 border border-gray-300 rounded-full text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSendMessage}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-full hover:shadow-lg hover:shadow-blue-600/50 transition-all font-semibold flex items-center gap-2 hover:bg-blue-700"
                >
                  <Send className="w-4 h-4" />
                  Send
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Empty State
          <div className="flex-1 flex items-center justify-center bg-background">
            <div className="text-center max-w-md px-6">
              <div className="w-32 h-32 rounded-full border-4 border-primary/20 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-16 h-16 text-primary" strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Your messages</h2>
              <p className="text-muted-foreground mb-4">Send a message to start a chat.</p>
              <button
                onClick={() => setShowNewMessageModal(true)}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30"
              >
                Send message
              </button>
            </div>
          </div>
        )}
      </div>

      {/* New Message Modal */}
      {showNewMessageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">New message</h2>
              <button
                onClick={() => setShowNewMessageModal(false)}
                className="p-2 hover:bg-secondary rounded-full transition-all"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-6 border-b border-border">
              <label className="block text-sm font-semibold text-foreground mb-2">To:</label>
              <input
                type="text"
                placeholder="Search..."
                autoFocus
                className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Suggested Users */}
            <div className="flex-1 overflow-y-auto p-6">
              <h3 className="text-sm font-semibold text-muted-foreground mb-4">Suggested</h3>
              <div className="space-y-2">
                {conversations.slice(0, 3).map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => {
                      setSelectedConversation(conv);
                      setShowNewMessageModal(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 hover:bg-secondary rounded-lg transition-all text-left group"
                  >
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-primary/30 flex items-center justify-center font-bold text-primary">
                        {conv.name[0]}
                      </div>
                      {conv.online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-accent rounded-full border-2 border-card"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm text-foreground">{conv.name}</h4>
                        {conv.verified && (
                          <span className="text-accent text-xs">✓</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{conv.destination}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full border-2 border-border group-hover:border-primary transition-all"></div>
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-border">
              <button
                onClick={() => {
                  // Handle chat creation logic here
                  setShowNewMessageModal(false);
                }}
                className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all font-semibold shadow-lg shadow-primary/20"
              >
                Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
