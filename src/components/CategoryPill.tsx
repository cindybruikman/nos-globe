import React from 'react';

interface CategoryPillProps {
  category: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const CategoryPill: React.FC<CategoryPillProps> = ({ 
  category, 
  label, 
  isActive, 
  onClick 
}) => {
  // Get appropriate classes based on category and active state
  const getBaseClass = () => {
    return "px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 cursor-pointer";
  };

  const getActiveClass = () => {
    if (isActive) {
      switch (category) {
        case 'politics':
          return "bg-red-100 text-red-800 border-red-300";
        case 'technology':
          return "bg-blue-100 text-blue-800 border-blue-300";
        case 'science':
          return "bg-green-100 text-green-800 border-green-300";
        case 'all':
        default:
          return "bg-purple-100 text-purple-800 border-purple-300";
      }
    }
    return "bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200";
  };

  return (
    <div 
      className={`${getBaseClass()} ${getActiveClass()} border`}
      onClick={onClick}
    >
      {label}
    </div>
  );
};

export default CategoryPill; 