// components/Skeleton.tsx
import React from 'react';

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '20px',
  borderRadius = '0.375rem', // Tailwind's default rounded-lg
}) => {
  return (
    <div
      className="animate-pulse bg-gray-300 dark:bg-gray-700 mb-2"
      style={{ width, height, borderRadius }}
    ></div>
  );
};

export default Skeleton;
