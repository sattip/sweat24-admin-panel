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
  redemptions_count: number;
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

export default function ReferralProgramPage() {
  const { toast } = useToast();
  const [codes, setCodes] = useState<ReferralCode[]>([]);
  const [rewards, setRewards] = useState<ReferralReward[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [openRewardDialog, setOpenRewardDialog] = useState(false);
  const [editingReward, setEditingReward] = useState<ReferralReward | null>(null);
  const [rewardFormData, setRewardFormData] = useState({
    name: '',
    description: '',
    points_required: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchCodes(),
        fetchRewards(),
        fetchReferrals(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCodes = async () => {
    try {
      const data = await referralApi.getCodes();
      setCodes(data);
    } catch (error) {
      console.error('Error fetching referral codes:', error);
    }
  };

  const fetchRewards = async () => {
    try {
      const data = await referralApi.getRewards();
      setRewards(data);
    } catch (error) {
      console.error('Error fetching rewards:', error);
    }
  };

  const fetchReferrals = async () => {
    try {
      const data = await referralApi.getReferrals();
      setReferrals(data);
    } catch (error) {
      console.error('Error fetching referrals:', error);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Αντιγράφηκε!",
      description: `Ο κωδικός ${code} αντιγράφηκε στο πρόχειρο`,
    });
  };

  const handleOpenRewardDialog = (reward?: ReferralReward) => {
    if (reward) {
      setEditingReward(reward);
      setRewardFormData({
        name: reward.name,
        description: reward.description,
        points_required: reward.points_required,
        is_active: reward.is_active,
      });
    } else {
      setEditingReward(null);
      setRewardFormData({
        name: '',
        description: '',
        points_required: 0,
        is_active: true,
      });
    }
    setOpenRewardDialog(true);
  };

  const handleSubmitReward = async () => {
    try {
      if (editingReward) {
        await referralApi.updateReward(editingReward.id, rewardFormData);
        toast({
          title: "Επιτυχία",
          description: "Η επιβράβευση ενημερώθηκε",
        });
      } else {
        await referralApi.createReward(rewardFormData);
        toast({
          title: "Επιτυχία",
          description: "Η επιβράβευση δημιουργήθηκε",
        });
      }
      fetchRewards();
      setOpenRewardDialog(false);
    } catch (error) {
      console.error('Error saving reward:', error);
      toast({
        title: "Σφάλμα",
        description: "Αποτυχία αποθήκευσης",
        variant: "destructive",
      });
    }
  };

  const handleDeleteReward = async (id: number) => {
    if (window.confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε αυτή την επιβράβευση;')) {
      try {
        await referralApi.deleteReward(id);
        fetchRewards();
        toast({
          title: "Επιτυχία",
          description: "Η επιβράβευση διαγράφηκε",
        });
      } catch (error) {
        console.error('Error deleting reward:', error);
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
                <h1 className="text-3xl font-bold text-foreground">Πρόγραμμα Παραπομπών</h1>
                <p className="text-muted-foreground">
                  Διαχείριση κωδικών παραπομπής και επιβραβεύσεων
                </p>
              </div>
              <Dialog open={openRewardDialog} onOpenChange={setOpenRewardDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Νέα Επιβράβευση
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingReward ? 'Επεξεργασία Επιβράβευσης' : 'Νέα Επιβράβευση'}
                    </DialogTitle>
                    <DialogDescription>
                      Συμπληρώστε τα στοιχεία της επιβράβευσης
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div>
                      <Label htmlFor="name">Όνομα</Label>
                      <Input
                        id="name"
                        value={rewardFormData.name}
                        onChange={(e) => setRewardFormData({...rewardFormData, name: e.target.value})}
                        placeholder="π.χ. Δωρεάν μήνας"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Περιγραφή</Label>
                      <Textarea
                        id="description"
                        value={rewardFormData.description}
                        onChange={(e) => setRewardFormData({...rewardFormData, description: e.target.value})}
                        placeholder="Περιγράψτε την επιβράβευση..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="points">Απαιτούμενοι Πόντοι</Label>
                      <Input
                        id="points"
                        type="number"
                        value={rewardFormData.points_required}
                        onChange={(e) => setRewardFormData({...rewardFormData, points_required: parseInt(e.target.value)})}
                        placeholder="π.χ. 100"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="active"
                        checked={rewardFormData.is_active}
                        onCheckedChange={(checked) => setRewardFormData({...rewardFormData, is_active: checked})}
                      />
                      <Label htmlFor="active">Ενεργή</Label>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setOpenRewardDialog(false)}>
                      Ακύρωση
                    </Button>
                    <Button onClick={handleSubmitReward}>
                      Αποθήκευση
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Tabs defaultValue="codes" className="space-y-4">
              <TabsList>
                <TabsTrigger value="codes">Κωδικοί Παραπομπής</TabsTrigger>
                <TabsTrigger value="rewards">Επιβραβεύσεις</TabsTrigger>
                <TabsTrigger value="history">Ιστορικό Παραπομπών</TabsTrigger>
              </TabsList>

              <TabsContent value="codes" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Κωδικοί Παραπομπής</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Κωδικός</TableHead>
                          <TableHead>Χρήστης</TableHead>
                          <TableHead className="text-center">Παραπομπές</TableHead>
                          <TableHead className="text-center">Πόντοι</TableHead>
                          <TableHead className="text-right">Ενέργειες</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {codes.map((code) => (
                          <TableRow key={code.id}>
                            <TableCell className="font-mono">
                              <div className="flex items-center gap-2">
                                {code.code}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleCopyCode(code.code)}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>{code.user?.name || 'N/A'}</TableCell>
                            <TableCell className="text-center">{code.referred_users_count}</TableCell>
                            <TableCell className="text-center">{code.points_earned}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="rewards" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Επιβραβεύσεις</CardTitle>
                  </CardHeader>
                  <CardContent>
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
                        {rewards.map((reward) => (
                          <TableRow key={reward.id}>
                            <TableCell className="font-medium">{reward.name}</TableCell>
                            <TableCell>{reward.description}</TableCell>
                            <TableCell className="text-center">{reward.points_required}</TableCell>
                            <TableCell className="text-center">{reward.redemptions_count || 0}</TableCell>
                            <TableCell className="text-center">
                              <Badge variant={reward.is_active ? "success" : "secondary"}>
                                {reward.is_active ? 'Ενεργό' : 'Ανενεργό'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleOpenRewardDialog(reward)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteReward(reward.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Ιστορικό Παραπομπών</CardTitle>
                  </CardHeader>
                  <CardContent>
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
                      </TableBody>
                    </Table>
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