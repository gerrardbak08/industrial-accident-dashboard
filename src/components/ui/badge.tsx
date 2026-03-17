import * as React from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors',
        variant === 'default' && 'bg-red-100 text-red-700',
        variant === 'secondary' && 'bg-gray-100 text-gray-700',
        variant === 'destructive' && 'bg-red-600 text-white',
        variant === 'outline' && 'border border-gray-200 text-gray-700',
        className,
      )}
      {...props}
    />
  )
}

export { Badge }
