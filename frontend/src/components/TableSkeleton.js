import React from 'react';

const Shimmer = () => <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-gray-300/20 to-transparent"></div>;

const TableSkeleton = ({ rows = 5, columns = 6 }) => {
  return (
    <div className="w-full">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex space-x-4 p-4 border-b border-gray-200/50 dark:border-gray-700/50">
          {[...Array(columns)].map((_, j) => (
            <div key={j} className="flex-1 h-6 bg-gray-300 dark:bg-gray-700 rounded-md relative overflow-hidden">
              <Shimmer />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default TableSkeleton;