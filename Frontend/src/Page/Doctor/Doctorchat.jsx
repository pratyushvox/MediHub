import React, { useState, useEffect, useRef } from 'react';
import { Search, MoreVertical, Send, Smile, FileText, Check, CheckCheck } from 'lucide-react';
import DoctorNavbar from '../../Component/Docnavbar';
import Sidebar from '../../Component/Sidebar';
import axios from 'axios';
import io from 'socket.io-client';

const API_BASE_URL = 'http://localhost:4000/api';
const SOCKET_URL = 'http://localhost:4000';

function DoctorChat() {
  const [activeTab, setActiveTab] = useState('individual');
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [doctorData, setDoctorData] = useState(null);
  const [patients, setPatients] = useState([]);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  
  const socketRef = useRef(null);
  const messageContainerRef = useRef(null);
  const doctorId = localStorage.getItem('doctorId');

  // Initialize socket connection
  useEffect(() => {
    if (!doctorId) return;
  
    socketRef.current = io(SOCKET_URL);
    
    socketRef.current.on('connect', () => {
      console.log('Socket connected:', socketRef.current.id);
      socketRef.current.emit('join', { role: 'doctor', userId: doctorId });
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
        if (message.sender !== doctorId) {
          markMessagesAsRead(selectedChat._id);
        }
      } else if (message.sender !== doctorId) {
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
  }, [selectedChat, doctorId]);

  // Fetch initial data
  useEffect(() => {
    if (doctorId) {
      Promise.all([
        fetchDoctorData(doctorId),
        fetchPatients(),
        fetchChats(doctorId)
      ]).finally(() => setLoading(false));
    }
  }, [doctorId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Fetch doctor data
  const fetchDoctorData = async (doctorId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/doctor/${doctorId}`);
      setDoctorData(response.data);
      return response.data;
    } catch (err) {
      setError('Failed to fetch doctor data');
      console.error(err);
      return null;
    }
  };

  // Fetch patients list
  const fetchPatients = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/users`);
      setPatients(response.data);
      return response.data;
    } catch (err) {
      setError('Failed to fetch patients');
      console.error(err);
      return [];
    }
  };

  // Fetch all chats for the doctor
  const fetchChats = async (doctorId) => {
    try {
      console.log(`Fetching chats for doctor: ${doctorId}`);
      const response = await axios.get(`${API_BASE_URL}/chat/${doctorId}`);
      
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
        params: { userId: doctorId }
      });
      
      setUnreadCounts(prev => ({
        ...prev,
        [chatId]: 0
      }));
      
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.sender !== doctorId && msg.status === 'sent' 
            ? { ...msg, status: 'read' } 
            : msg
        )
      );
    } catch (err) {
      console.error('Failed to mark messages as read:', err);
    }
  };

  // Initialize or select chat with patient
  const initializeChat = async (patient) => {
    setSelectedPatient(patient);
    
    try {
      console.log(`Initializing chat with patient: ${patient.name} (${patient._id})`);
      let existingChat = chats.find(chat => 
        chat.otherParticipant?._id === patient._id
      );
      
      if (!existingChat) {
        existingChat = chats.find(chat => 
          chat.participants?.some(p => p.item === patient._id)
        );
      }
      
      if (existingChat) {
        console.log(`Found existing chat: ${existingChat._id}`);
        setSelectedChat(existingChat);
        await fetchMessages(existingChat._id);
        await markMessagesAsRead(existingChat._id);
        return;
      }
      
      console.log(`Creating new chat with patient: ${patient._id}`);
      const response = await axios.post(`${API_BASE_URL}/chat`, {
        participants: [
          { item: doctorId, model: 'Doctor' },
          { item: patient._id, model: 'User' }
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
        params: { userId: doctorId }
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
        sender: doctorId,
        senderModel: 'Doctor',
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
          name: doctorData.name,
          profilePic: doctorData.profilePic,
          id: doctorId
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

  // Get last message preview for a patient
  const getLastMessagePreview = (patientId) => {
    const chat = chats.find(c => 
      c.otherParticipant?._id === patientId || 
      c.participants?.some(p => p.item === patientId)
    );
    
    if (!chat || !chat.messages || chat.messages.length === 0) {
      return 'No messages yet';
    }
    
    const lastMsg = chat.messages[chat.messages.length - 1];
    return lastMsg.content.length > 30 
      ? `${lastMsg.content.substring(0, 30)}...` 
      : lastMsg.content || (lastMsg.attachment ? 'Attachment' : 'No message content');
  };

  // Get last message time for a patient
  const getLastMessageTime = (patientId) => {
    const chat = chats.find(c => 
      c.otherParticipant?._id === patientId || 
      c.participants?.some(p => p.item === patientId)
    );
    
    if (!chat || !chat.messages || chat.messages.length === 0) {
      return '';
    }
    
    const lastMsg = chat.messages[chat.messages.length - 1];
    return formatTime(lastMsg.createdAt);
  };

  // Get unread count for a patient
  const getUnreadCount = (patientId) => {
    const chat = chats.find(c => 
      c.otherParticipant?._id === patientId || 
      c.participants?.some(p => p.item === patientId)
    );
    
    if (!chat) return 0;
    
    return unreadCounts[chat._id] || 0;
  };

  // Filter patients based on search term
  const filteredUsers = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort patients: put patients with chats at top, then sort by recent activity
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

  if (!doctorData || patients.length === 0) {
    return <div className="flex justify-center items-center h-screen">No data available</div>;
  }

  return (
    <div className="flex flex-col h-screen">
      <DoctorNavbar doctorData={doctorData} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar role="doctor" />
        
        {/* Main Chat Content */}
        <div className="flex flex-1 bg-gray-50">
          {/* Patients Sidebar */}
          <div className="w-80 bg-white border-r border-gray-200">
            {/* User Profile */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img 
                    src={doctorData.profilePic || 'https://via.placeholder.com/150'} 
                    alt="Profile" 
                    className="w-10 h-10 rounded-full object-cover" 
                  />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h3 className="font-medium">Dr. {doctorData.name}</h3>
                  <span className="text-xs text-gray-500">{doctorData.specialist?.replace('_', ' ') || 'Specialist'}</span>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="p-3 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search patients"
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

            {/* Patients List */}
            <div className="overflow-y-auto h-[calc(100vh-200px)]">
              {sortedUsers.map(patient => {
                const unreadCount = getUnreadCount(patient._id);
                return (
                  <div
                    key={patient._id}
                    onClick={() => initializeChat(patient)}
                    className={`p-3 flex items-center space-x-3 cursor-pointer hover:bg-gray-50 ${
                      selectedPatient?._id === patient._id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="relative">
                      <img 
                        src={patient.profilePic || 'https://via.placeholder.com/150'} 
                        alt={patient.name} 
                        className="w-12 h-12 rounded-full object-cover" 
                      />
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-medium truncate">{patient.name}</h3>
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                          {getLastMessageTime(patient._id)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {getLastMessagePreview(patient._id)}
                      </p>
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
          {selectedPatient ? (
            <div className="flex-1 flex flex-col">
              {/* Chat Header */}
              <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img 
                    src={selectedPatient.profilePic || 'https://via.placeholder.com/150'} 
                    alt={selectedPatient.name} 
                    className="w-10 h-10 rounded-full object-cover" 
                  />
                  <div>
                    <h2 className="font-medium">{selectedPatient.name}</h2>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-xs text-gray-500">Online</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
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
                    const isDoctor = message.senderModel === 'Doctor' || message.sender === doctorId;
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
                        <div className={`flex ${isDoctor ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] rounded-lg p-3 ${
                            isDoctor
                              ? 'bg-white text-gray-800 border border-gray-200'
                              : 'bg-blue-500 text-white'
                          }`}>
                            <p>{message.content}</p>
                            <div className={`flex items-center justify-end space-x-1 mt-1 text-xs ${
                              isDoctor ? 'text-gray-500' : 'text-blue-100'
                            }`}>
                              <span>{formatTime(message.createdAt)}</span>
                              {isDoctor && (
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
                <p className="text-gray-500">Select a patient from the list to start a conversation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DoctorChat;