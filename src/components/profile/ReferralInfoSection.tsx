import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Share2 } from "lucide-react";
import type { FoundUsVia } from "@/types/userProfile";

interface ReferralInfoSectionProps {
  foundUsVia: FoundUsVia;
}

export function ReferralInfoSection({ foundUsVia }: ReferralInfoSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Πώς μας βρήκατε;
        </CardTitle>
        <CardDescription>Πηγή σύστασης και προσέλκυσης πελάτη</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Πηγή:</span>
            <Badge variant="outline">{foundUsVia.source}</Badge>
          </div>
          
          {foundUsVia.referrer_info && (
            <div className="pt-3 border-t space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Στοιχεία Σύστασης</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Όνομα Συστήσαντος</p>
                  <p className="text-sm font-medium">{foundUsVia.referrer_info.referrer_name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Κωδικός/Όνομα που Χρησιμοποιήθηκε</p>
                  <p className="text-sm font-medium">{foundUsVia.referrer_info.code_or_name_used}</p>
                </div>
              </div>
            </div>
          )}
          
          {foundUsVia.sub_source && (
            <div className="pt-3 border-t">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Πλατφόρμα:</span>
                <Badge variant="outline">{foundUsVia.sub_source}</Badge>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}