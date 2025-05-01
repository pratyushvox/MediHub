import React, { useState, useEffect, useRef } from 'react';
import { Search, MoreVertical, Phone, Video, Paperclip, Send, Smile, FileText, Check, CheckCheck } from 'lucide-react';
import PatientNavbar from '../../Component/Patientnavbar';
import Sidebar from '../../Component/Sidebar';
import axios from 'axios';
import io from 'socket.io-client';

const API_BASE_URL = 'http://localhost:4000/api';
const SOCKET_URL = 'http://localhost:4000';

function PatientChat() {
  const [activeTab, setActiveTab] = useState('individual');
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  
  const socketRef = useRef(null);
  const messageContainerRef = useRef(null);
  const patientId = localStorage.getItem('Userid');

  // Initialize socket connection
  useEffect(() => {
    if (!patientId) return;
  
    socketRef.current = io(SOCKET_URL);
    
    socketRef.current.on('connect', () => {
      console.log('Socket connected:', socketRef.current.id);
      socketRef.current.emit('join', { role: 'patient', userId: patientId });
    });
    
    socketRef.current.on('roomJoined', (data) => {
      console.log('Joined room:', data.roomName);
    });
    
    // Updated socket newMessage handler
    socketRef.current.on('newMessage', (message) => {
      console.log('New message received:', message);
      
      // Update chat list to show the most recent message
      setChats(prevChats => {
        return prevChats.map(chat => {
          if (chat._id === message.chatId) {
            // Check if message already exists in chat
            const messageExists = chat.messages?.some(msg => 
              msg._id === message._id || 
              (msg.content === message.content && 
               msg.sender === message.sender && 
               new Date(msg.createdAt).getTime() > new Date().getTime() - 10000)
            );
            
            if (messageExists) {
              return chat;
            }
    
            // Create an updated chat with the new message appended
            const updatedChat = {
              ...chat,
              messages: [...(chat.messages || []), message],
              updatedAt: new Date()
            };
            return updatedChat;
          }
          return chat;
        }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      });
      
      // If message belongs to current chat, add to messages if not already there
      if (selectedChat && message.chatId === selectedChat._id) {
        setMessages(prevMessages => {
          // Enhanced duplicate check with multiple conditions
          const exists = prevMessages.some(msg => 
            msg._id === message._id || 
            (msg.content === message.content && 
             msg.sender === message.sender && 
             new Date(msg.createdAt).getTime() > new Date().getTime() - 10000)
          );
          return exists ? prevMessages : [...prevMessages, message];
        });
        
        // Mark as read if we're looking at this chat and we're not the sender
        if (message.sender !== patientId) {
          markMessagesAsRead(selectedChat._id);
        }
      } else if (message.sender !== patientId) {
        // If we're not looking at this chat, increment unread count
        setUnreadCounts(prev => ({
          ...prev,
          [message.chatId]: (prev[message.chatId] || 0) + 1
        }));
      }
    });
    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [selectedChat, patientId]);

  // Fetch initial data
  useEffect(() => {
    if (patientId) {
      Promise.all([
        fetchPatientData(patientId),
        fetchDoctors(),
        fetchChats(patientId)
      ]).finally(() => setLoading(false));
    }
  }, [patientId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Fetch patient data
  const fetchPatientData = async (patientId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/${patientId}`);
      setPatientData(response.data);
      return response.data;
    } catch (err) {
      setError('Failed to fetch patient data');
      console.error(err);
      return null;
    }
  };

  // Fetch doctors list
  const fetchDoctors = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/doctor/getdoctor`);
      setDoctors(response.data);
      return response.data;
    } catch (err) {
      setError('Failed to fetch doctors');
      console.error(err);
      return [];
    }
  };

  // Fetch all chats for the patient
  const fetchChats = async (patientId) => {
    try {
      console.log(`Fetching chats for patient: ${patientId}`);
      const response = await axios.get(`${API_BASE_URL}/chat/${patientId}`);
      
      const sortedChats = response.data.sort((a, b) => 
        new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
      );
      
      console.log(`Fetched ${sortedChats.length} chats`);
      setChats(sortedChats);
      
      const counts = {};
      sortedChats.forEach(chat => {
        counts[chat._id] = (chat.unreadCount || 0);
      });
      
      setUnreadCounts(counts);
      return sortedChats;
    } catch (err) {
      console.error('Failed to fetch chats:', err);
      setError(`Failed to fetch chats: ${err.message}`);
      return [];
    }
  };

  // Mark messages as read
  const markMessagesAsRead = async (chatId) => {
    try {
      await axios.get(`${API_BASE_URL}/chat/${chatId}/messages`, {
        params: { userId: patientId }
      });
      
      setUnreadCounts(prev => ({
        ...prev,
        [chatId]: 0
      }));
      
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.sender !== patientId && msg.status === 'sent' 
            ? { ...msg, status: 'read' } 
            : msg
        )
      );
    } catch (err) {
      console.error('Failed to mark messages as read:', err);
    }
  };

  // Initialize or select chat with doctor
  const initializeChat = async (doctor) => {
    setSelectedDoctor(doctor);
    
    try {
      console.log(`Initializing chat with doctor: Dr. ${doctor.name} (${doctor._id})`);
      let existingChat = chats.find(chat => 
        chat.otherParticipant?._id === doctor._id
      );
      
      if (!existingChat) {
        existingChat = chats.find(chat => 
          chat.participants?.some(p => p.item === doctor._id)
        );
      }
      
      if (existingChat) {
        console.log(`Found existing chat: ${existingChat._id}`);
        setSelectedChat(existingChat);
        await fetchMessages(existingChat._id);
        await markMessagesAsRead(existingChat._id);
        return;
      }
      
      console.log(`Creating new chat with doctor: ${doctor._id}`);
      const response = await axios.post(`${API_BASE_URL}/chat`, {
        participants: [
          { item: patientId, model: 'User' },
          { item: doctor._id, model: 'Doctor' }
        ]
      });
      
      console.log(`New chat created: ${response.data._id}`);
      setSelectedChat(response.data);
      setMessages([]);
      setChats(prev => [response.data, ...prev]);
    } catch (err) {
      console.error('Failed to initialize chat:', err);
      setError(`Failed to initialize chat: ${err.message}`);
    }
  };

  // Fetch messages for selected chat
  const fetchMessages = async (chatId) => {
    try {
      console.log(`Fetching messages for chat: ${chatId}`);
      const response = await axios.get(`${API_BASE_URL}/chat/${chatId}/messages`, {
        params: { userId: patientId }
      });
      
      const messagesData = response.data.messages || [];
      console.log(`Fetched ${messagesData.length} messages`);
      setMessages(messagesData);
      return messagesData;
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      setError(`Failed to fetch messages: ${err.message}`);
      return [];
    }
  };

  // Updated send message function with better deduplication
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;
    
    try {
      const messageData = {
        chatId: selectedChat._id,
        sender: patientId,
        senderModel: 'User',
        content: newMessage.trim()
      };
      
      // Clear input before network request to improve UX
      const messageToBeSent = newMessage.trim();
      setNewMessage('');
      
      console.log(`Sending message to chat: ${selectedChat._id}`);
      const response = await axios.post(
        `${API_BASE_URL}/chat/${selectedChat._id}/messages`,
        messageData
      );
      
      const newMsg = {
        ...response.data,
        senderDetails: {
          name: patientData.name,
          profilePic: patientData.profilePic,
          id: patientId
        }
      };
      
      // Add message to the UI only if there's no duplicate already
      setMessages(prev => {
        // Check if this exact message already exists
        const isDuplicate = prev.some(msg => 
          msg._id === newMsg._id || 
          (msg.content === newMsg.content && 
           msg.sender === newMsg.sender && 
           new Date(msg.createdAt).getTime() > new Date().getTime() - 10000)
        );
        
        if (isDuplicate) {
          return prev;
        }
        return [...prev, newMsg];
      });
      
      // Update chats list with new message
      setChats(prev => {
        const updated = prev.map(chat => {
          if (chat._id === selectedChat._id) {
            // Check for duplicates in chat messages
            const messageExists = chat.messages?.some(msg => 
              msg._id === newMsg._id || 
              (msg.content === newMsg.content && 
               msg.sender === newMsg.sender && 
               new Date(msg.createdAt).getTime() > new Date().getTime() - 10000)
            );
            
            if (messageExists) {
              return chat;
            }
            
            return {
              ...chat,
              messages: [...(chat.messages || []), newMsg],
              updatedAt: new Date()
            };
          }
          return chat;
        }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        
        return updated;
      });
    } catch (err) {
      console.error('Failed to send message:', err);
      setError(`Failed to send message: ${err.message}`);
      // Restore message in input if sending failed
      setNewMessage(messageToBeSent);
    }
  };

  // Format timestamp for display
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format date for chat list
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  // Get last message preview for a doctor
  const getLastMessagePreview = (doctorId) => {
    const chat = chats.find(c => 
      c.otherParticipant?._id === doctorId || 
      c.participants?.some(p => p.item === doctorId)
    );
    
    if (!chat || !chat.messages || chat.messages.length === 0) {
      return 'No messages yet';
    }
    
    const lastMsg = chat.messages[chat.messages.length - 1];
    return lastMsg.content.length > 30 
      ? `${lastMsg.content.substring(0, 30)}...` 
      : lastMsg.content || (lastMsg.attachment ? 'Attachment' : 'No message content');
  };

  // Get last message time for a doctor
  const getLastMessageTime = (doctorId) => {
    const chat = chats.find(c => 
      c.otherParticipant?._id === doctorId || 
      c.participants?.some(p => p.item === doctorId)
    );
    
    if (!chat || !chat.messages || chat.messages.length === 0) {
      return '';
    }
    
    const lastMsg = chat.messages[chat.messages.length - 1];
    return formatTime(lastMsg.createdAt);
  };

  // Get unread count for a doctor
  const getUnreadCount = (doctorId) => {
    const chat = chats.find(c => 
      c.otherParticipant?._id === doctorId || 
      c.participants?.some(p => p.item === doctorId)
    );
    
    if (!chat) return 0;
    
    return unreadCounts[chat._id] || 0;
  };

  // Filter doctors based on search term
  const filteredUsers = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort doctors: put doctors with chats at top, then sort by recent activity
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const chatA = chats.find(c => 
      c.otherParticipant?._id === a._id || 
      c.participants?.some(p => p.item === a._id)
    );
    
    const chatB = chats.find(c => 
      c.otherParticipant?._id === b._id || 
      c.participants?.some(p => p.item === b._id)
    );
    
    if (chatA && !chatB) return -1;
    if (!chatA && chatB) return 1;
    
    if (chatA && chatB) {
      const lastMsgA = chatA.messages?.length > 0 ? 
        new Date(chatA.messages[chatA.messages.length - 1].createdAt) : 
        new Date(chatA.createdAt);
        
      const lastMsgB = chatB.messages?.length > 0 ? 
        new Date(chatB.messages[chatB.messages.length - 1].createdAt) : 
        new Date(chatB.createdAt);
        
      return lastMsgB - lastMsgA;
    }
    
    return a.name.localeCompare(b.name);
  });

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="text-red-500 mb-4">{error}</div>
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!patientData || doctors.length === 0) {
    return <div className="flex justify-center items-center h-screen">No data available</div>;
  }

  return (
    <div className="flex flex-col h-screen">
      <PatientNavbar patientData={patientData} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar role="patient" />
        
        {/* Main Chat Content */}
        <div className="flex flex-1 bg-gray-50">
          {/* Doctors Sidebar */}
          <div className="w-80 bg-white border-r border-gray-200">
            {/* User Profile */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img 
                    src={patientData.profilePic || 'https://via.placeholder.com/150'} 
                    alt="Profile" 
                    className="w-10 h-10 rounded-full object-cover" 
                  />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h3 className="font-medium">{patientData.name}</h3>
                  <span className="text-xs text-gray-500">Patient ID: {patientData.patientId}</span>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="p-3 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search doctors"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                className={`flex-1 py-3 text-sm font-medium ${
                  activeTab === 'individual'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500'
                }`}
                onClick={() => setActiveTab('individual')}
              >
                Individual
              </button>
              <button
                className={`flex-1 py-3 text-sm font-medium ${
                  activeTab === 'groups'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500'
                }`}
                onClick={() => setActiveTab('groups')}
              >
                Groups
              </button>
            </div>

            {/* Doctors List */}
            <div className="overflow-y-auto h-[calc(100vh-200px)]">
              {sortedUsers.map(doctor => {
                const unreadCount = getUnreadCount(doctor._id);
                return (
                  <div
                    key={doctor._id}
                    onClick={() => initializeChat(doctor)}
                    className={`p-3 flex items-center space-x-3 cursor-pointer hover:bg-gray-50 ${
                      selectedDoctor?._id === doctor._id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="relative">
                      <img 
                        src={doctor.profilePic || 'https://via.placeholder.com/150'} 
                        alt={doctor.name} 
                        className="w-12 h-12 rounded-full object-cover" 
                      />
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-medium truncate">Dr. {doctor.name}</h3>
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                          {getLastMessageTime(doctor._id)}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <p className="text-sm text-gray-500 truncate">
                          {getLastMessagePreview(doctor._id)}
                        </p>
                        <span className="text-xs text-gray-400 ml-1">
                          {doctor.specialist?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shrink-0">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chat Area */}
          {selectedDoctor ? (
            <div className="flex-1 flex flex-col">
              {/* Chat Header */}
              <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img 
                    src={selectedDoctor.profilePic || 'https://via.placeholder.com/150'} 
                    alt={selectedDoctor.name} 
                    className="w-10 h-10 rounded-full object-cover" 
                  />
                  <div>
                    <h2 className="font-medium">Dr. {selectedDoctor.name}</h2>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-xs text-gray-500">Online</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    <Phone className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    <Video className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    <MoreVertical className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div 
                className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
                ref={messageContainerRef}
              >
                {messages.length === 0 ? (
                  <div className="flex justify-center items-center h-full text-gray-400">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((message, index) => {
                    const isPatient = message.senderModel === 'User' || message.sender === patientId;
                    const showDay = index === 0 || (
                      new Date(message.createdAt).toDateString() !== 
                      new Date(messages[index - 1].createdAt).toDateString()
                    );
                    
                    return (
                      <React.Fragment key={message._id || index}>
                        {showDay && (
                          <div className="flex justify-center my-4">
                            <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                              {formatDate(message.createdAt)}
                            </div>
                          </div>
                        )}
                        <div className={`flex ${isPatient ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] rounded-lg p-3 ${
                            isPatient
                              ? 'bg-white text-gray-800 border border-gray-200'
                              : 'bg-blue-500 text-white'
                          }`}>
                            <p>{message.content}</p>
                            <div className={`flex items-center justify-end space-x-1 mt-1 text-xs ${
                              isPatient ? 'text-gray-500' : 'text-blue-100'
                            }`}>
                              <span>{formatTime(message.createdAt)}</span>
                              {isPatient && (
                                message.status === 'read' 
                                  ? <CheckCheck className="w-3 h-3" /> 
                                  : <Check className="w-3 h-3" />
                              )}
                            </div>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })
                )}
              </div>

              {/* Message Input */}
              <div className="bg-white border-t border-gray-200 p-4">
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    <Paperclip className="w-5 h-5 text-gray-500" />
                  </button>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          sendMessage();
                        }
                      }}
                      placeholder="Type a message..."
                      className="w-full py-2 px-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button className="absolute right-3 top-2.5">
                      <Smile className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                  <button
                    className={`p-2 rounded-full ${
                      newMessage.trim()
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || !selectedChat}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center p-6 max-w-md">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-blue-500" />
                </div>
                <h2 className="text-xl font-medium text-gray-800 mb-2">Start Messaging</h2>
                <p className="text-gray-500">Select a doctor from the list to start a conversation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PatientChat;