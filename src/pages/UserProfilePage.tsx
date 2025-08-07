import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminHeader } from "@/components/AdminHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useParams, Link, useNavigate } from "react-router-dom";
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
  DialogDescription,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarIcon, User, Mail, Phone, ArrowLeft, Package, Plus, Play, Pause, History, CalendarPlus, CreditCard, Trash2, Loader2, Users, AlertCircle, Heart, UserCheck, Share2 } from "lucide-react";
import type { User as UserType, UserPackage, Package as PackageType } from "@/data/mockData";
import { notifyPackageExtension } from "@/utils/notifications";
import { PaymentInstallmentsModal } from "@/components/PaymentInstallmentsModal";
import { usersApi, userPackagesApi, packagesApi } from "@/services/apiService";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function UserProfilePage() {
    const { userId } = useParams();
    const { toast } = useToast();
    const navigate = useNavigate();
    
    const [user, setUser] = useState<UserType | null>(null);
    const [fullProfile, setFullProfile] = useState<any>(null);
    const [userPackages, setUserPackages] = useState<UserPackage[]>([]);
    const [availablePackages, setAvailablePackages] = useState<PackageType[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
    const [selectedPackageId, setSelectedPackageId] = useState("");
    const [isExtendDialogOpen, setIsExtendDialogOpen] = useState(false);
    const [extendDays, setExtendDays] = useState("30");
    const [selectedPackageForExtend, setSelectedPackageForExtend] = useState<string | null>(null);

    useEffect(() => {
        if (userId) {
            loadUserData();
        }
    }, [userId]);

    const loadUserData = async () => {
        try {
            setLoading(true);
            
            // Load user data and full profile
            const [userData, fullProfileData] = await Promise.all([
                usersApi.getById(userId!),
                usersApi.getFullProfile(userId!)
            ]);
            setUser(userData);
            setFullProfile(fullProfileData.data || fullProfileData);
            
            // Load user packages
            const packagesData = await userPackagesApi.getAll(userId!);
            setUserPackages(packagesData);
            
            // Load available packages for assignment
            const allPackages = await packagesApi.getAll();
            setAvailablePackages(allPackages);
            
        } catch (error) {
            // Failed to load user data - error handled with toast
            toast({
                title: "Σφάλμα",
                description: "Αποτυχία φόρτωσης δεδομένων χρήστη.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleTogglePause = async (packageId: string) => {
        try {
            const pkg = userPackages.find(p => p.id === packageId);
            if (!pkg) return;

            let updatedPackage;
            if (pkg.status === 'active') {
                updatedPackage = await userPackagesApi.pausePackage(packageId);
                toast({
                    title: "Πακέτο σε παύση",
                    description: `Το πακέτο "${pkg.name}" τέθηκε σε παύση.`
                });
            } else if (pkg.status === 'paused') {
                updatedPackage = await userPackagesApi.resumePackage(packageId);
                toast({
                    title: "Πακέτο ενεργοποιήθηκε",
                    description: `Το πακέτο "${pkg.name}" ενεργοποιήθηκε ξανά.`
                });
            }

            // Reload packages
            await loadUserData();
        } catch (error) {
            // Failed to toggle package status - error handled with toast
            toast({
                title: "Σφάλμα",
                description: "Αποτυχία αλλαγής κατάστασης πακέτου.",
                variant: "destructive"
            });
        }
    };

    const handleExtend = async () => {
        if (!selectedPackageForExtend || !extendDays) return;

        try {
            const pkg = userPackages.find(p => p.id === selectedPackageForExtend);
            if (!pkg) return;

            const days = parseInt(extendDays);
            await userPackagesApi.extendPackage(selectedPackageForExtend, days);
            
            toast({
                title: "Επιτυχής Επέκταση",
                description: `Η ημερομηνία λήξης για το πακέτο "${pkg.name}" επεκτάθηκε κατά ${days} ημέρες.`,
            });
            
            // Notify owner about extension
            if (user) {
                notifyPackageExtension(
                    "Διαχειριστής Συστήματος", // Get current admin name from auth context
                    user.name,
                    pkg.id,
                    pkg.name,
                    days
                );
                toast({ 
                    title: "Ειδοποίηση Αποστάλθηκε", 
                    description: `Ο ιδιοκτήτης ενημερώθηκε για την επέκταση του πακέτου.`,
                });
            }
            
            setIsExtendDialogOpen(false);
            setSelectedPackageForExtend(null);
            setExtendDays("30");
            await loadUserData();
        } catch (error) {
            // Failed to extend package - error handled with toast
            toast({
                title: "Σφάλμα",
                description: "Αποτυχία επέκτασης πακέτου.",
                variant: "destructive"
            });
        }
    };

    const handleAssignPackage = async () => {
        if (!selectedPackageId || !userId) return;

        try {
            await userPackagesApi.assignPackage(userId, selectedPackageId);
            
            const selectedPackage = availablePackages.find(p => p.id === selectedPackageId);
            toast({
                title: "Επιτυχής Ανάθεση",
                description: `Το πακέτο "${selectedPackage?.name}" ανατέθηκε στον πελάτη.`,
            });
            
            setIsAssignDialogOpen(false);
            setSelectedPackageId("");
            await loadUserData();
        } catch (error) {
            // Failed to assign package - error handled with toast
            toast({
                title: "Σφάλμα",
                description: "Αποτυχία ανάθεσης πακέτου.",
                variant: "destructive"
            });
        }
    };

    const handleDeleteUser = async () => {
        if (!userId) return;

        if (!window.confirm("Είστε σίγουροι ότι θέλετε να διαγράψετε αυτόν τον χρήστη;")) {
            return;
        }

        try {
            await usersApi.delete(userId);
            toast({
                title: "Επιτυχής Διαγραφή",
                description: "Ο χρήστης διαγράφηκε επιτυχώς.",
            });
            // Redirect to users page
            navigate('/users');
        } catch (error) {
            // Failed to delete user - error handled with toast
            toast({
                title: "Σφάλμα",
                description: "Αποτυχία διαγραφής χρήστη.",
                variant: "destructive"
            });
        }
    };
    
    if (loading) {
        return (
            <SidebarProvider>
                <div className="min-h-screen flex w-full bg-background">
                    <AdminSidebar />
                    <div className="flex-1 flex flex-col">
                        <AdminHeader />
                        <main className="flex-1 p-6 flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </main>
                    </div>
                </div>
            </SidebarProvider>
        );
    }
    
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
    
    const getStatusBadge = (status: string) => {
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
                                    <AvatarImage src={user.avatar || undefined} />
                                    <AvatarFallback className="text-3xl">{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <h1 className="text-3xl font-bold text-foreground">{user.name}</h1>
                                    <div className="text-muted-foreground space-y-2 mt-2">
                                        <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> {user.email}</div>
                                        <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> {user.phone}</div>
                                        <div className="flex items-center gap-2"><CalendarIcon className="h-4 w-4" /> Μέλος από: {new Date(user.joinDate).toLocaleDateString('el-GR')}</div>
                                        {user.medicalHistory && (
                                            <div className="mt-3">
                                                <p className="text-sm font-medium">Ιατρικό Ιστορικό:</p>
                                                <p className="text-sm">{user.medicalHistory}</p>
                                            </div>
                                        )}
                                        {fullProfile?.signature_url && (
                                            <div className="mt-3">
                                                <p className="text-sm font-medium mb-2">Υπογραφή Χρήστη:</p>
                                                <img 
                                                    src={fullProfile.signature_url} 
                                                    alt="Υπογραφή Χρήστη" 
                                                    className="max-w-[200px] border rounded p-2"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button><Plus className="mr-2 h-4 w-4"/>Ανάθεση Πακέτου</Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                             <DialogHeader>
                                                <DialogTitle>Ανάθεση Νέου Πακέτου</DialogTitle>
                                                <DialogDescription>
                                                    Επιλέξτε ένα πακέτο για να το αναθέσετε στον πελάτη
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4 py-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="package-select">Επιλογή Πακέτου</Label>
                                                    <Select value={selectedPackageId} onValueChange={setSelectedPackageId}>
                                                        <SelectTrigger id="package-select">
                                                            <SelectValue placeholder="Επιλέξτε πακέτο" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {availablePackages.map((pkg) => (
                                                                <SelectItem key={pkg.id} value={pkg.id}>
                                                                    {pkg.name} - €{pkg.price}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <Button onClick={handleAssignPackage} className="w-full">
                                                    Ανάθεση Πακέτου
                                                </Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                    <PaymentInstallmentsModal customerId={userId} />
                                    <Button variant="destructive" size="icon" onClick={handleDeleteUser}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Guardian Details - Only show if user is minor */}
                        {fullProfile?.is_minor && fullProfile?.guardian_details && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        Στοιχεία Ανήλικου & Κηδεμόνα
                                    </CardTitle>
                                    <CardDescription>Στοιχεία κηδεμόνα για ανήλικο μέλος</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium text-muted-foreground">Ονοματεπώνυμο Κηδεμόνα</p>
                                            <p className="text-sm">{fullProfile.guardian_details.full_name}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium text-muted-foreground">ΑΔΤ/Διαβατήριο</p>
                                            <p className="text-sm">{fullProfile.guardian_details.id_number}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium text-muted-foreground">Όνομα Πατέρα</p>
                                            <p className="text-sm">{fullProfile.guardian_details.father_name}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium text-muted-foreground">Όνομα Μητέρας</p>
                                            <p className="text-sm">{fullProfile.guardian_details.mother_name}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium text-muted-foreground">Ημερομηνία Γέννησης</p>
                                            <p className="text-sm">{new Date(fullProfile.guardian_details.birth_date).toLocaleDateString('el-GR')}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium text-muted-foreground">Τηλέφωνο</p>
                                            <p className="text-sm">{fullProfile.guardian_details.phone}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium text-muted-foreground">Email</p>
                                            <p className="text-sm">{fullProfile.guardian_details.email}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium text-muted-foreground">Διεύθυνση</p>
                                            <p className="text-sm">{fullProfile.guardian_details.address}, {fullProfile.guardian_details.city} {fullProfile.guardian_details.zip_code}</p>
                                        </div>
                                    </div>
                                    {fullProfile.guardian_details.signature_url && (
                                        <div className="pt-4 border-t">
                                            <p className="text-sm font-medium text-muted-foreground mb-2">Υπογραφή Κηδεμόνα</p>
                                            <img 
                                                src={fullProfile.guardian_details.signature_url} 
                                                alt="Υπογραφή Κηδεμόνα" 
                                                className="max-w-xs border rounded p-2"
                                            />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Medical History - EMS */}
                        {fullProfile?.medical_history?.has_ems_interest && (
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
                                            {fullProfile.medical_history.ems_liability_accepted ? (
                                                <UserCheck className="h-4 w-4 text-green-600" />
                                            ) : (
                                                <AlertCircle className="h-4 w-4 text-yellow-600" />
                                            )}
                                            <span className="text-sm font-medium">
                                                Αποδοχή Δήλωσης EMS: {fullProfile.medical_history.ems_liability_accepted ? "Ναι" : "Όχι"}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {fullProfile.medical_history.ems_contraindications && (
                                        <div className="pt-4 border-t">
                                            <p className="text-sm font-medium text-muted-foreground mb-3">Αντενδείξεις EMS</p>
                                            <div className="space-y-2">
                                                {Object.entries(fullProfile.medical_history.ems_contraindications).map(([condition, data]: [string, any]) => (
                                                    <div key={condition} className="flex items-start gap-2">
                                                        {data.has_condition ? (
                                                            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
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
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {fullProfile.medical_history.other_medical_data && (
                                        <div className="pt-4 border-t">
                                            <p className="text-sm font-medium text-muted-foreground mb-2">Επιπλέον Ιατρικά Στοιχεία</p>
                                            {fullProfile.medical_history.other_medical_data.medical_conditions?.medical_history && (
                                                <p className="text-sm mb-2">{fullProfile.medical_history.other_medical_data.medical_conditions.medical_history}</p>
                                            )}
                                            {fullProfile.medical_history.other_medical_data.emergency_contact && (
                                                <div className="text-sm">
                                                    <span className="font-medium">Επείγουσα Επαφή: </span>
                                                    {fullProfile.medical_history.other_medical_data.emergency_contact.name} - {fullProfile.medical_history.other_medical_data.emergency_contact.phone}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Referral Information */}
                        {fullProfile?.found_us_via && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Share2 className="h-5 w-5" />
                                        Πώς μας βρήκατε;
                                    </CardTitle>
                                    <CardDescription>Πηγή σύστασης και προσέλκυσης πελάτη</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-muted-foreground">Πηγή:</span>
                                            <Badge variant="outline">{fullProfile.found_us_via.source}</Badge>
                                        </div>
                                        
                                        {fullProfile.found_us_via.referrer_info && (
                                            <div className="pt-3 border-t space-y-2">
                                                <p className="text-sm font-medium text-muted-foreground">Στοιχεία Σύστασης</p>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-1">
                                                        <p className="text-xs text-muted-foreground">Όνομα Συστήσαντος</p>
                                                        <p className="text-sm font-medium">{fullProfile.found_us_via.referrer_info.referrer_name}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-xs text-muted-foreground">Κωδικός/Όνομα που Χρησιμοποιήθηκε</p>
                                                        <p className="text-sm font-medium">{fullProfile.found_us_via.referrer_info.code_or_name_used}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {fullProfile.found_us_via.sub_source && (
                                            <div className="pt-3 border-t">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-muted-foreground">Πλατφόρμα:</span>
                                                    <Badge variant="outline">{fullProfile.found_us_via.sub_source}</Badge>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* User Packages */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Πακέτα Συνδρομών</CardTitle>
                                <CardDescription>Ενεργές και παλαιότερες συνδρομές του πελάτη.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {userPackages.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        Δεν υπάρχουν πακέτα για αυτόν τον πελάτη.
                                    </div>
                                ) : (
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
                                                    <TableCell>{isFinite(p.remainingSessions) ? `${p.remainingSessions}/${p.totalSessions}` : 'Απεριόριστες'}</TableCell>
                                                    <TableCell>{new Date(p.expiryDate).toLocaleDateString('el-GR')}</TableCell>
                                                    <TableCell className="text-right space-x-1">
                                                        <Button variant="outline" size="sm" onClick={() => handleTogglePause(p.id)} disabled={p.status === 'expired'}>
                                                            {p.status === 'active' ? <Pause className="h-4 w-4 mr-1"/> : <Play className="h-4 w-4 mr-1"/>}
                                                            {p.status === 'active' ? 'Παύση' : 'Ενεργοποίηση'}
                                                        </Button>
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm" 
                                                            onClick={() => {
                                                                setSelectedPackageForExtend(p.id);
                                                                setIsExtendDialogOpen(true);
                                                            }} 
                                                            disabled={p.status === 'expired'}
                                                        >
                                                            <CalendarPlus className="h-4 w-4 mr-1"/>
                                                            Επέκταση
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>

                         {/* Activity Log */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Ιστορικό Δραστηριότητας</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {user.activityLog && user.activityLog.length > 0 ? (
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
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        Δεν υπάρχει ιστορικό δραστηριότητας.
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Extend Package Dialog */}
                        <Dialog open={isExtendDialogOpen} onOpenChange={setIsExtendDialogOpen}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Επέκταση Πακέτου</DialogTitle>
                                    <DialogDescription>
                                        Εισάγετε τον αριθμό ημερών για την επέκταση
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="extend-days">Ημέρες Επέκτασης</Label>
                                        <Input
                                            id="extend-days"
                                            type="number"
                                            value={extendDays}
                                            onChange={(e) => setExtendDays(e.target.value)}
                                            min="1"
                                            max="365"
                                        />
                                    </div>
                                    <Button onClick={handleExtend} className="w-full">
                                        Επέκταση Πακέτου
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