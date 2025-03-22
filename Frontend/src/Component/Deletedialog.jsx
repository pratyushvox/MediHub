import React from 'react';

const DeleteDialog = ({ onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40
     backdrop-blur-sm">
      <div className="bg-white p-6 rounded-md shadow-lg">
        <h2 className="text-lg font-bold">Are you sure you want to delete?</h2>
        <div className="mt-4 flex justify-end gap-4">
          <button className="bg-gray-300 px-4 py-2 rounded" onClick={onClose}>
            No
          </button>
          <button className="bg-red-600 text-white px-4 py-2 rounded" onClick={onConfirm}>
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteDialog;
