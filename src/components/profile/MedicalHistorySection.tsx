import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Heart, UserCheck, AlertTriangle } from "lucide-react";
import type { MedicalHistory, EMSContraindication } from "@/types/userProfile";

interface MedicalHistorySectionProps {
  medicalHistory: MedicalHistory;
}

export function MedicalHistorySection({ medicalHistory }: MedicalHistorySectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5" />
          Ιατρικό Ιστορικό - EMS
        </CardTitle>
        <CardDescription>Στοιχεία για την ηλεκτρική μυϊκή διέγερση (EMS)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">Ενδιαφέρον για EMS: Ναι</span>
          </div>
          <div className="flex items-center gap-2">
            {medicalHistory.ems_liability_accepted ? (
              <UserCheck className="h-4 w-4 text-green-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            )}
            <span className="text-sm font-medium">
              Αποδοχή Δήλωσης EMS: {medicalHistory.ems_liability_accepted ? "Ναι" : "Όχι"}
            </span>
          </div>
        </div>
        
        {medicalHistory.ems_contraindications && (
          <div className="pt-4 border-t">
            <p className="text-sm font-medium text-muted-foreground mb-3">Αντενδείξεις EMS</p>
            <div className="space-y-2">
              {Object.entries(medicalHistory.ems_contraindications).map(
                ([condition, data]: [string, EMSContraindication]) => (
                  <div key={condition} className="flex items-start gap-2">
                    {data.has_condition ? (
                      <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-gray-300 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className={`text-sm ${data.has_condition ? 'font-medium' : 'text-muted-foreground'}`}>
                        {condition}
                      </p>
                      {data.has_condition && data.year_of_onset && (
                        <p className="text-xs text-muted-foreground">Έτος έναρξης: {data.year_of_onset}</p>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {medicalHistory.other_medical_data && (
          <div className="pt-4 border-t">
            <p className="text-sm font-medium text-muted-foreground mb-2">Επιπλέον Ιατρικά Στοιχεία</p>
            {medicalHistory.other_medical_data.medical_conditions?.medical_history && (
              <p className="text-sm mb-2">
                {medicalHistory.other_medical_data.medical_conditions.medical_history}
              </p>
            )}
            {medicalHistory.other_medical_data.emergency_contact && (
              <div className="text-sm">
                <span className="font-medium">Επείγουσα Επαφή: </span>
                {medicalHistory.other_medical_data.emergency_contact.name} - {medicalHistory.other_medical_data.emergency_contact.phone}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}