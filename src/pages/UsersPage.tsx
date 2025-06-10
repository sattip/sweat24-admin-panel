import { useState } from "react";
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
import {
  UserPlus,
  Search,
  Calendar,
  Package,
  Eye,
  Edit,
  Trash2,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  Camera,
  FileText,
  Upload,
} from "lucide-react";

// Mock data για πελάτες
const mockUsers = [
  {
    id: "1",
    name: "Γιάννης Παπαδόπουλος",
    email: "giannis@email.com",
    phone: "6944123456",
    membershipType: "Premium",
    joinDate: "2024-01-15",
    remainingSessions: 8,
    totalSessions: 20,
    status: "active",
    lastVisit: "2024-05-20",
    medicalHistory: "Χωρίς ιδιαίτερες παθήσεις",
    avatar: null,
  },
  {
    id: "2",
    name: "Μαρία Κωνσταντίνου",
    email: "maria@email.com",
    phone: "6955234567",
    membershipType: "Basic",
    joinDate: "2024-02-10",
    remainingSessions: 3,
    totalSessions: 10,
    status: "active",
    lastVisit: "2024-05-18",
    medicalHistory: "Πρόβλημα στη μέση",
    avatar: null,
  },
  {
    id: "3",
    name: "Κώστας Δημητρίου",
    email: "kostas@email.com",
    phone: "6966345678",
    membershipType: "Premium",
    joinDate: "2024-03-05",
    remainingSessions: 0,
    totalSessions: 15,
    status: "expired",
    lastVisit: "2024-05-10",
    medicalHistory: "Αθλητικός τραυματισμός γόνατος",
    avatar: null,
  },
];

const packageTypes = [
  { value: "basic", label: "Basic - 10 επισκέψεις", sessions: 10 },
  { value: "premium", label: "Premium - 20 επισκέψεις", sessions: 20 },
  { value: "unlimited", label: "Unlimited - Απεριόριστες", sessions: -1 },
  { value: "personal", label: "Personal Training - 8 sessions", sessions: 8 },
];

