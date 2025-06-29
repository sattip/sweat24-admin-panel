// Global Error Boundary Component
import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { createErrorBoundaryHandler } from "@/utils/errorHandler";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  private errorHandler: ReturnType<typeof createErrorBoundaryHandler>;

  constructor(props: Props) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };

    this.errorHandler = createErrorBoundaryHandler(() => this.resetError());
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError } = this.props;
    
    // Log error details
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    
    // Update state with error info
    this.setState((prevState) => ({
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo);
    }

    // Use centralized error handler
    this.errorHandler(error, errorInfo);
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      const { error, errorInfo, errorCount } = this.state;
      const isDevelopment = process.env.NODE_ENV === "development";

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-destructive" />
                <CardTitle>Something went wrong</CardTitle>
              </div>
              <CardDescription>
                An unexpected error occurred. The issue has been logged and we'll look into it.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error Details</AlertTitle>
                <AlertDescription>
                  {error?.message || "An unknown error occurred"}
                </AlertDescription>
              </Alert>

              {errorCount > 2 && (
                <Alert>
                  <AlertTitle>Persistent Error Detected</AlertTitle>
                  <AlertDescription>
                    This error has occurred multiple times. Please try refreshing the page or contact support if the issue persists.
                  </AlertDescription>
                </Alert>
              )}

              {isDevelopment && errorInfo && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                    Technical Details (Development Only)
                  </summary>
                  <div className="mt-2 space-y-2">
                    <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-64">
                      {error?.stack}
                    </pre>
                    <div className="text-xs text-gray-600">
                      <p className="font-semibold">Component Stack:</p>
                      <pre className="bg-gray-100 p-2 rounded overflow-auto">
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                  </div>
                </details>
              )}
            </CardContent>

            <CardFooter className="flex gap-2">
              <Button 
                onClick={this.resetError}
                variant="default"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
              
              <Button
                onClick={() => window.location.href = "/"}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Go to Dashboard
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Specific error boundary for async components
export function AsyncBoundary({ 
  children, 
  fallback,
  onError 
}: {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error) => void;
}) {
  return (
    <ErrorBoundary
      fallback={
        fallback || (
          <div className="p-4 text-center">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Loading Error</AlertTitle>
              <AlertDescription>
                Failed to load this section. Please try refreshing the page.
              </AlertDescription>
            </Alert>
          </div>
        )
      }
      onError={onError}
    >
      {children}
    </ErrorBoundary>
  );
}

// HOC for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );
}