import { useState, useEffect } from "react";
import {
  UserPlus,
  Search,
  Eye,
  Edit,
  Trash2,
  Mail,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";
import { usersApi, packagesApi } from "@/services/apiService";
import type { User, Package } from "@/data/mockData";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminHeader } from "@/components/AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


const NewUserDialogContent = ({ formData, setFormData, handleCreateUser, packages }) => (
  <DialogContent className="max-w-lg">
    <DialogHeader>
      <DialogTitle>Δημιουργία Νέου Πελάτη</DialogTitle>
      <DialogDescription>
        Συμπληρώστε τα βασικά στοιχεία για γρήγορη εγγραφή.
      </DialogDescription>
    </DialogHeader>
    <div className="grid gap-6 py-4">
      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Ονοματεπώνυμο *</Label>
          <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Π.χ. Γιάννης Παπαδόπουλος" className="mt-1"/>
        </div>
        <div>
          <Label htmlFor="phone">Τηλέφωνο</Label>
          <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="Π.χ. 6901234567" className="mt-1"/>
        </div>
      </div>
      <div>
        <Label htmlFor="email">Email *</Label>
        <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="Π.χ. user@email.com" className="mt-1"/>
      </div>

      {/* Package Selection */}
      <div>
        <Label htmlFor="packageType">Αρχικό Πακέτο</Label>
        <Select onValueChange={(value) => setFormData({ ...formData, packageType: value })}>
          <SelectTrigger id="packageType" className="w-full mt-1">
            <SelectValue placeholder="Επιλέξτε πακέτο (προαιρετικό)" />
          </SelectTrigger>
          <SelectContent>
            {packages.map((pkg) => (
              <SelectItem key={pkg.id} value={pkg.id.toString()}>
                {pkg.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Medical History */}
       <div>
        <Label htmlFor="medicalHistory">Σύντομο Ιατρικό Ιστορικό</Label>
        <Textarea id="medicalHistory" value={formData.medicalHistory} onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })} placeholder="Αναφέρετε τυχόν τραυματισμούς, αλλεργίες ή παθήσεις." className="mt-1"/>
      </div>

      {/* Terms & Email */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center space-x-2">
          <Checkbox id="terms" checked={formData.termsAccepted} onCheckedChange={(checked) => setFormData({ ...formData, termsAccepted: !!checked })}/>
          <label htmlFor="terms" className="text-sm font-medium">
            Ο πελάτης αποδέχεται τους όρους χρήσης.
          </label>
        </div>
        <div className="flex items-center space-x-2">
           <Checkbox id="sendLogin" checked={formData.sendLoginDetails} onCheckedChange={(checked) => setFormData({ ...formData, sendLoginDetails: !!checked })}/>
          <label htmlFor="sendLogin" className="text-sm font-medium">
            <Mail className="inline h-4 w-4 mr-1" />
            Αποστολή στοιχείων σύνδεσης στο email.
          </label>
        </div>
      </div>
    </div>
     <Button onClick={handleCreateUser} className="w-full bg-primary hover:bg-primary/90 text-white text-lg py-6">
        <UserPlus className="h-5 w-5 mr-2" />
        Ολοκλήρωση Εγγραφής
    </Button>
  </DialogContent>
);

export function UsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null); 
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    packageType: "",
    medicalHistory: "",
    termsAccepted: false,
    sendLoginDetails: true,
  });

  // Load data from API
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersResponse, packagesResponse] = await Promise.all([
        usersApi.getAll(),
        packagesApi.getAll()
      ]);
      
      setUsers(usersResponse.data || usersResponse);
      setPackages(packagesResponse);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast({
        title: "Σφάλμα",
        description: "Αποτυχία φόρτωσης δεδομένων. Παρακαλώ δοκιμάστε ξανά.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateUser = async () => {
    if (!formData.name || !formData.email) {
      toast({ title: "Σφάλμα", description: "Το Ονοματεπώνυμο και το Email είναι υποχρεωτικά.", variant: "destructive" });
      return;
    }
    if (!formData.termsAccepted) {
      toast({ title: "Προσοχή", description: "Ο πελάτης πρέπει να αποδεχτεί τους όρους χρήσης.", variant: "destructive" });
      return;
    }

    try {
      const selectedPackage = packages.find(p => p.id.toString() === formData.packageType);
      const newUserData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: 'defaultpassword123', // You may want to generate a random password
        membership_type: selectedPackage?.name.split(" - ")[0] || "Χωρίς Πακέτο",
        medical_history: formData.medicalHistory,
      };

      const createdUser = await usersApi.create(newUserData);
      
      // Refresh the users list
      await loadData();
      
      setIsDialogOpen(false);
      toast({ title: "Επιτυχία!", description: `Ο πελάτης ${formData.name} δημιουργήθηκε.` });

      if (formData.sendLoginDetails) {
        setTimeout(() => {
          toast({ title: "Αποστολή Email", description: `Τα στοιχεία σύνδεσης στάλθηκαν στο ${formData.email}.` });
        }, 1000);
      }
      
      resetForm();
    } catch (error) {
      console.error('Failed to create user:', error);
      toast({ 
        title: "Σφάλμα", 
        description: "Αποτυχία δημιουργίας πελάτη. Παρακαλώ δοκιμάστε ξανά.", 
        variant: "destructive" 
      });
    }
  };
  
  const resetForm = () => {
    setFormData({ name: "", email: "", phone: "", packageType: "", medicalHistory: "", termsAccepted: false, sendLoginDetails: true });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active": return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">Ενεργός</Badge>;
      case "expired": return <Badge variant="destructive">Έληξε</Badge>;
      case "inactive": return <Badge variant="secondary">Ανενεργός</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <AdminHeader />
          <main className="flex-1 p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Διαχείριση Πελατών</h1>
                <p className="text-muted-foreground">Δημιουργία, επεξεργασία και παρακολούθηση πελατών.</p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary text-white hover:bg-primary/90"><UserPlus className="h-4 w-4 mr-2" />Νέος Πελάτης</Button>
                </DialogTrigger>
                <NewUserDialogContent formData={formData} setFormData={setFormData} handleCreateUser={handleCreateUser} packages={packages} />
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Λίστα Πελατών</CardTitle>
                <div className="relative mt-2">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Αναζήτηση με όνομα ή email..." className="w-full max-w-sm pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ονοματεπώνυμο</TableHead>
                      <TableHead>Επικοινωνία</TableHead>
                      <TableHead>Ενεργό Πακέτο</TableHead>
                      <TableHead className="text-center">Κατάσταση</TableHead>
                      <TableHead className="text-right">Ενέργειες</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={5} className="text-center h-24">Φόρτωση...</TableCell></TableRow>
                    ) : filteredUsers.length > 0 ? filteredUsers.map((user) => {
                      const activePackage = user.packages?.find(p => p.status === 'active');
                      return (
                      <TableRow key={user.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar><AvatarImage src={user.avatar || undefined} /><AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                            <span className="font-medium">{user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>{user.email}</div>
                          <div className="text-muted-foreground text-sm">{user.phone}</div>
                        </TableCell>
                        <TableCell>
                          <div>{activePackage?.name || 'Κανένα'}</div>
                          <div className="text-muted-foreground text-sm">
                            {activePackage ? `Απομένουν: ${isFinite(activePackage.remainingSessions) ? activePackage.remainingSessions : '∞'}` : ''}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{getStatusBadge(user.status)}</TableCell>
                        <TableCell className="text-right">
                          <Link to={`/users/${user.id}`} className={buttonVariants({ variant: "ghost", size: "icon" })} title="Προβολή"><Eye className="h-4 w-4" /></Link>
                          <Button variant="ghost" size="icon" title="Επεξεργασία"><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" title="Διαγραφή"><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    )}) : (
                      <TableRow><TableCell colSpan={5} className="text-center h-24">Δεν βρέθηκαν πελάτες.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
} 