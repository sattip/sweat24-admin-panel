import { useState } from "react";
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
import { PackagePlus, Edit, Trash2, Package as PackageIcon, Search } from "lucide-react";
import { mockPackagesData } from "@/data/mockData";
import type { Package } from "@/data/mockData";

export function PackagesPage() {
  const { toast } = useToast();
  const [packages, setPackages] = useState<Package[]>(mockPackagesData);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Omit<Package, 'id'>>({
    name: "",
    price: 0,
    sessions: 10,
    duration: 30,
    type: "Personal",
    status: "active",
  });

  const handleCreatePackage = () => {
    if (!formData.name || formData.price <= 0) {
      toast({
        title: "Σφάλμα",
        description: "Το όνομα και η τιμή του πακέτου είναι υποχρεωτικά.",
        variant: "destructive",
      });
      return;
    }

    const newPackage: Package = {
      id: `pkg_${Date.now()}`,
      ...formData,
    };
    
    // TODO: Σε πραγματική εφαρμογή, θα κάναμε API call για αποθήκευση
    // και μετά θα κάναμε refetch τα πακέτα ή θα ενημερώναμε το global state.
    setPackages([...packages, newPackage]);
    setIsDialogOpen(false);
    toast({
      title: "Επιτυχία",
      description: `Το πακέτο "${formData.name}" δημιουργήθηκε.`,
    });
    resetForm();
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
                    <DialogDescription>
                      Ορίστε τα χαρακτηριστικά του νέου πακέτου.
                    </DialogDescription>
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
                  <Button onClick={handleCreatePackage} className="w-full">Δημιουργία Πακέτου</Button>
                </DialogContent>
              </Dialog>
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
                    {packages.map((pkg: Package) => (
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
                          <Button variant="ghost" size="icon" title="Επεξεργασία">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" title="Διαγραφή">
                            <Trash2 className="h-4 w-4" />
                          </Button>
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