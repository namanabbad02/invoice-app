import React from 'react';
import TableSkeleton from './TableSkeleton';

const Shimmer = () => <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-gray-300/20 to-transparent"></div>;

const InvoiceDetailSkeleton = () => {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="h-10 w-1/3 bg-gray-300 dark:bg-gray-700 rounded-md mb-8 relative overflow-hidden"><Shimmer /></div>
      <div className="flex justify-end gap-4 mb-4">
        <div className="h-10 w-32 bg-gray-300 dark:bg-gray-700 rounded-lg relative overflow-hidden"><Shimmer /></div>
        <div className="h-10 w-32 bg-gray-300 dark:bg-gray-700 rounded-lg relative overflow-hidden"><Shimmer /></div>
      </div>
      <div className="glass-card p-8 sm:p-12">
        <div className="flex justify-between mb-8">
          <div className="space-y-2">
            <div className="h-8 w-40 bg-gray-300 dark:bg-gray-700 rounded-md relative overflow-hidden"><Shimmer /></div>
            <div className="h-5 w-48 bg-gray-300 dark:bg-gray-700 rounded-md relative overflow-hidden"><Shimmer /></div>
          </div>
          <div className="h-12 w-32 bg-gray-300 dark:bg-gray-700 rounded-md relative overflow-hidden"><Shimmer /></div>
        </div>
        <div className="h-px bg-gray-300 dark:bg-gray-700 w-full mb-8"></div>
        <TableSkeleton rows={3} columns={4} />
      </div>
    </div>
  );
};

export default InvoiceDetailSkeleton;