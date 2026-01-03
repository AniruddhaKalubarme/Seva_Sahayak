import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CopyButtonProps {
  value: string;
  label?: string;
  variant?: 'icon' | 'button';
  size?: 'sm' | 'default';
  className?: string;
}

export function CopyButton({ 
  value, 
  label, 
  variant = 'icon', 
  size = 'sm',
  className 
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!value) return;
    
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={handleCopy}
        className={cn(
          'p-1 rounded hover:bg-muted transition-colors',
          copied && 'text-success',
          className
        )}
        title={copied ? 'Copied!' : 'Copy'}
      >
        {copied ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          <Copy className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
        )}
      </button>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size={size}
      onClick={handleCopy}
      className={cn('gap-2', className)}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-success" />
          {label ? 'Copied!' : null}
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" />
          {label}
        </>
      )}
    </Button>
  );
}

interface CopyAllButtonProps {
  data: Record<string, string | undefined>;
  labels?: Record<string, string>;
  className?: string;
}

export function CopyAllButton({ data, labels = {}, className }: CopyAllButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyAll = async () => {
    const formattedText = Object.entries(data)
      .filter(([_, value]) => value)
      .map(([key, value]) => `${labels[key] || key}: ${value}`)
      .join('\n');

    if (!formattedText) return;

    try {
      await navigator.clipboard.writeText(formattedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleCopyAll}
      className={cn('gap-2', className)}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-success" />
          Copied All!
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" />
          Copy All
        </>
      )}
    </Button>
  );
}