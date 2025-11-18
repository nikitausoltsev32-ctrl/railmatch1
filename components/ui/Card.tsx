import React, { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'elevated';
}

export function Card({
  children,
  variant = 'default',
  className = '',
  ...props
}: CardProps) {
  const baseStyles =
    'rounded-lg bg-white p-6 transition-all duration-200';

  const variantStyles = {
    default: 'border border-neutral-200',
    elevated: 'shadow-lg',
  };

  const finalClassName = `${baseStyles} ${variantStyles[variant]} ${className}`;

  return (
    <div className={finalClassName} {...props}>
      {children}
    </div>
  );
}
