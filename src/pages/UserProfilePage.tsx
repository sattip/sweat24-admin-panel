import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminHeader } from "@/components/AdminHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useParams, Link } from "react-router-dom";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarIcon, User, Mail, Phone, ArrowLeft, Package, Plus, Play, Pause, History, CalendarPlus, CreditCard } from "lucide-react";
import { mockUsersData } from "@/data/mockData";
import type { User as UserType, UserPackage } from "@/data/mockData";
import { notifyPackageExtension } from "@/utils/notifications";
import { PaymentInstallmentsModal } from "@/components/PaymentInstallmentsModal";


export function UserProfilePage() {
    const { userId } = useParams();
    const { toast } = useToast();
    
    const user: UserType | undefined = mockUsersData.find(u => u.id === userId);
    
    const [userPackages, setUserPackages] = useState<UserPackage[]>(user?.packages || []);

    const handleTogglePause = (packageId: string) => {
        setUserPackages(prevPackages => prevPackages.map(p => {
            if (p.id === packageId) {
                const newStatus = p.status === 'active' ? 'paused' : 'active';
                toast({
                    title: `Το πακέτο άλλαξε κατάσταση`,
                    description: `Το πακέτο "${p.name}" είναι τώρα ${newStatus === 'paused' ? 'σε παύση' : 'ενεργό'}.`
                });
                // TODO: Αυτή η αλλαγή πρέπει να αντικατοπτρίζεται και στο κεντρικό mockUsersData object
                // ή, σε μια πραγματική εφαρμογή, να γίνεται μέσω API call.
                return { ...p, status: newStatus };
            }
            return p;
        }));
    };

    const handleExtend = (packageId: string) => {
        setUserPackages(prevPackages => prevPackages.map(p => {
            if (p.id === packageId) {
                const currentExpiry = new Date(p.expiryDate);
                const newExpiryDate = new Date(currentExpiry.setDate(currentExpiry.getDate() + 30)).toISOString().split("T")[0];
                 toast({
                    title: "Επιτυχής Επέκταση",
                    description: `Η ημερομηνία λήξης για το πακέτο "${p.name}" επεκτάθηκε κατά 30 ημέρες.`,
                });
                
                // Ειδοποίηση στον ιδιοκτήτη
                if(user) {
                  notifyPackageExtension(
                    "Διαχειριστής Συστήματος", // TODO: Εδώ θα πρέπει να είναι το όνομα του συνδεδεμένου προπονητή
                    user.name,
                    p.id,
                    p.name,
                    30
                  );
                  toast({ 
                    title: "Ειδοποίηση Αποστάλθηκε", 
                    description: `Ο ιδιοκτήτης ενημερώθηκε για την επέκταση του πακέτου.`,
                    variant: "default"
                  });
                }
                
                return { ...p, expiryDate: newExpiryDate };
            }
            return p;
        }));
    };
    
    if (!user) {
        return (
             <div className="flex items-center justify-center h-screen">
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
        )
    }
    
    const getStatusBadge = (status) => {
        switch (status) {
            case "active": return <Badge className="bg-green-100 text-green-800">Ενεργό</Badge>;
            case "paused": return <Badge className="bg-yellow-100 text-yellow-800">Σε παύση</Badge>;
            case "expired": return <Badge variant="destructive">Έληξε</Badge>;
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
                         <Link to="/users" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
                            <ArrowLeft className="h-4 w-4" />
                            Επιστροφή στους Πελάτες
                        </Link>
                        
                        {/* User Header */}
                        <Card>
                            <CardContent className="p-6 flex items-start gap-6">
                                <Avatar className="w-24 h-24 border">
                                    <AvatarImage src={user.avatar} />
                                    <AvatarFallback className="text-3xl">{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <h1 className="text-3xl font-bold text-foreground">{user.name}</h1>
                                    <div className="text-muted-foreground space-y-2 mt-2">
                                        <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> {user.email}</div>
                                        <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> {user.phone}</div>
                                        <div className="flex items-center gap-2"><CalendarIcon className="h-4 w-4" /> Μέλος από: {user.joinDate}</div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button><Plus className="mr-2 h-4 w-4"/>Ανάθεση Πακέτου</Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                             <DialogHeader>
                                                <DialogTitle>Ανάθεση Νέου Πακέτου</DialogTitle>
                                            </DialogHeader>
                                            {/* TODO: Form to assign a package */}
                                            <p>Εδώ θα μπει φόρμα για επιλογή και ανάθεση πακέτου.</p>
                                        </DialogContent>
                                    </Dialog>
                                    <PaymentInstallmentsModal customerId={userId} />
                                </div>
                            </CardContent>
                        </Card>

                        {/* User Packages */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Πακέτα Συνδρομών</CardTitle>
                                <CardDescription>Ενεργές και παλαιότερες συνδρομές του πελάτη.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Πακέτο</TableHead>
                                            <TableHead>Κατάσταση</TableHead>
                                            <TableHead>Απομένουν</TableHead>
                                            <TableHead>Ημ/νία Λήξης</TableHead>
                                            <TableHead className="text-right">Ενέργειες</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {userPackages.map(p => (
                                            <TableRow key={p.id}>
                                                <TableCell className="font-medium">{p.name}</TableCell>
                                                <TableCell>{getStatusBadge(p.status)}</TableCell>
                                                <TableCell>{isFinite(p.remainingSessions) ? p.remainingSessions : 'Απεριόριστες'}</TableCell>
                                                <TableCell>{new Date(p.expiryDate).toLocaleDateString('el-GR')}</TableCell>
                                                <TableCell className="text-right space-x-1">
                                                    <Button variant="outline" size="sm" onClick={() => handleTogglePause(p.id)} disabled={p.status === 'expired'}>
                                                        {p.status === 'active' ? <Pause className="h-4 w-4 mr-1"/> : <Play className="h-4 w-4 mr-1"/>}
                                                        {p.status === 'active' ? 'Παύση' : 'Ενεργοποίηση'}
                                                    </Button>
                                                    <Button variant="outline" size="sm" onClick={() => handleExtend(p.id)} disabled={p.status === 'expired'}>
                                                        <CalendarPlus className="h-4 w-4 mr-1"/>
                                                        Επέκταση
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                         {/* Activity Log */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Ιστορικό Δραστηριότητας</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                     <TableHeader>
                                        <TableRow>
                                            <TableHead>Ημερομηνία</TableHead>
                                            <TableHead>Ενέργεια</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                       {user.activityLog.map((log, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{new Date(log.date).toLocaleDateString('el-GR')}</TableCell>
                                                <TableCell>{log.action}</TableCell>
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