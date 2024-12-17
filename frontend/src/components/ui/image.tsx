import React from 'react';
import NextImage, { ImageProps as NextImageProps } from 'next/image';
import { cn } from '@/lib/utils';

interface ImageProps extends Omit<NextImageProps, 'alt'> {
  alt: string;
  fallback?: string;
  className?: string;
}

export function Image({ alt, fallback, className, ...props }: ImageProps) {
  const [error, setError] = React.useState(false);

  if (error && fallback) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-gray-100',
          className
        )}
        role="img"
        aria-label={alt}
      >
        {fallback}
      </div>
    );
  }

  return (
    <NextImage
      className={className}
      alt={alt}
      onError={() => setError(true)}
      {...props}
    />
  );
}
