import React, { useRef, useState, useEffect } from 'react';
import { Search, Plus, X, Loader2 } from 'lucide-react';
import { Documentcard } from '../../Component/Documentcard';
import Sidebar from '../../Component/Sidebar';
import PatientNavbar from '../../Component/Patientnavbar';
import { toast } from 'react-toastify';

export function DocumentList() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [selectedDocToDelete, setSelectedDocToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All Document Types');
  const [sortOption, setSortOption] = useState('Newest First');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [userEmails, setUserEmails] = useState({});
  const fileInputRef = useRef(null);

  // Get current user ID from localStorage
  const getUserId = () => {
    const userId = localStorage.getItem('Userid');
    if (!userId) {
      toast.error('User not authenticated');
      return null;
    }
    return userId;
  };

  const fetchUserEmail = async (userId) => {
    if (userEmails[userId]) return; // Already fetched
    
    try {
      const res = await fetch(`http://localhost:4000/api/users/${userId}`);
      if (!res.ok) throw new Error('Failed to fetch user email');
      const user = await res.json();
      setUserEmails(prev => ({...prev, [userId]: user.email}));
    } catch (err) {
      console.error(`Error fetching email for user ${userId}:`, err);
      setUserEmails(prev => ({...prev, [userId]: 'Email not available'}));
    }
  };
  useEffect(() => {
    if (documents.length > 0) {
      documents.forEach(doc => {
        fetchUserEmail(doc.userId);
      });
    }
  }, [documents]);

  // Fetch documents from backend for current user
  useEffect(() => {
    
    const fetchDocuments = async () => {
      const userId = getUserId();
      if (!userId) return;

      setIsLoading(true);
      try {
        const res = await fetch(`http://localhost:4000/api/files?userId=${userId}`);
        if (!res.ok) throw new Error('Failed to fetch documents');
        
        const data = await res.json();
        setDocuments(data);
      } catch (err) {
        console.error('Error fetching documents:', err);
        toast.error('Failed to fetch documents');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDocuments();
  }, []);

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const userId = getUserId();
    if (!userId) return;
  
    // Validate file size
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit');
      return;
    }
  
    const formData = new FormData();
    formData.append('document', file);
    formData.append('userId', userId);
  
    setIsUploading(true);
    try {
      const res = await fetch(`http://localhost:4000/api/files/upload?userId=${userId}`, {
        method: 'POST',
        body: formData,
      });
  

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Upload failed');
      }
      
      const data = await res.json();

      // Add uploaded file to list
      setDocuments((prev) => [data.file, ...prev]);
      setIsDialogOpen(false);
      toast.success('Document uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload document');
    } finally {
      setIsUploading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const handleDownload = async (filename, originalname) => {
    const userId = getUserId();
    if (!userId) return;

    try {
      const res = await fetch(
        `http://localhost:4000/api/files/download/${filename}?userId=${userId}`
      );
      
      if (!res.ok) {
        if (res.status === 403) throw new Error('You are not authorized to download this file');
        throw new Error('Download failed');
      }

      const blob = await res.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = originalname || filename.split('-').slice(2).join('-');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Document downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error(error.message || 'Failed to download document');
    }
  };

  const handleDelete = async (filename) => {
    const userId = getUserId();
    if (!userId) return;

    try {
      const res = await fetch(
        `http://localhost:4000/api/files/${filename}?userId=${userId}`,
        { method: 'DELETE' }
      );

      if (!res.ok) {
        if (res.status === 403) throw new Error('You are not authorized to delete this file');
        throw new Error('Delete failed');
      }

      // Remove deleted document from the list
      setDocuments((prev) => prev.filter((doc) => doc.filename !== filename));
      toast.success('Document deleted successfully');
      setSelectedDocToDelete(null);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Failed to delete document');
    }
  };

  const openDeleteDialog = (filename) => {
    setSelectedDocToDelete(filename);
  };

  const closeDeleteDialog = () => {
    setSelectedDocToDelete(null);
  };

  // Extract unique document types for filter dropdown
  const documentTypes = ['All Document Types', ...new Set(documents.map(doc => doc.type || 'Unknown'))];

  // Filter and sort documents
  const filteredDocuments = documents
    .filter((doc) => {
      const matchesSearch = doc.originalname.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'All Document Types' || (doc.type || 'Unknown') === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch (sortOption) {
        case 'Newest First':
          return new Date(b.uploadDate) - new Date(a.uploadDate);
        case 'Oldest First':
          return new Date(a.uploadDate) - new Date(b.uploadDate);
        case 'Name A-Z':
          return a.originalname.localeCompare(b.originalname);
        case 'Name Z-A':
          return b.originalname.localeCompare(a.originalname);
        default:
          return 0;
      }
    });

  return (
    <div className="flex">
      <div className="fixed left-0 top-0 h-screen w-64 z-40">
        <Sidebar role="patient" />
      </div>

      <div className="flex flex-col w-full bg-gray-100 min-h-screen ml-64">
        <div className="fixed top-0 left-64 right-0 z-30">
          <PatientNavbar pageTitle="Document Management" />
        </div>

        <div className="pt-16 p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mt-10">Document Management</h1>
              <p className="mt-1 text-sm text-gray-500">Add, Organize & access Your documents here.</p>
            </div>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
              onClick={() => setIsDialogOpen(true)}
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Plus className="w-5 h-5" />
              )}
              <span>New Document</span>
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-12">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search documents..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <select 
                className="border border-gray-300 rounded-lg px-4 py-2 bg-white flex-1 min-w-[180px]"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                {documentTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <select 
                className="border border-gray-300 rounded-lg px-4 py-2 bg-white flex-1 min-w-[180px]"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option>Newest First</option>
                <option>Oldest First</option>
                <option>Name A-Z</option>
                <option>Name Z-A</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
              {filteredDocuments.length > 0 ? (
                // In DocumentList.js, modify the Documentcard rendering part:
                filteredDocuments.map((doc) => (
                  <Documentcard
                    key={doc.filename}
                    title={doc.originalname}
                    type={doc.type || 'Unknown'}
                    owner="You"
                    email={userEmails[doc.userId] || 'Loading email...'}
                    date={new Date(doc.uploadDate).toLocaleDateString()}
                    onDownload={() => handleDownload(doc.filename, doc.originalname)}
                    onDelete={() => openDeleteDialog(doc.filename)}
                  />
                ))

              ) : (
                <div className="col-span-3 text-center py-10 text-gray-500">
                  {searchTerm || filterType !== 'All Document Types' 
                    ? 'No documents match your search criteria' 
                    : 'No documents found. Upload your first document!'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleFileChange} 
        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
      />

      {/* Upload Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
              onClick={() => setIsDialogOpen(false)}
              disabled={isUploading}
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold mb-4">Upload New Document</h2>
            <p className="mb-6 text-sm text-gray-500">
              Supported formats: PDF, Word, Excel, JPG, PNG (Max 10MB)
            </p>
            <button
              onClick={handleUploadClick}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 w-full"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
                  Uploading...
                </>
              ) : (
                'Select File to Upload'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {selectedDocToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
              onClick={closeDeleteDialog}
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold mb-4">Confirm Delete</h2>
            <p className="mb-6 text-sm text-gray-500">
              Are you sure you want to delete this document? This action cannot be undone.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => handleDelete(selectedDocToDelete)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex-1"
              >
                Confirm Delete
              </button>
              <button
                onClick={closeDeleteDialog}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}