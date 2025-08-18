import { Badge } from "@/components/ui/badge";

interface VersionIndicatorProps {
  version?: string;
  className?: string;
}

export function VersionIndicator({ version = "v1", className = "" }: VersionIndicatorProps) {
  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <Badge 
        variant="outline" 
        className="bg-white/90 backdrop-blur-sm border-blue-200 text-blue-700 shadow-md hover:bg-blue-50 transition-colors"
      >
        <span className="text-xs font-mono">🚀 {version}</span>
      </Badge>
    </div>
  );
}
