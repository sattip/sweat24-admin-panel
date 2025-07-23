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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import {
  Edit,
  Trash2,
  Plus,
  Copy,
  Gift,
  Users,
  TrendingUp,
} from "lucide-react";
import { referralApi } from "@/api/modules/referral";
import { loyaltyApi, LoyaltyReward } from "@/api/modules/loyalty";
import { referralTiersApi, ReferralTier } from "@/api/modules/referralTiers";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReferralCode {
  id: number;
  code: string;
  user_id: number;
  referred_users_count: number;
  points_earned: number;
  user?: {
    name: string;
    email: string;
  };
}

interface ReferralReward {
  id: number;
  name: string;
  description: string;
  points_required: number;
  is_active: boolean;
  redemptions_count?: number;
}

interface Referral {
  id: number;
  referral_code_id: number;
  referred_user_id: number;
  points_awarded: number;
  status: string;
  created_at: string;
  referralCode?: ReferralCode;
  referredUser?: {
    name: string;
    email: string;
  };
}

interface MockLoyaltyReward {
  id: number;
  name: string;
  description: string;
  points_cost: number; // Αλλάζω από points_required σε points_cost
  type: string; // Νέο πεδίο που περιμένει η βάση
  is_active: boolean;
  redemptions_count: number;
}

interface Statistics {
  total_users: number;
  active_loyalty_rewards: number;
  total_points_distributed: number;
  total_redemptions: number;
  active_referral_tiers: number;
  total_referrals: number;
  conversion_rate: number;
}


