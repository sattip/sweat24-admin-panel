import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminHeader } from "@/components/AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Save, Loader2, Mail, Phone } from "lucide-react";
import { usersApi } from "@/services/apiService";
import type { User } from "@/data/mockData";
import SignaturePad, { SignaturePadRef } from "@/components/SignaturePad";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export function UserEditPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [signatureData, setSignatureData] = useState("");
  const signaturePadRef = useRef<SignaturePadRef>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: ""
  });

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const fetchUserData = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const userData = await usersApi.getById(userId);
      setUser(userData);
      setFormData({
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || ""
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      toast({
        title: "Σφάλμα",
        description: "Αποτυχία φόρτωσης δεδομένων χρήστη.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) return;
    
    setSaving(true);
    try {
      const updateData: any = { ...formData };
      
      // Include signature if it was updated
      if (signatureData) {
        updateData.signature = signatureData;
        updateData.signed_at = new Date().toISOString();
        updateData.document_type = 'terms_and_conditions';
        updateData.document_version = '1.0';
      }
      
      await usersApi.update(userId, updateData);
      toast({
        title: "Επιτυχής Ενημέρωση",
        description: "Τα στοιχεία του χρήστη ενημερώθηκαν επιτυχώς.",
      });
      navigate(`/users/${userId}`);
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Σφάλμα",
        description: "Αποτυχία ενημέρωσης στοιχείων χρήστη.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AdminSidebar />
          <div className="flex-1 flex flex-col">
            <AdminHeader />
            <main className="flex-1 p-6 space-y-6">
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <h2 className="text-xl font-semibold mb-2">Φόρτωση δεδομένων χρήστη...</h2>
                </div>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  if (!user) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AdminSidebar />
          <div className="flex-1 flex flex-col">
            <AdminHeader />
            <main className="flex-1 p-6 space-y-6">
              <div className="flex items-center justify-center h-full">
                <Card>
                  <CardHeader>
                    <CardTitle>Σφάλμα</CardTitle>
                    <CardDescription>Ο χρήστης δεν βρέθηκε.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link to="/users">
                      <Button variant="outline">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Επιστροφή στους Πελάτες
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <AdminHeader />
          <main className="flex-1 p-6 space-y-6">
            <Link to={`/users/${userId}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="h-4 w-4" />
              Επιστροφή στο Προφίλ
            </Link>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Επεξεργασία Χρήστη</h1>
                <p className="text-muted-foreground">Ενημέρωση στοιχείων του {user.name}</p>
              </div>
            </div>

            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Επεξεργασία Στοιχείων Πελάτη</CardTitle>
                <CardDescription>Ενημερώστε τα βασικά στοιχεία του πελάτη</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Ονοματεπώνυμο *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Το όνομα του πελάτη"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="πελάτης@email.com"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Τηλέφωνο</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="6901234567"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  {/* Signature Update Button */}
                  <div className="pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowSignatureDialog(true)}
                      className="w-full"
                    >
                      Ενημέρωση Υπογραφής
                    </Button>
                  </div>
                  
                  {signatureData && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-700">
                      ✓ Νέα υπογραφή έχει καταχωρηθεί
                    </div>
                  )}
                  
                  {/* Actions */}
                  <div className="flex justify-end gap-4 pt-6">
                    <Link to={`/users/${userId}`}>
                      <Button variant="outline">
                        Ακύρωση
                      </Button>
                    </Link>
                    <Button type="submit" disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Αποθήκευση...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Αποθήκευση Αλλαγών
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
            
            {/* Signature Dialog */}
            <Dialog open={showSignatureDialog} onOpenChange={setShowSignatureDialog}>
              <DialogContent className="max-w-3xl max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle>Ενημέρωση Υπογραφής</DialogTitle>
                  <DialogDescription>
                    Ζητήστε από τον πελάτη να υπογράψει ξανά τους όρους και προϋποθέσεις
                  </DialogDescription>
                </DialogHeader>
                
                <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                  <div className="space-y-4 text-sm">
                    <h3 className="font-semibold text-lg">1. Αποδοχή Όρων</h3>
                    <p>
                      Με την εγγραφή σας στο γυμναστήριο SWEAT24, αποδέχεστε πλήρως τους παρόντες όρους χρήσης.
                    </p>
                    
                    <h3 className="font-semibold text-lg">2. Κανόνες Ασφαλείας</h3>
                    <p>
                      Υποχρεούστε να ακολουθείτε τους κανόνες ασφαλείας και τις οδηγίες του προσωπικού.
                      Το γυμναστήριο δεν φέρει ευθύνη για τραυματισμούς που οφείλονται σε αμέλεια ή κακή χρήση του εξοπλισμού.
                    </p>
                    
                    <h3 className="font-semibold text-lg">3. Ιατρική Κατάσταση</h3>
                    <p>
                      Δηλώνετε υπεύθυνα ότι είστε σε καλή φυσική κατάσταση και δεν έχετε κανένα ιατρικό πρόβλημα
                      που θα μπορούσε να επιδεινωθεί από τη φυσική άσκηση.
                    </p>
                    
                    <h3 className="font-semibold text-lg">4. Προσωπικά Αντικείμενα</h3>
                    <p>
                      Το γυμναστήριο δεν φέρει ευθύνη για απώλεια ή κλοπή προσωπικών αντικειμένων.
                      Συνιστάται η χρήση των ντουλαπιών με λουκέτο.
                    </p>
                    
                    <h3 className="font-semibold text-lg">5. Πολιτική Ακύρωσης</h3>
                    <p>
                      Οι ακυρώσεις συνδρομών πρέπει να γίνονται εγγράφως τουλάχιστον 30 ημέρες πριν την επόμενη χρέωση.
                      Δεν γίνονται επιστροφές χρημάτων για μη χρησιμοποιημένες περιόδους.
                    </p>
                    
                    <h3 className="font-semibold text-lg">6. Προστασία Δεδομένων</h3>
                    <p>
                      Τα προσωπικά σας δεδομένα θα χρησιμοποιηθούν αποκλειστικά για τους σκοπούς λειτουργίας του γυμναστηρίου
                      και δεν θα κοινοποιηθούν σε τρίτους χωρίς τη συγκατάθεσή σας.
                    </p>
                  </div>
                </ScrollArea>
                
                <div className="mt-4">
                  <SignaturePad
                    ref={signaturePadRef}
                    title="Υπογραφή Πελάτη"
                    description="Ο πελάτης υπογράφοντας, δηλώνει ότι έχει διαβάσει και αποδέχεται τους όρους χρήσης"
                  />
                </div>
                
                <div className="flex gap-2 justify-end mt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowSignatureDialog(false);
                      setSignatureData("");
                      signaturePadRef.current?.clear();
                    }}
                  >
                    Ακύρωση
                  </Button>
                  <Button
                    onClick={() => {
                      if (signaturePadRef.current?.isEmpty()) {
                        toast({ 
                          title: "Σφάλμα", 
                          description: "Παρακαλώ ζητήστε από τον πελάτη να υπογράψει πριν συνεχίσετε",
                          variant: "destructive"
                        });
                        return;
                      }
                      const signature = signaturePadRef.current?.toDataURL();
                      if (signature) {
                        setSignatureData(signature);
                        setShowSignatureDialog(false);
                        toast({ 
                          title: "Επιτυχία", 
                          description: "Η υπογραφή αποθηκεύτηκε"
                        });
                      }
                    }}
                  >
                    Αποδοχή και Υπογραφή
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}