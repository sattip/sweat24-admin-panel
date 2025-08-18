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
import { Calendar as CalendarIcon, User, Mail, Phone, ArrowLeft, Package, Plus, Play, Pause, History, CalendarPlus, CreditCard, Edit, CheckCircle, XCircle, Clock, AlertTriangle, Check, X } from "lucide-react";
import type { User as UserType, UserPackage } from "@/data/mockData";
import { notifyPackageExtension } from "@/utils/notifications";
import { PaymentInstallmentsModal } from "@/components/PaymentInstallmentsModal";
import SignatureDisplay from "@/components/SignatureDisplay";
import { AssignPackageForm } from "@/components/AssignPackageForm";
import { apiService, usersApi } from "@/services/apiService";
import type { FullUserProfile } from "@/types/userProfile";
import { GuardianDetailsSection } from "@/components/profile/GuardianDetailsSection";
import { MedicalHistorySection } from "@/components/profile/MedicalHistorySection";
import { ReferralInfoSection } from "@/components/profile/ReferralInfoSection";
import { 
    getGenderDisplay, 
    formatGreekDate, 
    formatGreekTimestamp, 
    formatWeight, 
    formatHeight, 
    formatAge,
    displayField,
    formatRegistrationDate
} from "@/utils/userHelpers";


