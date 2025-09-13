import React from 'react';

const Shimmer = () => <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-gray-500/20 to-transparent"></div>;

const SkeletonCard = ({ className }) => (
  <div className={`glass-card p-6 relative overflow-hidden ${className}`}>
    <Shimmer />
  </div>
);

const DashboardSkeleton = () => (
  <div className="container mx-auto p-4 md:p-8">
    <div className="h-10 w-1/3 bg-gray-300 dark:bg-gray-700 rounded-md mb-8 relative overflow-hidden"><Shimmer /></div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <SkeletonCard className="h-32" />
      <SkeletonCard className="h-32" />
      <SkeletonCard className="h-32" />
      <SkeletonCard className="h-32" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <SkeletonCard className="lg:col-span-2 h-80" />
      <SkeletonCard className="h-80" />
    </div>
  </div>
);

export default DashboardSkeleton;