export function UsersPage() {
  const [users, setUsers] = useState(mockUsers);
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
    emergencyContact: "",
    emergencyPhone: "",
    allergies: "",
    medications: "",
    injuries: "",
    medicalNotes: "",
    profilePhoto: null,
    progressPhotos: [],
  });

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateUser = () => {
    if (!formData.termsAccepted) {
      alert("Ο πελάτης πρέπει να αποδεχτεί τους όρους!");
      return;
    }

    const selectedPackage = packageTypes.find(p => p.value === formData.packageType);
    const newUser = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      membershipType: selectedPackage?.label.split(" - ")[0] || "Basic",
      joinDate: new Date().toISOString().split("T")[0],
      remainingSessions: selectedPackage?.sessions || 0,
      totalSessions: selectedPackage?.sessions || 0,
      status: "active",
      lastVisit: "-",
      medicalHistory: formData.medicalHistory,
      avatar: null,
    };

    setUsers([...users, newUser]);
    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      packageType: "",
      medicalHistory: "",
      termsAccepted: false,
      emergencyContact: "",
      emergencyPhone: "",
      allergies: "",
      medications: "",
      injuries: "",
      medicalNotes: "",
      profilePhoto: null,
      progressPhotos: [],
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default" className="bg-green-100 text-green-800">Ενεργός</Badge>;
      case "expired":
        return <Badge variant="destructive">Λήξε</Badge>;
      case "inactive":
        return <Badge variant="secondary">Ανενεργός</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const recordFreeSession = (userId: string) => {
    setUsers(users.map(user => {
      if (user.id === userId) {
        return {
          ...user,
          lastVisit: new Date().toISOString().split("T")[0],
        };
      }
      return user;
    }));
    alert("Καταγράφηκε δωρεάν συνεδρία (χωρίς χρέωση πακέτου)");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <AdminHeader />
          <main className="flex-1 p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Διαχείριση Πελατών</h1>
                <p className="text-muted-foreground">
                  Δημιουργία, επεξεργασία και παρακολούθηση πελατών
                </p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Νέος Πελάτης
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Δημιουργία Νέου Πελάτη</DialogTitle>
                    <DialogDescription>
                      Συμπληρώστε τα στοιχεία του νέου πελάτη και επιλέξτε πακέτο
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Ονοματεπώνυμο *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          placeholder="Εισάγετε το όνομα"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          placeholder="email@example.com"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Τηλέφωνο</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          placeholder="6944123456"
                        />
                      </div>
                      <div>
                        <Label htmlFor="package">Πακέτο *</Label>
                        <Select value={formData.packageType} onValueChange={(value) => setFormData({...formData, packageType: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Επιλέξτε πακέτο" />
                          </SelectTrigger>
                          <SelectContent>
                            {packageTypes.map((pkg) => (
                              <SelectItem key={pkg.value} value={pkg.value}>
                                {pkg.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="medical">Ιατρικό Ιστορικό</Label>
                      <Textarea
                        id="medical"
                        value={formData.medicalHistory}
                        onChange={(e) => setFormData({...formData, medicalHistory: e.target.value})}
                        placeholder="Τυχόν ιατρικά προβλήματα, αλλεργίες, τραυματισμοί..."
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="allergies">Αλλεργίες</Label>
                        <Input
                          id="allergies"
                          value={formData.allergies}
                          onChange={(e) => setFormData({...formData, allergies: e.target.value})}
                          placeholder="Τυχόν αλλεργίες..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="medications">Φάρμακα</Label>
                        <Input
                          id="medications"
                          value={formData.medications}
                          onChange={(e) => setFormData({...formData, medications: e.target.value})}
                          placeholder="Φάρμακα που παίρνει..."
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="emergencyContact">Επαφή Έκτακτης Ανάγκης</Label>
                        <Input
                          id="emergencyContact"
                          value={formData.emergencyContact}
                          onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                          placeholder="Όνομα επαφής..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="emergencyPhone">Τηλέφωνο Έκτακτης Ανάγκης</Label>
                        <Input
                          id="emergencyPhone"
                          value={formData.emergencyPhone}
                          onChange={(e) => setFormData({...formData, emergencyPhone: e.target.value})}
                          placeholder="6944123456"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="injuries">Τραυματισμοί</Label>
                      <Textarea
                        id="injuries"
                        value={formData.injuries}
                        onChange={(e) => setFormData({...formData, injuries: e.target.value})}
                        placeholder="Παλαιοί τραυματισμοί, χειρουργεία..."
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label htmlFor="profilePhoto">Φωτογραφία Προφίλ</Label>
                      <div className="flex items-center gap-4">
                        <Input
                          id="profilePhoto"
                          type="file"
                          accept="image/*"
                          onChange={(e) => setFormData({...formData, profilePhoto: e.target.files?.[0] || null})}
                        />
                        <Button type="button" variant="outline" size="sm">
                          <Camera className="h-4 w-4 mr-2" />
                          Λήψη φωτογραφίας
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="terms"
                        checked={formData.termsAccepted}
                        onCheckedChange={(checked) => setFormData({...formData, termsAccepted: !!checked})}
                      />
                      <Label htmlFor="terms" className="text-sm">
                        Ο πελάτης αποδέχεται τους <strong>όρους και προϋποθέσεις</strong> του γυμναστηρίου
                      </Label>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Ακύρωση
                    </Button>
                    <Button onClick={handleCreateUser}>
                      Δημιουργία Πελάτη
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Συνολικοί Πελάτες</CardTitle>
                  <UserPlus className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{users.length}</div>
                  <p className="text-xs text-muted-foreground">
                    +12 από τον προηγούμενο μήνα
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ενεργοί Πελάτες</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {users.filter(u => u.status === 'active').length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {Math.round((users.filter(u => u.status === 'active').length / users.length) * 100)}% του συνόλου
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Λήξεις Πακέτων</CardTitle>
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {users.filter(u => u.status === 'expired').length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Χρειάζονται ανανέωση
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Μέσος Όρος Επισκέψεων</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round(users.reduce((sum, u) => sum + (u.totalSessions - u.remainingSessions), 0) / users.length)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    επισκέψεις ανά μέλος
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Search */}
            <Card>
              <CardHeader>
                <CardTitle>Αναζήτηση Πελατών</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Αναζήτηση με όνομα ή email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
              <CardHeader>
                <CardTitle>Λίστα Πελατών</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Πελάτης</TableHead>
                      <TableHead>Επικοινωνία</TableHead>
                      <TableHead>Πακέτο</TableHead>
                      <TableHead>Συνεδρίες</TableHead>
                      <TableHead>Κατάσταση</TableHead>
                      <TableHead>Τελευταία Επίσκεψη</TableHead>
                      <TableHead>Ενέργειες</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>
                              {user.name.split(" ").map(n => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">
                              Μέλος από {user.joinDate}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{user.email}</div>
                            <div className="text-muted-foreground">{user.phone}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.membershipType}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{user.remainingSessions} / {user.totalSessions}</div>
                            <div className="text-muted-foreground">
                              {user.remainingSessions} απομένουν
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(user.status)}
                        </TableCell>
                        <TableCell>{user.lastVisit}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="ghost">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => recordFreeSession(user.id)}
                              title="Καταγραφή δωρεάν συνεδρίας"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
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