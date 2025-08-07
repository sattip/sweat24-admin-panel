import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users } from "lucide-react";
import type { GuardianDetails } from "@/types/userProfile";

interface GuardianDetailsSectionProps {
  guardianDetails: GuardianDetails;
}

export function GuardianDetailsSection({ guardianDetails }: GuardianDetailsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Στοιχεία Ανήλικου & Κηδεμόνα
        </CardTitle>
        <CardDescription>Στοιχεία κηδεμόνα για ανήλικο μέλος</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Ονοματεπώνυμο Κηδεμόνα</p>
            <p className="text-sm">{guardianDetails.full_name}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">ΑΔΤ/Διαβατήριο</p>
            <p className="text-sm">{guardianDetails.id_number}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Όνομα Πατέρα</p>
            <p className="text-sm">{guardianDetails.father_name}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Όνομα Μητέρας</p>
            <p className="text-sm">{guardianDetails.mother_name}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Ημερομηνία Γέννησης</p>
            <p className="text-sm">{new Date(guardianDetails.birth_date).toLocaleDateString('el-GR')}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Τηλέφωνο</p>
            <p className="text-sm">{guardianDetails.phone}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p className="text-sm">{guardianDetails.email}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Διεύθυνση</p>
            <p className="text-sm">{guardianDetails.address}, {guardianDetails.city} {guardianDetails.zip_code}</p>
          </div>
        </div>
        {guardianDetails.signature_url && (
          <div className="pt-4 border-t">
            <p className="text-sm font-medium text-muted-foreground mb-2">Υπογραφή Κηδεμόνα</p>
            <img 
              src={guardianDetails.signature_url} 
              alt="Υπογραφή Κηδεμόνα" 
              className="max-w-xs border rounded p-2"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}