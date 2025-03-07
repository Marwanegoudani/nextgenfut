import React from 'react';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
  textColor?: string;
}

export default function Logo({ className = '', size = 'medium', textColor = 'text-green-600' }: LogoProps) {
  // Define sizes for different variants
  const sizes = {
    small: { width: 32, height: 32, fontSize: 'text-lg' },
    medium: { width: 40, height: 40, fontSize: 'text-2xl' },
    large: { width: 48, height: 48, fontSize: 'text-3xl' },
  };

  const { width, height, fontSize } = sizes[size];

  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <svg
          width={width}
          height={height}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="flex-shrink-0"
        >
          {/* Circle background */}
          <circle cx="50" cy="50" r="45" fill="#16a34a" />
          
          {/* Football pattern */}
          <path
            d="M50 5C25.1 5 5 25.1 5 50s20.1 45 45 45 45-20.1 45-45S74.9 5 50 5zm0 8.1c9.6 0 18.3 3.7 24.8 9.8l-8.2 8.2c-4.6-3.5-10.4-5.6-16.6-5.6-6.2 0-12 2.1-16.6 5.6l-8.2-8.2c6.5-6.1 15.2-9.8 24.8-9.8zm-33 33c0-6.2 2.1-12 5.6-16.6l8.2 8.2c-3.5 4.6-5.6 10.4-5.6 16.6 0 6.2 2.1 12 5.6 16.6l-8.2 8.2c-3.5-4.6-5.6-10.4-5.6-16.6zm33 33c-9.6 0-18.3-3.7-24.8-9.8l8.2-8.2c4.6 3.5 10.4 5.6 16.6 5.6 6.2 0 12-2.1 16.6-5.6l8.2 8.2c-6.5 6.1-15.2 9.8-24.8 9.8zm24.8-16.4c3.5-4.6 5.6-10.4 5.6-16.6 0-6.2-2.1-12-5.6-16.6l8.2-8.2c3.5 4.6 5.6 10.4 5.6 16.6 0 6.2-2.1 12-5.6 16.6l-8.2 8.2z"
            fill="white"
            fillOpacity="0.9"
          />
          
          {/* Star element */}
          <path
            d="M65 30l3.5 7.5 8 1-6 5.5 1.5 8-7-4-7 4 1.5-8-6-5.5 8-1z"
            fill="white"
          />
        </svg>
      </div>
      <span className={`font-bold ${fontSize} ${textColor}`}>NextGenFut</span>
    </Link>
  );
} 