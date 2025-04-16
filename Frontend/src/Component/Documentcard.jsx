import React from 'react';
import { FileText, Download, Share2, Trash2 } from 'lucide-react';

export function Documentcard({ title, type, owner, email, date, onDownload, onDelete }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="h-48 bg-blue-50 flex items-center justify-center">
        <FileText className="w-16 h-16 text-blue-500" />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 truncate">{title}</h3>
            <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full mt-1">
              {type}
            </span>
          </div>
        </div>
        
        <div className="mt-4 flex items-center">
          <div className="h-8 w-8 bg-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {owner.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div className="ml-2">
            <p className="text-sm font-medium text-gray-900">{owner}</p>
            <p className="text-xs text-gray-500">ID: {email}</p> {/* Changed from email to display user ID */}
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-gray-500">{date}</span>
          <div className="flex space-x-2">
            <button 
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              onClick={onDownload}
            >
              <Download className="w-4 h-4 text-gray-600" />
            </button>
            <button 
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              onClick={onDelete}
            >
              <Trash2 className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}