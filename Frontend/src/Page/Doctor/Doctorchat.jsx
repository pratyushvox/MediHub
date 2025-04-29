import React, { useState, useEffect, useRef } from 'react';
import { Search, MoreVertical, Phone, Video, Paperclip, Send, Smile, FileText, Check, CheckCheck } from 'lucide-react';
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
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [doctorData, setDoctorData] = useState(null);
  const [users, setUsers] = useState([]);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const socketRef = useRef(null);
  const messageContainerRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    const doctorId = localStorage.getItem('doctorId');
    if (!doctorId) return;
  
    socketRef.current = io(SOCKET_URL);
    
    socketRef.current.on('connect', () => {
      console.log('Socket connected:', socketRef.current.id);
      socketRef.current.emit('join', { role: 'doctor', userId: doctorId });
    });
    
    socketRef.current.on('roomJoined', (data) => {
      console.log('Joined room:', data.roomName);
    });
    
    socketRef.current.on('newMessage', (message) => {
      if (message.sender !== doctorId) {
        setMessages(prev => {
          if (!prev.some(m => m._id === message._id)) {
            return [...prev, message];
          }
          return prev;
        });
      }
    });
    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Fetch initial data
  useEffect(() => {
    const doctorId = localStorage.getItem('doctorId');
    if (doctorId) {
      fetchDoctorData(doctorId);
      fetchUsers();
      fetchChats(doctorId);
    }
  }, []);

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
    } catch (err) {
      setError('Failed to fetch doctor data');
      console.error(err);
    }
  };

  // Fetch users list
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/users`);
      setUsers(response.data);
    } catch (err) {
      setError('Failed to fetch users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all chats for the doctor
  const fetchChats = async (doctorId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/chat/${doctorId}`);
      setChats(response.data);
    } catch (err) {
      console.error('Failed to fetch chats:', err);
    }
  };

  // Find or create chat with user
  const initializeChat = async (user) => {
    setSelectedUser(user);
    
    try {
      const existingChat = chats.find(chat => 
        chat.participants.some(p => p.item === user._id)
      );
      
      if (existingChat) {
        setSelectedChat(existingChat);
        fetchMessages(existingChat._id);
        return;
      }
      
      const doctorId = localStorage.getItem('doctorId');
      const response = await axios.post(`${API_BASE_URL}/chat`, {
        participants: [
          { item: doctorId, model: 'Doctor' },
          { item: user._id, model: 'User' }
        ]
      });
      
      setSelectedChat(response.data);
      setChats(prev => [...prev, response.data]);
      setMessages([]);
    } catch (err) {
      console.error('Failed to initialize chat:', err);
    }
  };

  // Fetch messages for selected chat
  const fetchMessages = async (chatId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/chat/${chatId}/messages`);
      setMessages(response.data);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  };

  // Send a new message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;
    
    const doctorId = localStorage.getItem('doctorId');
    
    try {
      const response = await axios.post(
        `${API_BASE_URL}/chat/${selectedChat._id}/messages`,
        {
          chatId: selectedChat._id,
          sender: doctorId,
          senderModel: 'Doctor',
          content: newMessage,
          attachment: null
        }
      );
      
      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
  
      socketRef.current.emit('sendMessage', {
        chatId: selectedChat._id,
        message: response.data
      });
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  // Format timestamp for display
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  }

  if (!doctorData || users.length === 0) {
    return <div className="flex justify-center items-center h-screen">No data available</div>;
  }

  return (
    <div className="flex flex-col h-screen">
      <DoctorNavbar doctorData={doctorData} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar role="doctor" />
        
        <div className="flex flex-1 bg-gray-50">
          {/* Sidebar */}
          <div className="w-80 bg-white border-r border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img 
                    src={doctorData.profilePic || 'https://via.placeholder.com/150'} 
                    alt="Profile" 
                    className="w-10 h-10 rounded-full" 
                  />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h3 className="font-medium">Dr. {doctorData.name}</h3>
                  <span className="text-xs text-gray-500">{doctorData.specialist.replace('_', ' ')}</span>
                </div>
              </div>
            </div>

            <div className="p-3 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

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

            <div className="overflow-y-auto h-[calc(100vh-200px)]">
              {filteredUsers.map(user => (
                <div
                  key={user._id}
                  onClick={() => initializeChat(user)}
                  className={`p-3 flex items-center space-x-3 cursor-pointer hover:bg-gray-50 ${
                    selectedUser?._id === user._id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="relative">
                    <img 
                      src={user.profilePic || 'https://via.placeholder.com/150'} 
                      alt={user.name} 
                      className="w-12 h-12 rounded-full" 
                    />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{user.name}</h3>
                    <p className="text-sm text-gray-500 truncate">User ID: {user.patientId}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedUser ? (
            <div className="flex-1 flex flex-col">
              <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img 
                    src={selectedUser.profilePic || 'https://via.placeholder.com/150'} 
                    alt={selectedUser.name} 
                    className="w-10 h-10 rounded-full" 
                  />
                  <div>
                    <h2 className="font-medium">{selectedUser.name}</h2>
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

              <div 
                className="flex-1 overflow-y-auto p-4 space-y-4"
                ref={messageContainerRef}
              >
                {messages.map((message, index) => {
                  const isDoctor = message.senderModel === 'Doctor';
                  return (
                    <div 
                      key={message._id || index} 
                      className={`flex ${isDoctor ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] rounded-lg p-3 ${
                        isDoctor
                          ? 'bg-white text-gray-800 border border-gray-200'
                          : 'bg-blue-500 text-white'
                      }`}>
                        <p>{message.content}</p>
                        {message.attachment && (
                          <div className={`mt-2 p-2 rounded flex items-center space-x-2 ${
                            isDoctor ? 'bg-gray-100' : 'bg-blue-600'
                          }`}>
                            <FileText className="w-4 h-4" />
                            <span className="text-sm">{message.attachment}</span>
                          </div>
                        )}
                        <div className={`flex items-center justify-end space-x-1 mt-1 text-xs ${
                          isDoctor ? 'text-gray-500' : 'text-blue-100'
                        }`}>
                          <span>{formatTime(message.createdAt)}</span>
                          {isDoctor && (
                            message.status === 'read' ? <CheckCheck className="w-4 h-4" /> : <Check className="w-4 h-4" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

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
              <p className="text-gray-500">Select a user to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DoctorChat;