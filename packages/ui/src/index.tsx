import React from 'react';

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ children, className, ...props }, ref) => (
  <button
    ref={ref}
    className={`px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 ${className || ''}`}
    {...props}
  >
    {children}
  </button>
));

Button.displayName = 'Button';

export const Card = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`rounded-lg border border-gray-200 p-4 shadow ${className || ''}`}>
    {children}
  </div>
);

export const Badge = ({
  children,
  variant = 'primary',
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger';
}) => {
  const variants: Record<string, string> = {
    primary: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
};

export default { Button, Card, Badge };
