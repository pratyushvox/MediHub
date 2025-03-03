import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';

// A reusable table component that can be customized with different columns and data
const ReusableTable = ({ 
  columns, 
  data, 
  onEdit, 
  onDelete,
  showActions = true,
  striped = true,
  hoverable = true,
  bordered = true
}) => {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column, index) => (
              <th 
                key={index}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.header}
              </th>
            ))}
            {showActions && (
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className={`bg-white divide-y divide-gray-200 ${striped ? 'divide-y' : ''}`}>
          {data.map((row, rowIndex) => (
            <tr 
              key={rowIndex} 
              className={`
                ${striped && rowIndex % 2 === 1 ? 'bg-gray-50' : ''}
                ${hoverable ? 'hover:bg-gray-100' : ''}
                ${bordered ? 'border-b border-gray-200' : ''}
              `}
            >
              {columns.map((column, colIndex) => (
                <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {row[column.accessor]}
                </td>
              ))}
              {showActions && (
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => onEdit && onEdit(row)} 
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    <Pencil size={16} />
                  </button>
                  <button 
                    onClick={() => onDelete && onDelete(row)} 
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReusableTable;