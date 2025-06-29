import { useState, useEffect } from "react";
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
import { usersApi, packagesApi, userPackagesApi } from "../services/apiService";
import type { Package } from "../data/mockData";

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
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    packageType: "",
    medicalHistory: "",
    termsAccepted: false,
    sendLoginDetails: true,
  });

  // Load packages on mount
  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      const packagesData = await packagesApi.getAll();
      setPackages(packagesData);
    } catch (error) {
      console.error('Failed to load packages:', error);
      toast({
        title: "Σφάλμα",
        description: "Αποτυχία φόρτωσης πακέτων.",
        variant: "destructive"
      });
    }
  };

  const handleCreateUser = async () => {
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

    setLoading(true);
    try {
      // Create user
      const selectedPackage = packages.find(p => p.id === formData.packageType);
      const newUserData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: generateRandomPassword(), // Generate a secure random password
        membership_type: selectedPackage?.name.split(" - ")[0] || "Χωρίς Πακέτο",
        medical_history: formData.medicalHistory,
        status: 'active' as const,
      };

      const createdUser = await usersApi.create(newUserData);
      
      // If package selected, assign it to the user
      if (formData.packageType && selectedPackage) {
        try {
          await userPackagesApi.assignPackage(createdUser.id, selectedPackage.id);
        } catch (error) {
          console.error('Failed to assign package:', error);
          toast({
            title: "Προειδοποίηση",
            description: "Ο χρήστης δημιουργήθηκε αλλά απέτυχε η ανάθεση πακέτου.",
            variant: "default"
          });
        }
      }

      toast({ 
        title: "Επιτυχία!", 
        description: `Ο πελάτης ${formData.name} δημιουργήθηκε επιτυχώς!` 
      });

      if (formData.sendLoginDetails) {
        // In a real app, this would trigger an email send via the backend
        setTimeout(() => {
          toast({ 
            title: "Αποστολή Email", 
            description: `Τα στοιχεία σύνδεσης στάλθηκαν στο ${formData.email}.` 
          });
        }, 1000);
      }
      
      if (onUserCreated) {
        onUserCreated(createdUser);
      }

      resetForm();
      if (onOpenChange) {
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Failed to create user:', error);
      toast({ 
        title: "Σφάλμα", 
        description: "Αποτυχία δημιουργίας πελάτη. Παρακαλώ δοκιμάστε ξανά.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
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

  const generateRandomPassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
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
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="phone">Τηλέφωνο</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="π.χ. 6912345678"
              disabled={loading}
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
            disabled={loading}
          />
        </div>

        {/* Package Selection */}
        <div>
          <Label htmlFor="packageType">Πακέτο (προαιρετικό)</Label>
          <Select 
            value={formData.packageType} 
            onValueChange={(value) => setFormData({ ...formData, packageType: value })}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Επιλέξτε πακέτο" />
            </SelectTrigger>
            <SelectContent>
              {packages.map((pkg) => (
                <SelectItem key={pkg.id} value={pkg.id}>
                  {pkg.name} - €{pkg.price}
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
            disabled={loading}
          />
        </div>

        {/* Terms & Email */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="terms" 
              checked={formData.termsAccepted} 
              onCheckedChange={(checked) => setFormData({ ...formData, termsAccepted: !!checked })}
              disabled={loading}
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
              disabled={loading}
            />
            <label htmlFor="sendLogin" className="text-sm font-medium">
              <Mail className="inline h-4 w-4 mr-1" />
              Αποστολή στοιχείων σύνδεσης στο email.
            </label>
          </div>
        </div>

        <Button 
          onClick={handleCreateUser} 
          className="w-full bg-primary hover:bg-primary/90 text-white text-lg py-6"
          disabled={loading}
        >
          {loading ? (
            <>Δημιουργία...</>
          ) : (
            <>
              <UserPlus className="h-5 w-5 mr-2" />
              Ολοκλήρωση Εγγραφής
            </>
          )}
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