export function UserProfilePage() {
    const { userId } = useParams();
    const { toast } = useToast();
    
    const [user, setUser] = useState<UserType | undefined>(undefined);
    const [fullProfile, setFullProfile] = useState<FullUserProfile | null>(null);
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

    // Άκου μια παγκόσμια ειδοποίηση κατανάλωσης συνεδρίας για να ενημερώνεται άμεσα η λίστα πακέτων
    useEffect(() => {
        const handler = (e: Event) => {
            const detail = (e as CustomEvent).detail as { userId?: string; delta?: number } | undefined;
            if (!detail || !userId || String(detail.userId) !== String(userId)) return;
            const delta = typeof detail.delta === 'number' ? detail.delta : -1;

            setUserPackages(prev => prev.map(pkg => {
                const remaining = (pkg as any).remainingSessions ?? (pkg as any).remaining_sessions;
                const total = (pkg as any).totalSessions ?? (pkg as any).total_sessions;
                // Μόνο αν είναι πεπερασμένες συνεδρίες
                if (total == null) return pkg;
                const next = Math.max(0, (Number.isFinite(remaining) ? Number(remaining) : 0) + delta);
                return { ...pkg, remainingSessions: next } as any;
            }));
        };
        window.addEventListener('sweat:session-consumed', handler as EventListener);
        return () => window.removeEventListener('sweat:session-consumed', handler as EventListener);
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
                
                // Check if medical_history is in the user data itself
                if (userData.value.medical_history) {
                    // Transform and set it as fullProfile's medical_history
                    const medicalHistoryData = typeof userData.value.medical_history === 'string' 
                        ? JSON.parse(userData.value.medical_history) 
                        : userData.value.medical_history;
                    
                    const transformedMedicalHistory = {
                        has_ems_interest: medicalHistoryData.ems_interest === true,
                        ems_liability_accepted: medicalHistoryData.ems_liability_accepted === true,
                        ems_contraindications: medicalHistoryData.ems_contraindications || {},
                        other_medical_data: {
                            medical_conditions: medicalHistoryData.medical_conditions,
                            emergency_contact: medicalHistoryData.emergency_contact
                        }
                    };
                    
                    // Set a minimal fullProfile if we don't have one yet
                    setFullProfile(prev => ({
                        ...prev,
                        id: parseInt(userData.value.id),
                        full_name: userData.value.name,
                        email: userData.value.email,
                        is_minor: userData.value.is_minor || false,
                        registration_date: userData.value.created_at || userData.value.joinDate,
                        medical_history: transformedMedicalHistory
                    }));
                }
            } else {
                console.error('Failed to fetch user data:', userData.reason);
                toast({
                    title: "Σφάλμα",
                    description: "Αποτυχία φόρτωσης βασικών δεδομένων χρήστη.",
                    variant: "destructive"
                });
            }
            
            if (fullProfileResponse.status === 'fulfilled') {
                setFullProfile(fullProfileResponse.value);
            } else {
                // Log the error but don't show toast as full profile is optional enhancement
                console.warn('Failed to fetch full profile (optional):', fullProfileResponse.reason);
            }
        } catch (error) {
            console.error('Unexpected error in fetchUserData:', error);
            toast({
                title: "Σφάλμα",
                description: "Απροσδόκητο σφάλμα κατά τη φόρτωση δεδομένων.",
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
            if (response.data && typeof response.data === 'object' && 'signatures' in response.data) {
                setSignatures(response.data.signatures as any[]);
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

    const handleDeleteAssignedPackage = async (userPackageId: string) => {
        if (!userId) return;
        const confirmed = window.confirm('Σίγουρα θέλετε να διαγράψετε αυτό το πακέτο από τον πελάτη;');
        if (!confirmed) return;
        try {
            await usersApi.deleteAssignedPackage(userId, userPackageId);
            setUserPackages(prev => prev.filter(p => p.id !== userPackageId));
            toast({ title: 'Επιτυχία', description: 'Το πακέτο διαγράφηκε από τον πελάτη.' });
        } catch (error) {
            console.error('Error deleting assigned package:', error);
            toast({ title: 'Σφάλμα', description: 'Αποτυχία διαγραφής πακέτου.', variant: 'destructive' });
        }
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

    // Helpers: remaining sessions & expiry date formatting with backend field fallbacks
    const getRemainingSessionsLabel = (pkg: any) => {
        const remaining = (pkg?.remainingSessions ?? pkg?.remaining_sessions ?? undefined);
        const total = (pkg?.totalSessions ?? pkg?.total_sessions ?? undefined);
        if (total == null || remaining == null) return 'Απεριόριστες';
        return Number.isFinite(remaining) ? remaining : '—';
    };

    const getExpiryDateLabel = (pkg: any) => {
        const expiryRaw = (pkg?.expiryDate ?? pkg?.expiry_date ?? null);
        if (!expiryRaw) return 'Χωρίς λήξη';
        const d = new Date(expiryRaw);
        return Number.isNaN(d.getTime()) ? 'Χωρίς λήξη' : d.toLocaleDateString('el-GR');
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
                                        <div className="flex items-center gap-2">
                                            <CalendarIcon className="h-4 w-4" /> 
                                            Μέλος από: {formatRegistrationDate(user)}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4" /> 
                                            Τύπος Συνδρομής: <span className="font-medium">{user.membershipType}</span>
                                        </div>
                                        
                                        {/* New Fields - με safe display */}
                                        {user.date_of_birth && (
                                            <div className="flex items-center gap-2">
                                                <CalendarIcon className="h-4 w-4" /> 
                                                Ημ/νία Γέννησης: <span className="font-medium">{formatGreekDate(user.date_of_birth)}</span>
                                                <span className="text-sm">({formatAge(user.date_of_birth)})</span>
                                            </div>
                                        )}
                                        
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4" /> 
                                            Φύλο: <span className="font-medium">{displayField(getGenderDisplay(user.gender))}</span>
                                        </div>
                                        
                                        
                                        {user.profile_last_updated && (
                                            <div className="flex items-center gap-2 text-xs opacity-75">
                                                <Clock className="h-3 w-3" />
                                                Τελευταία ενημέρωση προφίλ: {formatGreekTimestamp(user.profile_last_updated)}
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
                                            <AssignPackageForm userId={userId!} onAssigned={() => fetchUserData()} />
                                        </DialogContent>
                                    </Dialog>
                                    <PaymentInstallmentsModal 
                                        customerId={userId} 
                                        isOpen={false} 
                                        onClose={() => {}} 
                                        onSuccess={() => {}}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Guardian Details - Only show if user is minor */}
                        {fullProfile?.is_minor && fullProfile?.guardian_details && (
                            <GuardianDetailsSection guardianDetails={fullProfile.guardian_details} />
                        )}

                        {/* Medical History - EMS */}
                        {/* Show medical history if it exists */}
                        {fullProfile?.medical_history && (
                            <MedicalHistorySection medicalHistory={fullProfile.medical_history} />
                        )}

                        {/* Referral Information */}
                        {fullProfile?.found_us_via && (
                            <ReferralInfoSection foundUsVia={fullProfile.found_us_via} />
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
                                                <TableCell>{getRemainingSessionsLabel(p)}</TableCell>
                                                <TableCell>{getExpiryDateLabel(p)}</TableCell>
                                                <TableCell className="text-right space-x-1">
                                                    <Button variant="outline" size="sm" onClick={() => handleTogglePause(p.id)} disabled={p.status === 'expired'}>
                                                        {p.status === 'active' ? <Pause className="h-4 w-4 mr-1"/> : <Play className="h-4 w-4 mr-1"/>}
                                                        {p.status === 'active' ? 'Παύση' : 'Ενεργοποίηση'}
                                                    </Button>
                                                    <Button variant="outline" size="sm" onClick={() => handleExtend(p.id)} disabled={p.status === 'expired'}>
                                                        <CalendarPlus className="h-4 w-4 mr-1"/>
                                                        Επέκταση
                                                    </Button>
                                                    <Button variant="destructive" size="sm" onClick={() => handleDeleteAssignedPackage(p.id)}>
                                                        Διαγραφή
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