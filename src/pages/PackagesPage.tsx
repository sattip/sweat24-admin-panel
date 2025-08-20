import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminHeader } from "@/components/AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { PackagePlus, Edit, Trash2, Package as PackageIcon, Search, Loader2 } from "lucide-react";
import { packagesApi } from "@/services/api";
import type { Package } from "@/data/mockData";

export function PackagesPage() {
  const { toast } = useToast();
  const [packages, setPackages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingPackage, setEditingPackage] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    sessions: 10,
    duration: 30,
    type: "Personal",
    status: "active",
  });
  const [editForm, setEditForm] = useState({
    name: "",
    price: 0,
    sessions: 10,
    duration: 30,
    type: "Personal",
    status: "active" as "active" | "inactive",
  });

  // Fetch packages on component mount
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setIsLoading(true);
        const response = await packagesApi.getAll();
        setPackages(response.data || response || []);
      } catch (error) {
        console.error('Error fetching packages:', error);
        toast({
          title: "Σφάλμα",
          description: "Αποτυχία φόρτωσης πακέτων. Παρακαλώ δοκιμάστε ξανά.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPackages();
  }, [toast]);

  const handleCreatePackage = async () => {
    try {
      setIsCreating(true);
      
      if (!formData.name || formData.price <= 0) {
        toast({
          title: "Σφάλμα",
          description: "Το όνομα και η τιμή του πακέτου είναι υποχρεωτικά.",
          variant: "destructive",
        });
        return;
      }

      const response = await packagesApi.create(formData);
      const newPackage = response.data || response;
      
      setPackages([...packages, newPackage]);
      setIsDialogOpen(false);
      toast({
        title: "Επιτυχία",
        description: `Το πακέτο "${formData.name}" δημιουργήθηκε.`,
      });
      resetForm();
    } catch (error) {
      console.error('Error creating package:', error);
      toast({
        title: "Σφάλμα",
        description: "Αποτυχία δημιουργίας πακέτου. Παρακαλώ δοκιμάστε ξανά.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Open edit dialog with prefilled data
  const openEditDialog = (pkg: any) => {
    setEditingPackage(pkg);
    setEditForm({
      name: pkg.name || "",
      price: Number(pkg.price) || 0,
      sessions: isFinite(pkg.sessions) ? Number(pkg.sessions) : 0,
      duration: Number(pkg.duration) || 30,
      type: pkg.type || "Personal",
      status: (pkg.status === 'inactive' ? 'inactive' : 'active'),
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdatePackage = async () => {
    if (!editingPackage?.id) return;
    try {
      setIsUpdating(true);
      if (!editForm.name || editForm.price <= 0) {
        toast({ title: "Σφάλμα", description: "Το όνομα και η τιμή είναι υποχρεωτικά.", variant: "destructive" });
        return;
      }
      const response = await packagesApi.update(editingPackage.id.toString(), editForm);
      const updated = (response as any)?.data || response;
      setPackages(prev => prev.map(p => (p.id === editingPackage.id ? { ...p, ...updated } : p)));
      setIsEditDialogOpen(false);
      toast({ title: "Επιτυχία", description: `Το πακέτο "${editForm.name}" ενημερώθηκε.` });
    } catch (error) {
      console.error('Error updating package:', error);
      toast({ title: "Σφάλμα", description: "Αποτυχία ενημέρωσης πακέτου.", variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeletePackage = async (pkg: any) => {
    try {
      const confirmed = window.confirm(`Διαγραφή πακέτου "${pkg.name}";`);
      if (!confirmed) return;
      await packagesApi.delete(pkg.id.toString());
      setPackages(prev => prev.filter(p => p.id !== pkg.id));
      toast({ title: "Διαγράφηκε", description: `Το πακέτο "${pkg.name}" διαγράφηκε.` });
    } catch (error) {
      console.error('Error deleting package:', error);
      toast({ title: "Σφάλμα", description: "Αποτυχία διαγραφής πακέτου.", variant: "destructive" });
    }
  };
  
  const resetForm = () => {
    setFormData({
      name: "",
      price: 0,
      sessions: 10,
      duration: 30,
      type: "Personal",
      status: "active",
    });
  }

  // Filter packages based on search term
  const filteredPackages = packages.filter(pkg =>
    pkg.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: "active" | "inactive") => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Ενεργό</Badge>;
      case "inactive":
        return <Badge variant="secondary">Ανενεργό</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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
                <h1 className="text-3xl font-bold text-foreground">Διαχείριση Πακέτων</h1>
                <p className="text-muted-foreground">
                  Δημιουργία και επεξεργασία των πακέτων συνδρομών.
                </p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90 text-white">
                    <PackagePlus className="h-4 w-4 mr-2" />
                    Νέο Πακέτο
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Δημιουργία Νέου Πακέτου</DialogTitle>
                    <DialogDescription>Ορίστε τα χαρακτηριστικά του νέου πακέτου.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Όνομα Πακέτου</Label>
                      <Input id="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Π.χ. Personal Training - 12"/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="price">Τιμή (€)</Label>
                        <Input id="price" type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})}/>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="sessions">Αριθμός Συνεδριών</Label>
                        <Input id="sessions" type="number" value={formData.sessions} onChange={e => setFormData({...formData, sessions: Number(e.target.value)})}/>
                      </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="duration">Διάρκεια (ημέρες)</Label>
                            <Input id="duration" type="number" value={formData.duration} onChange={e => setFormData({...formData, duration: Number(e.target.value)})}/>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="type">Τύπος Πακέτου</Label>
                             <Select value={formData.type} onValueChange={value => setFormData({...formData, type: value})}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Επιλέξτε τύπο" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Personal">Personal</SelectItem>
                                    <SelectItem value="Group">Group</SelectItem>
                                    <SelectItem value="Yoga/Pilates">Yoga/Pilates</SelectItem>
                                    <SelectItem value="Trial">Trial</SelectItem>
                                    <SelectItem value="Other">Άλλο</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                  </div>
                  <Button onClick={handleCreatePackage} className="w-full" disabled={isCreating}>
                    {isCreating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Δημιουργία...
                      </>
                    ) : (
                      "Δημιουργία Πακέτου"
                    )}
                  </Button>
                </DialogContent>
              </Dialog>

              {/* Edit Package Dialog */}
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Επεξεργασία Πακέτου</DialogTitle>
                    <DialogDescription>Τροποποιήστε τα στοιχεία του πακέτου και αποθηκεύστε.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit_name">Όνομα Πακέτου</Label>
                      <Input id="edit_name" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="edit_price">Τιμή (€)</Label>
                        <Input id="edit_price" type="number" value={editForm.price} onChange={e => setEditForm({ ...editForm, price: Number(e.target.value) })} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="edit_sessions">Αριθμός Συνεδριών</Label>
                        <Input id="edit_sessions" type="number" value={editForm.sessions} onChange={e => setEditForm({ ...editForm, sessions: Number(e.target.value) })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="edit_duration">Διάρκεια (ημέρες)</Label>
                        <Input id="edit_duration" type="number" value={editForm.duration} onChange={e => setEditForm({ ...editForm, duration: Number(e.target.value) })} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="edit_type">Τύπος Πακέτου</Label>
                        <Select value={editForm.type} onValueChange={value => setEditForm({ ...editForm, type: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Επιλέξτε τύπο" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Personal">Personal</SelectItem>
                            <SelectItem value="Group">Group</SelectItem>
                            <SelectItem value="Yoga/Pilates">Yoga/Pilates</SelectItem>
                            <SelectItem value="Trial">Trial</SelectItem>
                            <SelectItem value="Other">Άλλο</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit_status">Κατάσταση</Label>
                      <Select value={editForm.status} onValueChange={(value: any) => setEditForm({ ...editForm, status: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Επιλέξτε κατάσταση" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Ενεργό</SelectItem>
                          <SelectItem value="inactive">Ανενεργό</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={handleUpdatePackage} className="w-full" disabled={isUpdating}>
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Αποθήκευση...
                      </>
                    ) : (
                      'Αποθήκευση'
                    )}
                  </Button>
                </DialogContent>
              </Dialog>
            </div>

            {/* Search */}
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Αναζήτηση πακέτων..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Λίστα Πακέτων</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Όνομα Πακέτου</TableHead>
                      <TableHead>Τύπος</TableHead>
                      <TableHead className="text-center">Συνεδρίες</TableHead>
                      <TableHead className="text-center">Διάρκεια</TableHead>
                      <TableHead className="text-center">Κατάσταση</TableHead>
                      <TableHead className="text-right">Τιμή</TableHead>
                      <TableHead className="text-right">Ενέργειες</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="flex items-center justify-center space-x-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-muted-foreground">Φόρτωση πακέτων...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredPackages.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="text-muted-foreground">
                            {searchTerm ? "Δεν βρέθηκαν πακέτα με τα τρέχοντα φίλτρα" : "Δεν υπάρχουν πακέτα"}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPackages.map((pkg: any) => (
                        <TableRow key={pkg.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">{pkg.name}</TableCell>
                          <TableCell>{pkg.type}</TableCell>
                          <TableCell className="text-center">
                            {isFinite(pkg.sessions) ? pkg.sessions : "Απεριόριστες"}
                          </TableCell>
                           <TableCell className="text-center">{pkg.duration} ημέρες</TableCell>
                          <TableCell className="text-center">{getStatusBadge(pkg.status)}</TableCell>
                          <TableCell className="text-right font-semibold">€{pkg.price}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" title="Επεξεργασία" onClick={() => openEditDialog(pkg)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" title="Διαγραφή" onClick={() => handleDeletePackage(pkg)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
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