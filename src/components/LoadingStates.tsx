// Reusable Loading State Components
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Spinner component
export function Spinner({ 
  size = "default", 
  className 
}: { 
  size?: "sm" | "default" | "lg";
  className?: string;
}) {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <Loader2 
      className={cn("animate-spin", sizeClasses[size], className)} 
    />
  );
}

// Full page loader
export function PageLoader({ message }: { message?: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <Spinner size="lg" className="text-primary" />
      {message && (
        <p className="mt-4 text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  );
}

// Section loader
export function SectionLoader({ 
  message,
  className 
}: { 
  message?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12", className)}>
      <Spinner className="text-primary" />
      {message && (
        <p className="mt-4 text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  );
}

// Inline loader
export function InlineLoader({ 
  text = "Loading..." 
}: { 
  text?: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Spinner size="sm" />
      <span>{text}</span>
    </div>
  );
}

// Button with loading state
export function LoadingButton({
  isLoading,
  loadingText,
  children,
  disabled,
  ...props
}: {
  isLoading: boolean;
  loadingText?: string;
  children: React.ReactNode;
} & React.ComponentProps<typeof Button>) {
  return (
    <Button
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <>
          <Spinner size="sm" className="mr-2" />
          {loadingText || "Loading..."}
        </>
      ) : (
        children
      )}
    </Button>
  );
}

// Overlay loader for modals/sections
export function OverlayLoader({ 
  isLoading,
  message 
}: { 
  isLoading: boolean;
  message?: string;
}) {
  if (!isLoading) return null;

  return (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
      <div className="flex flex-col items-center gap-2">
        <Spinner className="text-primary" />
        {message && (
          <p className="text-sm text-muted-foreground">{message}</p>
        )}
      </div>
    </div>
  );
}

// Progress loader
export function ProgressLoader({ 
  progress,
  message 
}: { 
  progress: number;
  message?: string;
}) {
  return (
    <div className="space-y-2">
      {message && (
        <p className="text-sm text-muted-foreground text-center">{message}</p>
      )}
      <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
        <div 
          className="bg-primary h-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground text-center">{Math.round(progress)}%</p>
    </div>
  );
}

// Dots loader animation
export function DotsLoader() {
  return (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 bg-primary rounded-full animate-pulse"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
  );
}

// Loading placeholder text
export function LoadingText({ 
  text = "Loading",
  showDots = true 
}: { 
  text?: string;
  showDots?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1">
      {text}
      {showDots && <DotsLoader />}
    </span>
  );
}

// Lazy load wrapper with loading state
export function LazyLoadWrapper({
  isLoading,
  error,
  onRetry,
  children,
  loadingComponent,
  errorComponent,
}: {
  isLoading: boolean;
  error?: any;
  onRetry?: () => void;
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
}) {
  if (isLoading) {
    return <>{loadingComponent || <SectionLoader />}</>;
  }

  if (error) {
    return (
      <>
        {errorComponent || (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <p className="text-sm text-destructive">Failed to load content</p>
            {onRetry && (
              <Button onClick={onRetry} variant="outline" size="sm">
                Try Again
              </Button>
            )}
          </div>
        )}
      </>
    );
  }

  return <>{children}</>;
}