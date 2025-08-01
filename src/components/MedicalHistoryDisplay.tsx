import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertTriangle, Phone, User, Heart, Pill, Activity, Cigarette, CheckCircle, XCircle } from "lucide-react";
import { medicalHistoryApi, type MedicalHistory } from "@/api/modules/medical-history";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";

interface MedicalHistoryDisplayProps {
  userId: string;
}

// Μετάφραση παθήσεων στα ελληνικά
const conditionTranslations: Record<string, string> = {
  heart_disease: "Καρδιακή νόσος",
  hypertension: "Υπέρταση",
  diabetes: "Διαβήτης",
  asthma: "Άσθμα",
  thyroid_disorder: "Θυρεοειδική διαταραχή",
  osteoporosis: "Οστεοπόρωση",
  arthritis: "Αρθρίτιδα",
  cancer: "Καρκίνος",
  stroke: "Εγκεφαλικό επεισόδιο",
  epilepsy: "Επιληψία",
  kidney_disease: "Νεφρική νόσος",
  mental_health: "Ψυχική υγεία",
  high_cholesterol: "Υψηλή χοληστερόλη"
};

// Μετάφραση επιπέδων δραστηριότητας
const activityLevelTranslations: Record<string, string> = {
  none: "Καθόλου",
  light: "Ελαφριά",
  moderate: "Μέτρια",
  vigorous: "Έντονη"
};

