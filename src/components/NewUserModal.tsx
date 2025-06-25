import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { UserPlus, Mail } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { mockPackagesData } from "../data/mockData";

interface NewUserModalProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerButton?: boolean;
  onUserCreated?: (user: any) => void;
}

export function NewUserModal({ 
  isOpen, 
  onOpenChange, 
  triggerButton = true,
  onUserCreated 
}: NewUserModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    packageType: "",
    medicalHistory: "",
    termsAccepted: false,
    sendLoginDetails: true,
  });

  const handleCreateUser = () => {
    if (!formData.name || !formData.email) {
      toast({ 
        title: "Σφάλμα", 
        description: "Το Ονοματεπώνυμο και το Email είναι υποχρεωτικά.", 
        variant: "destructive" 
      });
      return;
    }
    if (!formData.termsAccepted) {
      toast({ 
        title: "Προσοχή", 
        description: "Ο πελάτης πρέπει να αποδεχτεί τους όρους χρήσης.", 
        variant: "destructive" 
      });
      return;
    }

    const selectedPackage = mockPackagesData.find(p => p.id === formData.packageType);
    const newUser = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      membershipType: selectedPackage?.name.split(" - ")[0] || "Χωρίς Πακέτο",
      joinDate: new Date().toISOString().split("T")[0],
      status: "active",
      lastVisit: "-",
      medicalHistory: formData.medicalHistory,
      avatar: null,
      packages: selectedPackage ? [{
        id: `userPkg_${Date.now()}`,
        packageId: selectedPackage.id,
        name: selectedPackage.name,
        assignedDate: new Date().toISOString().split("T")[0],
        expiryDate: new Date(new Date().setDate(new Date().getDate() + selectedPackage.duration)).toISOString().split("T")[0],
        remainingSessions: selectedPackage.sessions,
        totalSessions: selectedPackage.sessions,
        status: 'active'
      }] : [],
      activityLog: selectedPackage ? [{ 
        date: new Date().toISOString().split("T")[0], 
        action: `Αγορά πακέτου '${selectedPackage.name}'` 
      }] : [],
    };

    toast({ 
      title: "Επιτυχία!", 
      description: `Ο πελάτης ${formData.name} δημιουργήθηκε επιτυχώς!` 
    });

    if (formData.sendLoginDetails) {
      setTimeout(() => {
        toast({ 
          title: "Αποστολή Email", 
          description: `Τα στοιχεία σύνδεσης στάλθηκαν στο ${formData.email}.` 
        });
      }, 1000);
    }
    
    if (onUserCreated) {
      onUserCreated(newUser);
    }

    resetForm();
    if (onOpenChange) {
      onOpenChange(false);
    }
  };
  
  const resetForm = () => {
    setFormData({ 
      name: "", 
      email: "", 
      phone: "", 
      packageType: "", 
      medicalHistory: "", 
      termsAccepted: false, 
      sendLoginDetails: true 
    });
  };

  const content = (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-blue-600" />
          Δημιουργία Νέου Πελάτη
        </DialogTitle>
        <DialogDescription>
          Συμπληρώστε τα στοιχεία για τη δημιουργία νέου λογαριασμού πελάτη
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Ονοματεπώνυμο *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="π.χ. Γιάννης Παπαδόπουλος"
            />
          </div>
          <div>
            <Label htmlFor="phone">Τηλέφωνο</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="π.χ. 6912345678"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="π.χ. giannis@email.com"
          />
        </div>

        {/* Package Selection */}
        <div>
          <Label htmlFor="packageType">Πακέτο (προαιρετικό)</Label>
          <Select value={formData.packageType} onValueChange={(value) => setFormData({ ...formData, packageType: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Επιλέξτε πακέτο" />
            </SelectTrigger>
            <SelectContent>
              {mockPackagesData.map((pkg) => (
                <SelectItem key={pkg.id} value={pkg.id}>
                  {pkg.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Medical History */}
        <div>
          <Label htmlFor="medicalHistory">Σύντομο Ιατρικό Ιστορικό</Label>
          <Textarea 
            id="medicalHistory" 
            value={formData.medicalHistory} 
            onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })} 
            placeholder="Αναφέρετε τυχόν τραυματισμούς, αλλεργίες ή παθήσεις." 
            rows={3}
          />
        </div>

        {/* Terms & Email */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="terms" 
              checked={formData.termsAccepted} 
              onCheckedChange={(checked) => setFormData({ ...formData, termsAccepted: !!checked })}
            />
            <label htmlFor="terms" className="text-sm font-medium">
              Ο πελάτης αποδέχεται τους όρους χρήσης. *
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="sendLogin" 
              checked={formData.sendLoginDetails} 
              onCheckedChange={(checked) => setFormData({ ...formData, sendLoginDetails: !!checked })}
            />
            <label htmlFor="sendLogin" className="text-sm font-medium">
              <Mail className="inline h-4 w-4 mr-1" />
              Αποστολή στοιχείων σύνδεσης στο email.
            </label>
          </div>
        </div>

        <Button onClick={handleCreateUser} className="w-full bg-primary hover:bg-primary/90 text-white text-lg py-6">
          <UserPlus className="h-5 w-5 mr-2" />
          Ολοκλήρωση Εγγραφής
        </Button>
      </div>
    </DialogContent>
  );

  if (triggerButton) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          <Button className="bg-primary text-white hover:bg-primary/90">
            <UserPlus className="h-4 w-4 mr-2" />
            Νέος Πελάτης
          </Button>
        </DialogTrigger>
        {content}
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {content}
    </Dialog>
  );
} 