export default function ReferralProgramPage() {
  const { toast } = useToast();
  const [codes, setCodes] = useState<ReferralCode[]>([]);
  const [rewards, setRewards] = useState<ReferralReward[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loyaltyRewards, setLoyaltyRewards] = useState<LoyaltyReward[]>([]);
  const [referralTiers, setReferralTiers] = useState<ReferralTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [openLoyaltyDialog, setOpenLoyaltyDialog] = useState(false);
  const [openTierDialog, setOpenTierDialog] = useState(false);
  const [editingLoyaltyReward, setEditingLoyaltyReward] = useState<LoyaltyReward | null>(null);
  const [editingTier, setEditingTier] = useState<ReferralTier | null>(null);
  // Αφαιρώ τα παλιά rewardFormData που προκαλούν conflicts
  const [loyaltyFormData, setLoyaltyFormData] = useState({
    name: '',
    description: '',
    points_cost: 0,
    type: 'product',
    is_active: true,
    duration_days: 30, // ΜΟΝΟ ΑΥΤΟ - ΟΧΙ duration_type!
  });
  
  const [tierFormData, setTierFormData] = useState({
    name: '',
    description: '',
    referrals_required: 1,
    reward_type: 'discount' as 'discount' | 'free_month' | 'personal_training' | 'custom',
    reward_value: '',
    is_active: true,
    duration_days: 30, // ΜΟΝΟ ΑΥΤΟ - ΟΧΙ duration_type!
  });
  const [activeTab, setActiveTab] = useState("loyalty-gifts");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchLoyaltyRewards(),
        fetchReferralTiers(),
        // Αφαιρώ τα παλιά endpoints που δεν χρειάζονται πια
      ]);
          } catch (error) {
        console.error('Error fetching data:', error);
        // Backend endpoints δεν είναι έτοιμα ακόμα
        setLoyaltyRewards([]);
        setReferralTiers([]);
        // Δεν εμφανίζουμε error message γιατί ξέρουμε ότι τα endpoints δεν υπάρχουν
              setReferralTiers([
         {
           id: 1,
           name: "Αρχάριος Παραπέμπων",
           description: "Δώρο για 5 επιτυχημένες παραπομπές",
           referrals_required: 5,
           reward_type: 'points' as const,
           reward_value: "100 πόντοι",
           is_active: true,
           achieved_count: 8
         },
         {
           id: 2,
           name: "Έμπειρος Παραπέμπων",
           description: "Δωρεάν μήνας για 10 παραπομπές",
           referrals_required: 10,
           reward_type: 'free_session' as const,
           reward_value: "1 μήνας",
           is_active: true,
           achieved_count: 3
         }
       ]);
       setReferrals([]);
       setCodes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCodes = async () => {
    try {
      const data = await referralApi.getCodes();
      setCodes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching referral codes:', error);
      setCodes([]);
    }
  };

  const fetchRewards = async () => {
    try {
      const data = await referralApi.getRewards();
      setRewards(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching rewards:', error);
      setRewards([]);
    }
  };

  const fetchReferrals = async () => {
    try {
      const data = await referralApi.getReferrals();
      setReferrals(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching referrals:', error);
      setReferrals([]);
    }
  };

  const fetchLoyaltyRewards = async () => {
    try {
      const response = await loyaltyApi.getRewards();
      // Laravel επιστρέφει paginated: {success: true, data: {data: [...]}}
      const data = response?.data?.data || response?.data || response;
      setLoyaltyRewards(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching loyalty rewards:', error);
      setLoyaltyRewards([]);
    }
  };

  const fetchReferralTiers = async () => {
    try {
      const response = await referralTiersApi.getTiers();
      // apiService επιστρέφει {data: {success: true, data: [...]}}
      const data = response?.data?.data || response?.data || response;
      setReferralTiers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching referral tiers:', error);
      setReferralTiers([]);
    }
  };

  // ΑΦΑΙΡΩ την προβληματική fetchLoyaltyRedemptions συνάρτηση

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Αντιγράφηκε!",
      description: `Ο κωδικός ${code} αντιγράφηκε στο πρόχειρο`,
    });
  };

  // Αφαιρέθηκε ο handleOpenRewardDialog που δεν χρειάζεται πια

  // Αφαιρέθηκαν οι παλιοί handlers που δεν χρειάζονται πια

  // Loyalty Rewards handlers
  const handleOpenLoyaltyDialog = (reward?: LoyaltyReward) => {
    if (reward) {
      setEditingLoyaltyReward(reward);
      setLoyaltyFormData({
        name: reward.name,
        description: reward.description,
        points_cost: reward.points_cost,
        type: reward.type || 'product',
        is_active: reward.is_active,
        duration_days: (reward as any).duration_days || 30,
      });
    } else {
      setEditingLoyaltyReward(null);
      setLoyaltyFormData({
        name: '',
        description: '',
        points_cost: 0,
        type: 'product',
        is_active: true,
        duration_days: 30,
      });
    }
    setOpenLoyaltyDialog(true);
  };

  const handleSubmitLoyaltyReward = async () => {
    try {
      // Validation check πριν στείλουμε στο backend
      if (!loyaltyFormData.name.trim()) {
        toast({
          title: "Σφάλμα",
          description: "Το όνομα είναι υποχρεωτικό",
          variant: "destructive",
        });
        return;
      }
      
      if (loyaltyFormData.points_cost <= 0) { // Αλλάζω από points_required σε points_cost
        toast({
          title: "Σφάλμα", 
          description: "Οι πόντοι πρέπει να είναι μεγαλύτεροι από 0",
          variant: "destructive",
        });
        return;
      }

      // Προετοιμασία δεδομένων για το backend
      const dataToSend = {
        name: loyaltyFormData.name.trim(),
        description: loyaltyFormData.description.trim(),
        points_cost: loyaltyFormData.points_cost,
        type: loyaltyFormData.type,
        is_active: loyaltyFormData.is_active,
        validity_days: loyaltyFormData.validity_days,
        quarterly_only: loyaltyFormData.quarterly_only,
        next_renewal_only: loyaltyFormData.next_renewal_only,
        terms_conditions: loyaltyFormData.terms_conditions,
        // Προσθέτουμε discount fields μόνο αν είναι discount type
        ...(loyaltyFormData.type === 'discount' && {
          discount_percentage: loyaltyFormData.discount_percentage,
          discount_amount: loyaltyFormData.discount_amount
        })
      };

      if (editingLoyaltyReward) {
        await loyaltyApi.updateReward(editingLoyaltyReward.id, dataToSend);
        toast({
          title: "Επιτυχία",
          description: "Το δώρο ανταμοιβής ενημερώθηκε",
        });
      } else {
        await loyaltyApi.createReward(dataToSend);
        toast({
          title: "Επιτυχία",
          description: "Το δώρο ανταμοιβής δημιουργήθηκε",
        });
      }
      fetchLoyaltyRewards();
      setOpenLoyaltyDialog(false);
    } catch (error: any) {
      console.error('Error saving loyalty reward:', error);
      
      // Διαφορετικά μηνύματα ανάλογα με τον τύπο error
      let errorMessage = "Αποτυχία αποθήκευσης";
      
      if (error?.response?.status === 422) {
        errorMessage = "Σφάλμα επικύρωσης: Ελέγξτε τα δεδομένα που εισάγατε";
        if (error?.response?.data?.errors) {
          const errors = Object.values(error.response.data.errors).flat().join(', ');
          errorMessage += `: ${errors}`;
        }
      } else if (error?.response?.status === 404) {
        errorMessage = "Το API endpoint δεν υπάρχει ακόμα στο backend";
      } else if (error?.message?.includes('HTTP error! status: 404')) {
        errorMessage = "Το API endpoint δεν υπάρχει ακόμα στο backend";
      } else if (error?.message?.includes('HTTP error! status: 422')) {
        errorMessage = "Σφάλμα επικύρωσης δεδομένων από το backend";
      }
      
      toast({
        title: "Σφάλμα",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleDeleteLoyaltyReward = async (id: number) => {
    if (window.confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε αυτό το δώρο ανταμοιβής;')) {
      try {
        await loyaltyApi.deleteReward(id);
        fetchLoyaltyRewards();
        toast({
          title: "Επιτυχία",
          description: "Το δώρο ανταμοιβής διαγράφηκε",
        });
      } catch (error) {
        console.error('Error deleting loyalty reward:', error);
        toast({
          title: "Σφάλμα",
          description: "Αποτυχία διαγραφής",
          variant: "destructive",
        });
      }
    }
  };

  // Referral Tiers handlers
  const handleOpenTierDialog = (tier?: ReferralTier) => {
    if (tier) {
      setEditingTier(tier);
      setTierFormData({
        name: tier.name,
        description: tier.description,
        referrals_required: tier.referrals_required,
        reward_type: tier.reward_type,
        reward_value: tier.reward_value ? tier.reward_value.toString() : '',
        is_active: tier.is_active,
        duration_days: (tier as any).duration_days || 30,
      });
    } else {
      setEditingTier(null);
      setTierFormData({
        name: '',
        description: '',
        referrals_required: 0,
        reward_type: 'discount',
        reward_value: '',
        is_active: true,
        duration_days: 30,
      });
    }
    setOpenTierDialog(true);
  };

  const handleSubmitTier = async () => {
    try {
      // Validation check πριν στείλουμε στο backend
      if (!tierFormData.name.trim()) {
        toast({
          title: "Σφάλμα",
          description: "Το όνομα είναι υποχρεωτικό",
          variant: "destructive",
        });
        return;
      }
      
      if (tierFormData.referrals_required <= 0) {
        toast({
          title: "Σφάλμα",
          description: "Οι απαιτούμενες συστάσεις πρέπει να είναι μεγαλύτερες από 0",
          variant: "destructive",
        });
        return;
      }

      // ΑΚΡΙΒΩΣ ΤΟ EXPECTED PAYLOAD
      const dataToSend: any = {
        referrals_required: tierFormData.referrals_required,
        name: tierFormData.name.trim(),
        description: tierFormData.description.trim(),
        reward_type: tierFormData.reward_type,
        validity_days: tierFormData.duration_days,  // ΑΠΟ ΤΗ ΦΟΡΜΑ - Ο ADMIN ΕΠΙΛΕΓΕΙ!
        quarterly_only: true,
        next_renewal_only: true
      };

      // ΜΟΝΟ για discount type - ΚΑΘΑΡΟ MAPPING
      if (tierFormData.reward_type === 'discount') {
        dataToSend.discount_percentage = parseFloat(tierFormData.reward_value) || 0;
      }

      // ΔΕΝ στέλνω quarterly_only, next_renewal_only, is_active, discount_amount!

      // 🚨 EXTREME DEBUG - ΔΕΙΧΝΩ ΤΑ ΠΑΝΤΑ!
      console.log('🚨🚨🚨 REFERRAL TIER PAYLOAD:', JSON.stringify(dataToSend, null, 2));
      console.log('🚨🚨🚨 validity_days EXISTS?', 'validity_days' in dataToSend);
      console.log('🚨🚨🚨 validity_days VALUE:', dataToSend.validity_days);
      alert('PAYLOAD: ' + JSON.stringify(dataToSend, null, 2));

      if (editingTier) {
        await referralTiersApi.updateTier(editingTier.id, dataToSend);
        toast({
          title: "Επιτυχία",
          description: "Το δώρο σύστασης ενημερώθηκε",
        });
      } else {
        await referralTiersApi.createTier(dataToSend);
        toast({
          title: "Επιτυχία",
          description: "Το δώρο σύστασης δημιουργήθηκε",
        });
      }
      fetchReferralTiers();
      setOpenTierDialog(false);
    } catch (error: any) {
      console.error('Error saving referral tier:', error);
      
      // Διαφορετικά μηνύματα ανάλογα με τον τύπο error
      let errorMessage = "Αποτυχία αποθήκευσης";
      
      if (error?.response?.status === 422) {
        errorMessage = "Σφάλμα επικύρωσης: Ελέγξτε τα δεδομένα που εισάγατε";
        if (error?.response?.data?.errors) {
          const errors = Object.values(error.response.data.errors).flat().join(', ');
          errorMessage += `: ${errors}`;
        }
      } else if (error?.response?.status === 404) {
        errorMessage = "Το API endpoint δεν υπάρχει ακόμα στο backend";
      } else if (error?.message?.includes('HTTP error! status: 404')) {
        errorMessage = "Το API endpoint δεν υπάρχει ακόμα στο backend";
      } else if (error?.message?.includes('HTTP error! status: 422')) {
        errorMessage = "Σφάλμα επικύρωσης δεδομένων από το backend";
      }
      
      toast({
        title: "Σφάλμα",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleDeleteTier = async (id: number) => {
    if (window.confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε αυτό το δώρο σύστασης;')) {
      try {
        await referralTiersApi.deleteTier(id);
        fetchReferralTiers();
        toast({
          title: "Επιτυχία",
          description: "Το δώρο σύστασης διαγράφηκε",
        });
      } catch (error) {
        console.error('Error deleting referral tier:', error);
        toast({
          title: "Σφάλμα",
          description: "Αποτυχία διαγραφής",
          variant: "destructive",
        });
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'completed':
        return 'success';
      case 'failed':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Εκκρεμεί';
      case 'completed':
        return 'Ολοκληρώθηκε';
      case 'failed':
        return 'Απέτυχε';
      default:
        return status;
    }
  };

  const getRewardTypeLabel = (type: string) => {
    switch (type) {
      case 'points':
        return 'Πόντοι';
      case 'discount':
        return 'Έκπτωση';
      case 'free_session':
        return 'Δωρεάν Συνεδρία';
      case 'product':
        return 'Προϊόν';
      case 'other':
        return 'Άλλο';
      default:
        return type;
    }
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
                <h1 className="text-3xl font-bold text-foreground">Προγράμματα & Ανταμοιβές</h1>
                <p className="text-muted-foreground">
                  Διαχείριση προγραμμάτων ανταμοιβής και συστάσεων
                </p>
              </div>
              <div className="flex gap-2">
                {/* Κουμπί Δώρο Ανταμοιβής - μόνο στο loyalty-gifts tab */}
                {activeTab === 'loyalty-gifts' && (
                  <Dialog open={openLoyaltyDialog} onOpenChange={setOpenLoyaltyDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-primary hover:bg-primary/90 text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        Νέο Δώρο Ανταμοιβής
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>
                          {editingLoyaltyReward ? 'Επεξεργασία Δώρου Ανταμοιβής' : 'Νέο Δώρο Ανταμοιβής'}
                        </DialogTitle>
                        <DialogDescription>
                          Συμπληρώστε τα στοιχεία του δώρου ανταμοιβής
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4 max-h-96 overflow-y-auto">
                        <div>
                          <Label htmlFor="loyalty-name">Όνομα</Label>
                          <Input
                            id="loyalty-name"
                            value={loyaltyFormData.name}
                            onChange={(e) => setLoyaltyFormData({...loyaltyFormData, name: e.target.value})}
                            placeholder="π.χ. Δωρεάν Personal Training"
                          />
                        </div>
                        <div>
                          <Label htmlFor="loyalty-description">Περιγραφή</Label>
                          <Textarea
                            id="loyalty-description"
                            value={loyaltyFormData.description}
                            onChange={(e) => setLoyaltyFormData({...loyaltyFormData, description: e.target.value})}
                            placeholder="Περιγράψτε το δώρο ανταμοιβής..."
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label htmlFor="loyalty-type">Τύπος Δώρου</Label>
                          <Select onValueChange={(value) => setLoyaltyFormData({...loyaltyFormData, type: value})} value={loyaltyFormData.type}>
                            <SelectTrigger>
                              <SelectValue placeholder="Επιλέξτε τύπο" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="product">Προϊόν</SelectItem>
                              <SelectItem value="discount">Έκπτωση</SelectItem>
                              <SelectItem value="service">Υπηρεσία</SelectItem>
                              <SelectItem value="voucher">Voucher</SelectItem>
                              <SelectItem value="other">Άλλο</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="loyalty-points">Απαιτούμενοι Πόντοι</Label>
                          <Input
                            id="loyalty-points"
                            type="number"
                            value={loyaltyFormData.points_cost} // Αλλάζω από points_required σε points_cost
                            onChange={(e) => setLoyaltyFormData({...loyaltyFormData, points_cost: parseInt(e.target.value) || 0})} // Αλλάζω από points_required σε points_cost
                            placeholder="π.χ. 100"
                          />
                        </div>
                        
                        {/* Διάρκεια σε ημέρες - ΑΠΛΟΠΟΙΗΜΕΝΗ ΜΟΡΦΗ */}
                        <div>
                          <Label htmlFor="loyalty-duration-days">Διάρκεια (ημέρες)</Label>
                          <Input
                            id="loyalty-duration-days"
                            type="number"
                            value={loyaltyFormData.duration_days}
                            onChange={(e) => setLoyaltyFormData({...loyaltyFormData, duration_days: parseInt(e.target.value) || 0})}
                            placeholder="π.χ. 30 (για 1 μήνα)"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Το δώρο θα είναι διαθέσιμο για χρήση για τόσες ημέρες από τη στιγμή της εξαργύρωσης
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="loyalty-active"
                            checked={loyaltyFormData.is_active}
                            onCheckedChange={(checked) => setLoyaltyFormData({...loyaltyFormData, is_active: checked})}
                          />
                          <Label htmlFor="loyalty-active">Ενεργό</Label>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setOpenLoyaltyDialog(false)}>
                          Ακύρωση
                        </Button>
                        <Button onClick={handleSubmitLoyaltyReward}>
                          Αποθήκευση
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
                
                {/* Κουμπί Δώρο Συστάσεων - μόνο στο referral-gifts tab */}
                {activeTab === 'referral-gifts' && (
                  <Dialog open={openTierDialog} onOpenChange={setOpenTierDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-primary hover:bg-primary/90 text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        Νέο Δώρο Συστάσεων
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>
                          {editingTier ? 'Επεξεργασία Δώρου Συστάσεων' : 'Νέο Δώρο Συστάσεων'}
                        </DialogTitle>
                        <DialogDescription>
                          Συμπληρώστε τα στοιχεία του δώρου συστάσεων
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4 max-h-96 overflow-y-auto">
                        <div>
                          <Label htmlFor="tier-name">Όνομα</Label>
                          <Input
                            id="tier-name"
                            value={tierFormData.name}
                            onChange={(e) => setTierFormData({...tierFormData, name: e.target.value})}
                            placeholder="π.χ. Χρήστης 100+ Συστάσεις"
                          />
                        </div>
                        <div>
                          <Label htmlFor="tier-description">Περιγραφή</Label>
                          <Textarea
                            id="tier-description"
                            value={tierFormData.description}
                            onChange={(e) => setTierFormData({...tierFormData, description: e.target.value})}
                            placeholder="Περιγράψτε το δώρο συστάσεων..."
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label htmlFor="tier-referrals">Απαιτούμενες Συστάσεις</Label>
                          <Input
                            id="tier-referrals"
                            type="number"
                            value={tierFormData.referrals_required}
                            onChange={(e) => setTierFormData({...tierFormData, referrals_required: parseInt(e.target.value) || 0})}
                            placeholder="π.χ. 100"
                          />
                        </div>
                        <div>
                          <Label htmlFor="tier-reward-type">Τύπος Ανταμοιβής</Label>
                          <Select onValueChange={(value) => setTierFormData({...tierFormData, reward_type: value as 'points' | 'discount' | 'free_session' | 'product' | 'other'})} value={tierFormData.reward_type}>
                            <SelectTrigger>
                              <SelectValue placeholder="Επιλέξτε τύπο" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="points">Πόντοι</SelectItem>
                              <SelectItem value="discount">Έκπτωση</SelectItem>
                              <SelectItem value="free_session">Δωρεάν Συνεδρία</SelectItem>
                              <SelectItem value="product">Προϊόν</SelectItem>
                              <SelectItem value="other">Άλλο</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="tier-reward-value">
                            {tierFormData.reward_type === 'discount' ? 'Ποσοστό Έκπτωσης (%)' : 'Τιμή Ανταμοιβής'}
                          </Label>
                          <Input
                            id="tier-reward-value"
                            type={tierFormData.reward_type === 'discount' ? 'number' : 'text'}
                            value={tierFormData.reward_value}
                            onChange={(e) => setTierFormData({...tierFormData, reward_value: e.target.value})}
                            placeholder={tierFormData.reward_type === 'discount' ? 'π.χ. 15' : 'π.χ. 100'}
                            min={tierFormData.reward_type === 'discount' ? '0' : undefined}
                            max={tierFormData.reward_type === 'discount' ? '100' : undefined}
                          />
                          {tierFormData.reward_type === 'discount' && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Εισάγετε ποσοστό έκπτωσης (0-100%)
                            </p>
                          )}
                        </div>
                        
                        {/* Διάρκεια σε ημέρες - ΑΠΛΟΠΟΙΗΜΕΝΗ ΜΟΡΦΗ */}
                        <div>
                          <Label htmlFor="tier-duration-days">Διάρκεια (ημέρες)</Label>
                          <Input
                            id="tier-duration-days"
                            type="number"
                            value={tierFormData.duration_days}
                            onChange={(e) => setTierFormData({...tierFormData, duration_days: parseInt(e.target.value) || 0})}
                            placeholder="π.χ. 30 (για 1 μήνα)"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Το δώρο θα είναι διαθέσιμο για χρήση για τόσες ημέρες από τη στιγμή της επίτευξης του tier
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="tier-active"
                            checked={tierFormData.is_active}
                            onCheckedChange={(checked) => setTierFormData({...tierFormData, is_active: checked})}
                          />
                          <Label htmlFor="tier-active">Ενεργό</Label>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setOpenTierDialog(false)}>
                          Ακύρωση
                        </Button>
                        <Button onClick={handleSubmitTier}>
                          Αποθήκευση
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList>
                <TabsTrigger value="loyalty-gifts">Δώρα Ανταμοιβής</TabsTrigger>
                <TabsTrigger value="referral-gifts">Δώρα Συστάσεων</TabsTrigger>
                <TabsTrigger value="loyalty-history">Ιστορικό Ανταμοιβών</TabsTrigger>
                <TabsTrigger value="referral-history">Ιστορικό Συστάσεων</TabsTrigger>
              </TabsList>

              <TabsContent value="loyalty-gifts" className="space-y-4">
                <Card>
                  <CardHeader>
                                <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Δώρα Προγράμματος Ανταμοιβής
            </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                          <p className="text-muted-foreground">Φόρτωση δώρων ανταμοιβής...</p>
                        </div>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Όνομα</TableHead>
                            <TableHead>Περιγραφή</TableHead>
                            <TableHead className="text-center">Πόντοι</TableHead>
                            <TableHead className="text-center">Εξαργυρώσεις</TableHead>
                            <TableHead className="text-center">Κατάσταση</TableHead>
                            <TableHead className="text-right">Ενέργειες</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {loyaltyRewards.map((reward) => (
                            <TableRow key={reward.id}>
                              <TableCell className="font-medium">{reward.name}</TableCell>
                              <TableCell>{reward.description}</TableCell>
                              <TableCell className="text-center">{reward.points_cost}</TableCell>
                              <TableCell className="text-center">{reward.redemptions_count || 0}</TableCell>
                              <TableCell className="text-center">
                                <Badge variant={reward.is_active ? "default" : "secondary"}>
                                  {reward.is_active ? 'Ενεργό' : 'Ανενεργό'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleOpenLoyaltyDialog(reward)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteLoyaltyReward(reward.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                          {loyaltyRewards.length === 0 && !loading && (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-8">
                                <div className="text-muted-foreground">
                                  <Gift className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                  <p>Δεν υπάρχουν δώρα ανταμοιβής.</p>
                                  <p className="text-sm">Δημιουργήστε το πρώτο δώρο χρησιμοποιώντας το κουμπί παραπάνω.</p>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="referral-gifts" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Κλιμακωτά Δώρα Συστάσεων</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Διαχείριση κλιμακωτών δώρων που κερδίζουν οι πελάτες ανάλογα με τον αριθμό συστάσεων.
                    </p>
                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                          <p className="text-muted-foreground">Φόρτωση δώρων συστάσεων...</p>
                        </div>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Όνομα</TableHead>
                            <TableHead>Περιγραφή</TableHead>
                            <TableHead className="text-center">Απαιτούμενες Συστάσεις</TableHead>
                            <TableHead className="text-center">Τύπος Ανταμοιβής</TableHead>
                            <TableHead className="text-center">Τιμή Ανταμοιβής</TableHead>
                            <TableHead className="text-center">Κατάσταση</TableHead>
                            <TableHead className="text-right">Ενέργειες</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {referralTiers.map((tier) => (
                            <TableRow key={tier.id}>
                              <TableCell className="font-medium">{tier.name}</TableCell>
                              <TableCell>{tier.description}</TableCell>
                              <TableCell className="text-center">{tier.referrals_required}</TableCell>
                              <TableCell className="text-center">{getRewardTypeLabel(tier.reward_type)}</TableCell>
                              <TableCell className="text-center">{tier.reward_value}</TableCell>
                              <TableCell className="text-center">
                                <Badge variant={tier.is_active ? "default" : "secondary"}>
                                  {tier.is_active ? 'Ενεργό' : 'Ανενεργό'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleOpenTierDialog(tier)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteTier(tier.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                          {referralTiers.length === 0 && !loading && (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center py-8">
                                <div className="text-muted-foreground">
                                  <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                  <p>Δεν υπάρχουν δώρα συστάσεων.</p>
                                  <p className="text-sm">Δημιουργήστε το πρώτο κλιμακωτό δώρο χρησιμοποιώντας το κουμπί παραπάνω.</p>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="loyalty-history" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Ιστορικό Ανταμοιβών</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Ιστορικό εξαργυρώσεων δώρων από το πρόγραμμα ανταμοιβής.
                    </p>
                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                          <p className="text-muted-foreground">Φόρτωση ιστορικού...</p>
                        </div>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Ημερομηνία</TableHead>
                            <TableHead>Χρήστης</TableHead>
                            <TableHead>Δώρο</TableHead>
                            <TableHead className="text-center">Πόντοι</TableHead>
                            <TableHead className="text-center">Κατάσταση</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {loyaltyRedemptions.map((redemption) => (
                            <TableRow key={redemption.id}>
                              <TableCell>
                                {redemption.redeemed_at ? new Date(redemption.redeemed_at).toLocaleDateString('el-GR') : 'N/A'}
                              </TableCell>
                              <TableCell>{redemption.user?.name || 'N/A'}</TableCell>
                              <TableCell>{redemption.loyaltyReward?.name || 'N/A'}</TableCell>
                              <TableCell className="text-center">{redemption.points_used || 0}</TableCell>
                              <TableCell className="text-center">
                                <Badge variant={redemption.status === 'completed' ? 'default' : 'secondary'}>
                                  {redemption.status === 'completed' ? 'Ολοκληρώθηκε' : 
                                   redemption.status === 'pending' ? 'Εκκρεμεί' : 'Ακυρώθηκε'}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                          {loyaltyRedemptions.length === 0 && !loading && (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-8">
                                <div className="text-muted-foreground">
                                  <Gift className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                  <p>Δεν υπάρχουν εξαργυρώσεις δώρων.</p>
                                  <p className="text-sm">Οι εξαργυρώσεις θα εμφανιστούν εδώ όταν οι πελάτες χρησιμοποιήσουν τα δώρα τους.</p>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="referral-history" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Ιστορικό Συστάσεων</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                          <p className="text-muted-foreground">Φόρτωση ιστορικού...</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Χρησιμοποιώ το υπάρχον περιεχόμενο από το παλιό history tab */}
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Ημερομηνία</TableHead>
                              <TableHead>Κωδικός</TableHead>
                              <TableHead>Νέος Χρήστης</TableHead>
                              <TableHead className="text-center">Πόντοι</TableHead>
                              <TableHead className="text-center">Κατάσταση</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {referrals.map((referral) => (
                              <TableRow key={referral.id}>
                                <TableCell>
                                  {new Date(referral.created_at).toLocaleDateString('el-GR')}
                                </TableCell>
                                <TableCell className="font-mono">{referral.referralCode?.code || 'N/A'}</TableCell>
                                <TableCell>{referral.referredUser?.name || 'N/A'}</TableCell>
                                <TableCell className="text-center">{referral.points_awarded}</TableCell>
                                <TableCell className="text-center">
                                  <Badge variant={getStatusColor(referral.status) as any}>
                                    {getStatusLabel(referral.status)}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                            {referrals.length === 0 && !loading && (
                              <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                  <div className="text-muted-foreground">
                                    <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>Δεν υπάρχουν συστάσεις ακόμα.</p>
                                    <p className="text-sm">Οι συστάσεις θα εμφανιστούν εδώ όταν οι πελάτες φέρουν νέους χρήστες.</p>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}