// Retryable Error Component
import { AlertCircle, RefreshCw, WifiOff } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { isRetryableError } from "@/utils/errorHandler";
import { useNetworkStatus } from "@/utils/networkStatus";

interface RetryableErrorProps {
  error: any;
  onRetry: () => void;
  title?: string;
  className?: string;
  variant?: "inline" | "card" | "fullpage";
}

export function RetryableError({
  error,
  onRetry,
  title = "Something went wrong",
  className,
  variant = "inline",
}: RetryableErrorProps) {
  const networkStatus = useNetworkStatus();
  const isRetryable = isRetryableError(error);
  const isOffline = !networkStatus.online;

  const errorMessage = error?.message || "An unexpected error occurred";
  const showRetryButton = isRetryable || isOffline;

  if (variant === "fullpage") {
    return (
      <div className={`min-h-[400px] flex items-center justify-center p-4 ${className}`}>
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isOffline ? (
                <>
                  <WifiOff className="h-5 w-5" />
                  No Internet Connection
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  {title}
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {isOffline ? "Please check your internet connection and try again." : errorMessage}
            </p>
          </CardContent>
          {showRetryButton && (
            <CardFooter>
              <Button onClick={onRetry} variant="outline" className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    );
  }

  if (variant === "card") {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            {isOffline ? (
              <>
                <WifiOff className="h-4 w-4" />
                Offline
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 text-destructive" />
                {title}
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {isOffline ? "No internet connection" : errorMessage}
          </p>
        </CardContent>
        {showRetryButton && (
          <CardFooter>
            <Button onClick={onRetry} variant="outline" size="sm">
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          </CardFooter>
        )}
      </Card>
    );
  }

  // Default inline variant
  return (
    <Alert variant={isOffline ? "default" : "destructive"} className={className}>
      {isOffline ? (
        <WifiOff className="h-4 w-4" />
      ) : (
        <AlertCircle className="h-4 w-4" />
      )}
      <AlertTitle>{isOffline ? "You're Offline" : title}</AlertTitle>
      <AlertDescription className="mt-2">
        <p>{isOffline ? "Please check your internet connection." : errorMessage}</p>
        {showRetryButton && (
          <Button 
            onClick={onRetry} 
            variant="outline" 
            size="sm" 
            className="mt-3"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Try Again
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}

// Empty state with error
export function EmptyStateError({
  title = "No data available",
  description = "There was an error loading the data",
  error,
  onRetry,
  icon: Icon = AlertCircle,
}: {
  title?: string;
  description?: string;
  error?: any;
  onRetry?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  const networkStatus = useNetworkStatus();
  const isOffline = !networkStatus.online;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="rounded-full bg-muted p-3 mb-4">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-4">
        {isOffline ? "You're currently offline. Data will load when connection is restored." : description}
      </p>
      {(error || isOffline) && onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm">
          <RefreshCw className="h-3 w-3 mr-1" />
          Try Again
        </Button>
      )}
    </div>
  );
}