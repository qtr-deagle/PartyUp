import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Send, Search, Phone, Video, MoreVertical, Plus, Mic, Smile } from 'lucide-react';

interface Message {
  id: number;
  sender: 'user' | 'other';
  text: string;
  timestamp: string;
  type?: 'text' | 'audio' | 'image';
}

interface Conversation {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  destination?: string;
  online?: boolean;
}

/**
 * PartyUp Chat Screen - Messenger Style
 * 
 * Design: Modern Messenger UI
 * - Clean conversation list with search
 * - Bubble-style messages
 * - Timestamp grouping
 * - Quick action buttons
 */
export default function Chat() {
  const [conversations] = useState<Conversation[]>([
    {
      id: 1,
      name: 'Mr. Harrington',
      avatar: '👨‍💼',
      lastMessage: 'Love to see you, Bardia',
      timestamp: '19:23',
      unread: 1,
      online: true,
    },
    {
      id: 2,
      name: 'Philip Mariano',
      avatar: '👨',
      lastMessage: 'Please let me know. Txt!',
      timestamp: '10:17',
      unread: 2,
      online: false,
    },
    {
      id: 3,
      name: 'David Jones',
      avatar: '👨‍🦱',
      lastMessage: 'Missed Call',
      timestamp: 'Yesterday',
      unread: 1,
      online: false,
    },
    {
      id: 4,
      name: 'Mrs. Frida',
      avatar: '👩',
      lastMessage: '❤️ ❤️ ❤️',
      timestamp: 'Yesterday',
      unread: 0,
      online: true,
    },
    {
      id: 5,
      name: 'Ciara Omar',
      avatar: '👩‍🦱',
      lastMessage: 'Very well. I\'ll call',
      timestamp: 'Sat',
      unread: 0,
      online: false,
    },
    {
      id: 6,
      name: 'Brian Kilich',
      avatar: '👨‍🎨',
      lastMessage: 'I\'ll be there at 8 AM.',
      timestamp: 'Sat',
      unread: 0,
      online: true,
    },
    {
      id: 7,
      name: 'Linda Soran',
      avatar: '👩‍🔬',
      lastMessage: 'Well done Linda!',
      timestamp: 'Fri',
      unread: 0,
      online: false,
    },
  ]);

  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(conversations[0]);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: 'other', text: 'Hi Dear Bardia!\nHow are you?', timestamp: '18:47', type: 'text' },
    { id: 2, sender: 'user', text: 'Thanks!', timestamp: '18:49', type: 'text' },
    { id: 3, sender: 'user', text: 'Did you review the proposal?', timestamp: '18:49', type: 'text' },
    { id: 4, sender: 'other', text: 'Yes! Agreed!', timestamp: '18:53', type: 'text' },
    { id: 5, sender: 'other', text: 'We need to redesign our website.', timestamp: '18:53', type: 'text' },
    { id: 6, sender: 'other', text: 'I think we should set a meeting\nto talk more 😊', timestamp: '18:53', type: 'text' },
    { id: 7, sender: 'user', text: '🎵 Audio message', timestamp: '19:01', type: 'audio' },
    { id: 8, sender: 'other', text: '🎵 Audio message', timestamp: '19:01', type: 'audio' },
  ]);

  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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
      <div className="md:hidden h-screen flex flex-col bg-background">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="sticky top-0 bg-card border-b border-border z-30 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <button onClick={() => setSelectedConversation(null)} className="text-primary text-2xl">←</button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-2xl">{selectedConversation.avatar}</div>
                    <div className="min-w-0">
                      <h2 className="text-lg font-bold text-foreground truncate">{selectedConversation.name}</h2>
                      {selectedConversation.online && (
                        <p className="text-xs text-muted-foreground">Active now</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-secondary rounded-full transition-smooth">
                  <Phone className="w-5 h-5 text-primary" />
                </button>
                <button className="p-2 hover:bg-secondary rounded-full transition-smooth">
                  <Video className="w-5 h-5 text-primary" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col">
              {/* Date Separator */}
              <div className="flex justify-center">
                <span className="text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full">Today</span>
              </div>

              {messages.map((message, index) => {
                const isNewGroup = index === 0 || messages[index - 1].sender !== message.sender;
                
                return (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-2xl text-sm leading-relaxed ${
                        message.sender === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-none'
                          : 'bg-secondary text-secondary-foreground rounded-bl-none'
                      }`}
                    >
                      {message.type === 'audio' ? (
                        <div className="flex items-center gap-2">
                          <button className="p-1 hover:opacity-80">
                            ▶
                          </button>
                          <div className="flex gap-0.5">
                            {[...Array(20)].map((_, i) => (
                              <div
                                key={i}
                                className="w-0.5 bg-current rounded-full"
                                style={{ height: `${Math.random() * 12 + 4}px` }}
                              ></div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{message.text}</p>
                      )}
                    </div>
                    {isNewGroup && (
                      <span className="text-xs text-muted-foreground ml-2 mt-auto">{message.timestamp}</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Message Input */}
            <div className="bg-card border-t border-border p-4 space-y-3">
              <div className="flex gap-2">
                <button className="p-2 hover:bg-secondary rounded-full transition-smooth">
                  <Plus className="w-6 h-6 text-primary" />
                </button>
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type Here..."
                  className="flex-1 px-4 py-2 bg-secondary rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button className="p-2 hover:bg-secondary rounded-full transition-smooth">
                  <Mic className="w-6 h-6 text-primary" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Conversations List Header */}
            <div className="sticky top-0 bg-card border-b border-border z-30 p-4">
              <h1 className="text-2xl font-bold text-foreground mb-4">Messages</h1>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-secondary rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  className="w-full p-3 border-b border-border hover:bg-secondary/30 transition-smooth text-left"
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-2xl flex-shrink-0">
                        {conversation.avatar}
                      </div>
                      {conversation.online && (
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-accent rounded-full border-2 border-card"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-sm text-foreground">{conversation.name}</h3>
                        <span className="text-xs text-muted-foreground">{conversation.timestamp}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{conversation.lastMessage}</p>
                    </div>
                    {conversation.unread > 0 && (
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {conversation.unread}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Floating Action Button */}
            <div className="absolute bottom-24 right-4">
              <button className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
                <Plus className="w-6 h-6" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Desktop View */}
      <div className="hidden md:flex h-screen bg-background">
        {/* Conversations Sidebar */}
        <div className="w-96 border-r border-border flex flex-col bg-card">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <h2 className="text-2xl font-bold text-foreground mb-4">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-secondary rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation)}
                className={`w-full p-4 border-b border-border hover:bg-secondary/50 transition-smooth text-left ${
                  selectedConversation?.id === conversation.id ? 'bg-secondary' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-2xl flex-shrink-0">
                      {conversation.avatar}
                    </div>
                    {conversation.online && (
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-accent rounded-full border-2 border-card"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-sm text-foreground">{conversation.name}</h3>
                      <span className="text-xs text-muted-foreground">{conversation.timestamp}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{conversation.lastMessage}</p>
                  </div>
                  {conversation.unread > 0 && (
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {conversation.unread}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* New Message Button */}
          <div className="p-4 border-t border-border">
            <button className="w-full py-3 bg-primary text-primary-foreground rounded-full font-medium transition-smooth hover:shadow-md flex items-center justify-center gap-2">
              <Plus className="w-5 h-5" />
              New Message
            </button>
          </div>
        </div>

        {/* Chat View */}
        {selectedConversation && (
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="p-6 border-b border-border flex items-center justify-between bg-card">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-2xl">
                    {selectedConversation.avatar}
                  </div>
                  {selectedConversation.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-accent rounded-full border-2 border-card"></div>
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{selectedConversation.name}</h2>
                  {selectedConversation.online && (
                    <p className="text-xs text-muted-foreground">Active now</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-secondary rounded-full transition-smooth">
                  <Phone className="w-5 h-5 text-primary" />
                </button>
                <button className="p-2 hover:bg-secondary rounded-full transition-smooth">
                  <Video className="w-5 h-5 text-primary" />
                </button>
                <button className="p-2 hover:bg-secondary rounded-full transition-smooth">
                  <MoreVertical className="w-5 h-5 text-primary" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col">
              {/* Date Separator */}
              <div className="flex justify-center">
                <span className="text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full">Today</span>
              </div>

              {messages.map((message, index) => {
                const isNewGroup = index === 0 || messages[index - 1].sender !== message.sender;
                
                return (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-md px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        message.sender === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-none'
                          : 'bg-secondary text-secondary-foreground rounded-bl-none'
                      }`}
                    >
                      {message.type === 'audio' ? (
                        <div className="flex items-center gap-2">
                          <button className="p-1 hover:opacity-80">
                            ▶
                          </button>
                          <div className="flex gap-0.5">
                            {[...Array(20)].map((_, i) => (
                              <div
                                key={i}
                                className="w-0.5 bg-current rounded-full"
                                style={{ height: `${Math.random() * 12 + 4}px` }}
                              ></div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{message.text}</p>
                      )}
                    </div>
                    {isNewGroup && (
                      <span className="text-xs text-muted-foreground ml-2 mt-auto">{message.timestamp}</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Message Input */}
            <div className="bg-card border-t border-border p-6">
              <div className="flex gap-3">
                <button className="p-2 hover:bg-secondary rounded-full transition-smooth">
                  <Plus className="w-6 h-6 text-primary" />
                </button>
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type Here..."
                  className="flex-1 px-4 py-2 bg-secondary rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  onClick={handleSendMessage}
                  className="p-2 hover:bg-secondary rounded-full transition-smooth"
                >
                  <Send className="w-6 h-6 text-primary" />
                </button>
                <button className="p-2 hover:bg-secondary rounded-full transition-smooth">
                  <Mic className="w-6 h-6 text-primary" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
