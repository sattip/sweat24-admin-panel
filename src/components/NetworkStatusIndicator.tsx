// Network Status Indicator Component
import { useNetworkStatus } from "@/utils/networkStatus";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WifiOff, Wifi, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export function NetworkStatusIndicator() {
  const networkStatus = useNetworkStatus();

  if (networkStatus.online && !networkStatus.saveData && networkStatus.effectiveType !== "slow-2g") {
    return null; // Don't show anything when connection is good
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-2">
      {!networkStatus.online ? (
        <Alert variant="destructive" className="w-auto">
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            You are offline. Some features may be limited.
          </AlertDescription>
        </Alert>
      ) : networkStatus.effectiveType === "slow-2g" || networkStatus.effectiveType === "2g" ? (
        <Alert className="w-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Slow connection detected. Loading may take longer.
          </AlertDescription>
        </Alert>
      ) : networkStatus.saveData ? (
        <Alert className="w-auto">
          <Wifi className="h-4 w-4" />
          <AlertDescription>
            Data saver mode is enabled. Some features may be limited.
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}

// Mini network status for header/sidebar
export function NetworkStatusBadge() {
  const networkStatus = useNetworkStatus();

  if (networkStatus.online) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 px-2 py-1 bg-destructive/10 text-destructive rounded-md text-sm">
      <WifiOff className="h-3 w-3" />
      <span>Offline</span>
    </div>
  );
}

// Connection quality indicator
export function ConnectionQualityIndicator() {
  const networkStatus = useNetworkStatus();

  const getQualityInfo = () => {
    if (!networkStatus.online) {
      return { quality: "offline", color: "bg-red-500", bars: 0 };
    }
    
    switch (networkStatus.effectiveType) {
      case "4g":
        return { quality: "excellent", color: "bg-green-500", bars: 4 };
      case "3g":
        return { quality: "good", color: "bg-yellow-500", bars: 3 };
      case "2g":
        return { quality: "fair", color: "bg-orange-500", bars: 2 };
      case "slow-2g":
        return { quality: "poor", color: "bg-red-500", bars: 1 };
      default:
        return { quality: "unknown", color: "bg-gray-500", bars: 4 };
    }
  };

  const { quality, color, bars } = getQualityInfo();

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4].map((bar) => (
          <div
            key={bar}
            className={cn(
              "w-1 h-3 rounded-sm transition-all",
              bar <= bars ? color : "bg-gray-300",
              bar === 1 && "h-2",
              bar === 2 && "h-2.5",
              bar === 3 && "h-3",
              bar === 4 && "h-3.5"
            )}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground capitalize">{quality}</span>
    </div>
  );
}