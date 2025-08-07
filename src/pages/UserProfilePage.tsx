import { useState, useEffect } from "react";
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
import { Calendar as CalendarIcon, User, Mail, Phone, ArrowLeft, Package, Plus, Play, Pause, History, CalendarPlus, CreditCard, Edit, CheckCircle, XCircle, Clock, AlertTriangle, Check, X, Users, Heart, UserCheck, Share2 } from "lucide-react";
import type { User as UserType, UserPackage } from "@/data/mockData";
import { notifyPackageExtension } from "@/utils/notifications";
import { PaymentInstallmentsModal } from "@/components/PaymentInstallmentsModal";
import SignatureDisplay from "@/components/SignatureDisplay";
import { apiService, usersApi } from "@/services/apiService";


export function UserProfilePage() {
    const { userId } = useParams();
    const { toast } = useToast();
    
    const [user, setUser] = useState<UserType | undefined>(undefined);
    const [fullProfile, setFullProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [userPackages, setUserPackages] = useState<UserPackage[]>([]);
    const [signatures, setSignatures] = useState<any[]>([]);
    const [loadingSignatures, setLoadingSignatures] = useState(false);
    
    useEffect(() => {
        if (userId) {
            fetchUserData();
            fetchSignatures();
        }
    }, [userId]);

    const handleApproveUser = async () => {
        if (!userId || !user) return;
        
        try {
            const response = await usersApi.approve(userId);
            toast({
                title: "Επιτυχία",
                description: response.message || "Ο χρήστης εγκρίθηκε επιτυχώς.",
            });
            // Force refresh user data to update status
            console.log('Approval response:', response);
            await fetchUserData();
            // Small delay to ensure backend has processed the change
            setTimeout(async () => {
                await fetchUserData();
            }, 1000);
        } catch (error) {
            console.error('Error approving user:', error);
            const errorMessage = error?.response?.data?.message || error?.message || "Αποτυχία έγκρισης χρήστη. Παρακαλώ δοκιμάστε ξανά.";
            toast({
                title: "Σφάλμα",
                description: errorMessage,
                variant: "destructive"
            });
        }
    };

    const handleRejectUser = async () => {
        if (!userId || !user) return;
        
        if (!confirm('Είστε σίγουροι ότι θέλετε να απορρίψετε αυτόν τον χρήστη;')) {
            return;
        }
        
        try {
            const response = await usersApi.reject(userId);
            toast({
                title: "Επιτυχία", 
                description: response.message || "Ο χρήστης απορρίφθηκε.",
            });
            // Refresh user data to update status
            await fetchUserData();
        } catch (error) {
            console.error('Error rejecting user:', error);
            toast({
                title: "Σφάλμα",
                description: "Αποτυχία απόρριψης χρήστη. Παρακαλώ δοκιμάστε ξανά.",
                variant: "destructive"
            });
        }
    };
    
    const fetchUserData = async () => {
        if (!userId) return;
        
        setLoading(true);
        try {
            // Fetch both user data and full profile in parallel
            const [userData, fullProfileResponse] = await Promise.allSettled([
                usersApi.getById(userId),
                usersApi.getFullProfile(userId)
            ]);
            
            if (userData.status === 'fulfilled') {
                setUser(userData.value);
                setUserPackages(userData.value.packages || []);
            }
            
            if (fullProfileResponse.status === 'fulfilled') {
                // Handle both response formats
                const profileData = fullProfileResponse.value.data || fullProfileResponse.value;
                setFullProfile(profileData);
            }
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
    
    const fetchSignatures = async () => {
        if (!userId) return;
        
        setLoadingSignatures(true);
        try {
            const response = await apiService.get(`/users/${userId}/signatures`);
            if (response.data?.signatures) {
                setSignatures(response.data.signatures);
            }
        } catch (error) {
            console.error('Error fetching signatures:', error);
            // Don't show error toast as signatures might not exist
        } finally {
            setLoadingSignatures(false);
        }
    };

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
    
    const getStatusBadge = (status) => {
        switch (status) {
            case "active": return <Badge className="bg-green-100 text-green-800">Ενεργό</Badge>;
            case "paused": return <Badge className="bg-yellow-100 text-yellow-800">Σε παύση</Badge>;
            case "expired": return <Badge variant="destructive">Έληξε</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getUserStatusBadge = (status: string) => {
        switch (status) {
            case "active": 
                return (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Ενεργός Πελάτης
                    </Badge>
                );
            case "inactive": 
                return (
                    <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                        <Clock className="h-3 w-3 mr-1" />
                        Ανενεργός
                    </Badge>
                );
            case "expired": 
                return (
                    <Badge variant="destructive">
                        <XCircle className="h-3 w-3 mr-1" />
                        Λήγμένη Συνδρομή
                    </Badge>
                );
            case "pending_approval":
                return (
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Εκκρεμεί Έγκριση
                    </Badge>
                );
            case "suspended":
                return (
                    <Badge className="bg-red-100 text-red-800 border-red-200">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Αναστολή Λογαριασμού
                    </Badge>
                );
            default: 
                return (
                    <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        {status}
                    </Badge>
                );
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
                        
                        {/* Pending Approval Alert */}
                        {(user.status === 'pending_approval' || user.status?.toLowerCase()?.trim() === 'pending_approval') && (
                            <Card className="border-yellow-200 bg-yellow-50 mb-4">
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <AlertTriangle className="h-6 w-6 text-yellow-600" />
                                            <div>
                                                <h3 className="font-semibold text-yellow-900">Αναμονή Έγκρισης</h3>
                                                <p className="text-sm text-yellow-700">Αυτός ο χρήστης περιμένει έγκριση για να ενεργοποιηθεί ο λογαριασμός του.</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={handleApproveUser}
                                                className="bg-green-600 hover:bg-green-700 text-white"
                                                size="sm"
                                            >
                                                <Check className="mr-2 h-4 w-4"/>
                                                Έγκριση
                                            </Button>
                                            <Button
                                                onClick={handleRejectUser}
                                                variant="destructive"
                                                size="sm"
                                            >
                                                <X className="mr-2 h-4 w-4"/>
                                                Απόρριψη
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                        
                        {/* User Header */}
                        <Card>
                            <CardContent className="p-6 flex items-start gap-6">
                                <Avatar className="w-24 h-24 border">
                                    <AvatarImage src={user.avatar} />
                                    <AvatarFallback className="text-3xl">{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <h1 className="text-3xl font-bold text-foreground">{user.name}</h1>
                                        {getUserStatusBadge(user.status)}
                                    </div>
                                    <div className="text-muted-foreground space-y-2">
                                        <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> {user.email}</div>
                                        <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> {user.phone}</div>
                                        <div className="flex items-center gap-2"><CalendarIcon className="h-4 w-4" /> Μέλος από: {user.joinDate}</div>
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4" /> 
                                            Τύπος Συνδρομής: <span className="font-medium">{user.membershipType}</span>
                                        </div>
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
                                <div className="flex gap-2 flex-wrap">
                                    {(user.status === 'pending_approval' || user.status?.toLowerCase()?.trim() === 'pending_approval') && (
                                        <>
                                            <Button
                                                onClick={handleApproveUser}
                                                className="bg-green-600 hover:bg-green-700 text-white"
                                            >
                                                <Check className="mr-2 h-4 w-4"/>
                                                Έγκριση Χρήστη
                                            </Button>
                                            <Button
                                                onClick={handleRejectUser}
                                                variant="destructive"
                                            >
                                                <X className="mr-2 h-4 w-4"/>
                                                Απόρριψη Χρήστη
                                            </Button>
                                        </>
                                    )}
                                    <Link to={`/users/${userId}/edit`}>
                                        <Button variant="outline">
                                            <Edit className="mr-2 h-4 w-4"/>
                                            Επεξεργασία
                                        </Button>
                                    </Link>
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
                                                <AlertTriangle className="h-4 w-4 text-yellow-600" />
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
                                                            <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
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
                                       {user.activityLog && user.activityLog.length > 0 ? (
                                           user.activityLog.map((log, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{new Date(log.date).toLocaleDateString('el-GR')}</TableCell>
                                                    <TableCell>{log.action}</TableCell>
                                                </TableRow>
                                           ))
                                       ) : (
                                           <TableRow>
                                               <TableCell colSpan={2} className="text-center text-muted-foreground">
                                                   Δεν υπάρχει ιστορικό δραστηριότητας
                                               </TableCell>
                                           </TableRow>
                                       )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                        
                        {/* Digital Signatures */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Edit className="h-5 w-5" />
                                    Ψηφιακές Υπογραφές & Συμφωνίες
                                </CardTitle>
                                <CardDescription>
                                    Ιστορικό υπογραφών όρων χρήσης, συμβολαίων και άλλων εγγράφων
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loadingSignatures ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Clock className="h-4 w-4 animate-spin" />
                                            Φόρτωση υπογραφών...
                                        </div>
                                    </div>
                                ) : signatures.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="rounded-full bg-muted p-3">
                                                <Edit className="h-6 w-6 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-foreground">Δεν υπάρχουν υπογραφές</p>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    Ο πελάτης δεν έχει υπογράψει ακόμα κανένα έγγραφο
                                                </p>
                                            </div>
                                            <Badge variant="outline" className="mt-2">
                                                <AlertTriangle className="h-3 w-3 mr-1" />
                                                Απαιτείται υπογραφή όρων χρήσης
                                            </Badge>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                                <span className="text-sm font-medium text-green-700">
                                                    {signatures.length} έγγραφα υπογεγραμμένα
                                                </span>
                                            </div>
                                            <Badge className="bg-green-100 text-green-800">
                                                Πλήρης Συμμόρφωση
                                            </Badge>
                                        </div>
                                        <SignatureDisplay signatures={signatures} />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
} 