export function MedicalHistoryDisplay({ userId }: MedicalHistoryDisplayProps) {
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchMedicalHistory();
  }, [userId]);

  const fetchMedicalHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await medicalHistoryApi.getUserMedicalHistory(userId);
      setMedicalHistory(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Αποτυχία φόρτωσης ιατρικού ιστορικού";
      setError(errorMessage);
      toast({
        title: "Σφάλμα",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error || !medicalHistory) {
    return (
      <Card>
        <CardContent className="py-8">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Σφάλμα</AlertTitle>
            <AlertDescription>
              {error || "Δεν βρέθηκε ιατρικό ιστορικό για αυτόν τον χρήστη."}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const activeConditions = Object.entries(medicalHistory.medical_conditions)
    .filter(([_, condition]) => condition.ever_diagnosed)
    .map(([key, condition]) => ({
      name: conditionTranslations[key] || key,
      yearOfOnset: condition.year_of_onset,
      details: condition.details
    }));

  return (
    <div className="space-y-6">
      {/* Αντενδείξεις EMS & Υπεύθυνη Δήλωση */}
      {medicalHistory.analysis.has_ems_contraindications && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Προσοχή: Αντενδείξεις EMS</AlertTitle>
          <AlertDescription>
            Ο πελάτης έχει αντενδείξεις για EMS προπόνηση. Συμβουλευτείτε το ιατρικό ιστορικό πριν από οποιαδήποτε EMS συνεδρία.
          </AlertDescription>
        </Alert>
      )}

      {/* Στοιχεία Επικοινωνίας Έκτακτης Ανάγκης */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Επαφή Έκτακτης Ανάγκης
          </CardTitle>
        </CardHeader>
        <CardContent>
          {medicalHistory.emergency_contact.name ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Όνομα:</span>
                <span>{medicalHistory.emergency_contact.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Τηλέφωνο:</span>
                <span>{medicalHistory.emergency_contact.phone}</span>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">Δεν έχουν καταχωρηθεί στοιχεία επαφής έκτακτης ανάγκης.</p>
          )}
        </CardContent>
      </Card>

      {/* Ιστορικό Παθήσεων */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Ιστορικό Παθήσεων
          </CardTitle>
          <CardDescription>
            Συνολικές ενεργές παθήσεις: {medicalHistory.analysis.total_active_conditions}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeConditions.length > 0 ? (
            <div className="space-y-3">
              {activeConditions.map((condition, index) => (
                <div key={index} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{condition.name}</span>
                    {condition.yearOfOnset && (
                      <Badge variant="secondary">Από {condition.yearOfOnset}</Badge>
                    )}
                  </div>
                  {condition.details && (
                    <p className="text-sm text-muted-foreground">{condition.details}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Δεν υπάρχουν καταγεγραμμένες παθήσεις.</p>
          )}
        </CardContent>
      </Card>

      {/* Τρέχοντα Προβλήματα Υγείας */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Τρέχοντα Προβλήματα Υγείας
          </CardTitle>
        </CardHeader>
        <CardContent>
          {medicalHistory.current_health_problems.has_problems ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {medicalHistory.current_health_problems.details || "Υπάρχουν προβλήματα υγείας (χωρίς λεπτομέρειες)"}
              </AlertDescription>
            </Alert>
          ) : (
            <p className="text-muted-foreground">Δεν αναφέρθηκαν τρέχοντα προβλήματα υγείας.</p>
          )}
        </CardContent>
      </Card>

      {/* Συνταγογραφούμενα Φάρμακα */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5" />
            Συνταγογραφούμενα Φάρμακα
          </CardTitle>
        </CardHeader>
        <CardContent>
          {medicalHistory.prescribed_medications.length > 0 ? (
            <div className="space-y-2">
              {medicalHistory.prescribed_medications.map((med, index) => (
                <div key={index} className="flex items-center justify-between border rounded-lg p-3">
                  <div>
                    <p className="font-medium">{med.medication}</p>
                    <p className="text-sm text-muted-foreground">Λόγος: {med.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Δεν λαμβάνει συνταγογραφούμενα φάρμακα.</p>
          )}
        </CardContent>
      </Card>

      {/* Συνήθειες Καπνίσματος */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cigarette className="h-5 w-5" />
            Ιστορικό Καπνίσματος
          </CardTitle>
        </CardHeader>
        <CardContent>
          {medicalHistory.smoking.ever_smoked ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">Κατάσταση:</span>
                <Badge variant={medicalHistory.smoking.is_current_smoker ? "destructive" : "secondary"}>
                  {medicalHistory.smoking.is_current_smoker ? "Ενεργός καπνιστής" : "Πρώην καπνιστής"}
                </Badge>
              </div>
              {medicalHistory.smoking.smoking_years && (
                <p className="text-sm">Έτη καπνίσματος: {medicalHistory.smoking.smoking_years}</p>
              )}
              {!medicalHistory.smoking.is_current_smoker && medicalHistory.smoking.quit_years_ago && (
                <p className="text-sm">Σταμάτησε πριν από {medicalHistory.smoking.quit_years_ago} χρόνια</p>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <p>Δεν έχει καπνίσει ποτέ</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Φυσική Δραστηριότητα */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Φυσική Δραστηριότητα
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-medium">Επίπεδο δραστηριότητας:</span>
              <Badge variant="secondary">
                {activityLevelTranslations[medicalHistory.physical_activity.current_activity_level]}
              </Badge>
            </div>
            {medicalHistory.physical_activity.description && (
              <div>
                <p className="font-medium text-sm mb-1">Περιγραφή:</p>
                <p className="text-sm text-muted-foreground">{medicalHistory.physical_activity.description}</p>
              </div>
            )}
            {medicalHistory.physical_activity.frequency && (
              <p className="text-sm">
                <span className="font-medium">Συχνότητα:</span> {medicalHistory.physical_activity.frequency}
              </p>
            )}
            {medicalHistory.physical_activity.duration && (
              <p className="text-sm">
                <span className="font-medium">Διάρκεια:</span> {medicalHistory.physical_activity.duration}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Υπεύθυνη Δήλωση */}
      <Card>
        <CardHeader>
          <CardTitle>Υπεύθυνη Δήλωση</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            {medicalHistory.liability_declaration_accepted ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-green-700">Έχει αποδεχτεί την υπεύθυνη δήλωση</span>
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-red-500" />
                <span className="text-red-700">Δεν έχει αποδεχτεί την υπεύθυνη δήλωση</span>
              </>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Υποβλήθηκε: {new Date(medicalHistory.submitted_at).toLocaleString('el-GR')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 