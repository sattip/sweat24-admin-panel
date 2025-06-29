import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Plus,
  Search,
  TrendingUp,
  TrendingDown,
  Ruler,
  Weight,
  Activity,
  Target,
  Dumbbell,
  Timer,
  Calculator,
  Save,
  Camera,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { assessmentsApi, usersApi } from "@/services/apiService";
import type { 
  Assessment, 
  BodyMeasurement, 
  EnduranceTest, 
  StrengthLog,
  User as UserType 
} from "@/data/mockData";

interface ClientWithStats {
  id: string;
  name: string;
  avatar: string | null;
  initials: string;
  lastAssessmentDate?: string;
  totalAssessments: number;
  latestBMI?: number;
  trend: 'improving' | 'stable' | 'declining';
}

export function AssessmentPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedClient, setSelectedClient] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [assessmentType, setAssessmentType] = useState("body");
  const [viewingClientData, setViewingClientData] = useState<string | null>(null);
  const [currentAssessmentDate, setCurrentAssessmentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  
  // Client data
  const [users, setUsers] = useState<UserType[]>([]);
  const [clientsWithAssessments, setClientsWithAssessments] = useState<ClientWithStats[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  
  const [bodyFormData, setBodyFormData] = useState<Partial<BodyMeasurement>>({
    weight: 0,
    height: 0,
    waist: 0,
    hips: 0,
    chest: 0,
    rightArm: 0,
    rightThigh: 0,
    bodyFat: 0,
    comments: ""
  });

  const [enduranceFormData, setEnduranceFormData] = useState<Partial<EnduranceTest>>({
    crunches: 0,
    pushups: 0,
    squats: 0,
    plank: 0,
    jumpingJacks: 0,
    rowing: "",
    comments: ""
  });

  const [strengthFormData, setStrengthFormData] = useState<Partial<StrengthLog>>({
    squat: "",
    benchPress: "",
    deadlift: "",
    shoulderPress: "",
    pullups: "",
    rowing: "",
    comments: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load all users
      const usersData = await usersApi.getAll();
      setUsers(usersData);
      
      // Load all assessments
      const assessmentsData = await assessmentsApi.getAll();
      setAssessments(assessmentsData);
      
      // Build clients with assessment stats
      const clientStats: ClientWithStats[] = await Promise.all(
        usersData.map(async (user) => {
          try {
            const stats = await assessmentsApi.getStats(user.id);
            return {
              id: user.id,
              name: user.name,
              avatar: user.avatar,
              initials: user.name.split(' ').map(n => n[0]).join(''),
              lastAssessmentDate: stats.lastAssessmentDate,
              totalAssessments: stats.totalAssessments,
              latestBMI: stats.latestBMI,
              trend: stats.trend,
            };
          } catch {
            // If stats fail, return basic info
            return {
              id: user.id,
              name: user.name,
              avatar: user.avatar,
              initials: user.name.split(' ').map(n => n[0]).join(''),
              totalAssessments: 0,
              trend: 'stable' as const,
            };
          }
        })
      );
      
      setClientsWithAssessments(clientStats.filter(c => c.totalAssessments > 0));
      
      // Set default viewing client if available
      if (clientStats.length > 0 && !viewingClientData) {
        setViewingClientData(clientStats[0].id);
      }
    } catch (error) {
      console.error('Failed to load assessment data:', error);
      toast({
        title: "Σφάλμα",
        description: "Αποτυχία φόρτωσης δεδομένων αξιολόγησης.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getCurrentClientData = () => {
    if (!viewingClientData) return { body: [], endurance: [], strength: [] };
    
    const clientAssessments = assessments.filter(a => a.clientId === viewingClientData);
    
    return {
      body: clientAssessments
        .filter(a => a.type === 'body')
        .map(a => ({ ...a.data as BodyMeasurement, date: a.date }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
      endurance: clientAssessments
        .filter(a => a.type === 'endurance')
        .map(a => ({ ...a.data as EnduranceTest, date: a.date }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
      strength: clientAssessments
        .filter(a => a.type === 'strength')
        .map(a => ({ ...a.data as StrengthLog, date: a.date }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    };
  };

  const filteredClients = clientsWithAssessments.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTrendBadge = (trend: string) => {
    switch (trend) {
      case "improving":
        return <Badge className="bg-green-100 text-green-800">Βελτίωση</Badge>;
      case "stable":
        return <Badge className="bg-blue-100 text-blue-800">Σταθερός</Badge>;
      case "declining":
        return <Badge className="bg-yellow-100 text-yellow-800">Παρακολούθηση</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Άγνωστο</Badge>;
    }
  };

  const calculateBMI = (weight: number, height: number) => {
    return (weight / ((height/100) ** 2)).toFixed(1);
  };

  const calculateDifference = (current: number, previous: number) => {
    const diff = current - previous;
    const percentage = ((diff / previous) * 100).toFixed(1);
    return { diff: diff.toFixed(1), percentage };
  };

  const getTrendIcon = (diff: number, isPositive = true) => {
    const actuallyPositive = isPositive ? diff > 0 : diff < 0;
    return actuallyPositive ? 
      <TrendingUp className="h-4 w-4 text-green-600" /> : 
      <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const resetFormData = () => {
    setBodyFormData({
      weight: 0,
      height: 0,
      waist: 0,
      hips: 0,
      chest: 0,
      rightArm: 0,
      rightThigh: 0,
      bodyFat: 0,
      comments: ""
    });
    setEnduranceFormData({
      crunches: 0,
      pushups: 0,
      squats: 0,
      plank: 0,
      jumpingJacks: 0,
      rowing: "",
      comments: ""
    });
    setStrengthFormData({
      squat: "",
      benchPress: "",
      deadlift: "",
      shoulderPress: "",
      pullups: "",
      rowing: "",
      comments: ""
    });
    setCurrentAssessmentDate(new Date().toISOString().split('T')[0]);
  };

  const handleSaveAssessment = async () => {
    if (!selectedClient) {
      toast({
        title: "Σφάλμα",
        description: "Παρακαλώ επιλέξτε πελάτη.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      
      let result;
      switch (assessmentType) {
        case "body":
          const bodyData: BodyMeasurement = {
            clientId: selectedClient,
            date: currentAssessmentDate,
            weight: Number(bodyFormData.weight) || 0,
            height: Number(bodyFormData.height) || 0,
            waist: Number(bodyFormData.waist) || 0,
            hips: Number(bodyFormData.hips) || 0,
            chest: Number(bodyFormData.chest) || 0,
            rightArm: Number(bodyFormData.rightArm) || 0,
            rightThigh: Number(bodyFormData.rightThigh) || 0,
            bodyFat: Number(bodyFormData.bodyFat) || 0,
            bmi: calculateBMI(Number(bodyFormData.weight) || 0, Number(bodyFormData.height) || 0),
            comments: bodyFormData.comments || ""
          };
          result = await assessmentsApi.createBodyMeasurement(bodyData);
          break;
          
        case "endurance":
          const enduranceData: EnduranceTest = {
            clientId: selectedClient,
            date: currentAssessmentDate,
            crunches: Number(enduranceFormData.crunches) || 0,
            pushups: Number(enduranceFormData.pushups) || 0,
            squats: Number(enduranceFormData.squats) || 0,
            plank: Number(enduranceFormData.plank) || 0,
            jumpingJacks: Number(enduranceFormData.jumpingJacks) || 0,
            rowing: enduranceFormData.rowing || "",
            comments: enduranceFormData.comments || ""
          };
          result = await assessmentsApi.createEnduranceTest(enduranceData);
          break;
          
        case "strength":
          const strengthData: StrengthLog = {
            clientId: selectedClient,
            date: currentAssessmentDate,
            squat: strengthFormData.squat || "",
            benchPress: strengthFormData.benchPress || "",
            deadlift: strengthFormData.deadlift || "",
            shoulderPress: strengthFormData.shoulderPress || "",
            pullups: strengthFormData.pullups || "",
            rowing: strengthFormData.rowing || "",
            comments: strengthFormData.comments || ""
          };
          result = await assessmentsApi.createStrengthLog(strengthData);
          break;
      }

      toast({
        title: "Επιτυχής Αποθήκευση",
        description: "Η αξιολόγηση αποθηκεύτηκε επιτυχώς.",
      });
      
      setIsDialogOpen(false);
      resetFormData();
      setSelectedClient("");
      await loadData();
    } catch (error) {
      console.error('Failed to save assessment:', error);
      toast({
        title: "Σφάλμα",
        description: "Αποτυχία αποθήκευσης αξιολόγησης.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
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
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Φόρτωση αξιολογήσεων...</p>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

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
                <h1 className="text-3xl font-bold text-foreground">Αξιολόγηση Προπόνησης</h1>
                <p className="text-muted-foreground">
                  Σωματομετρήσεις, μετρήσεις αντοχής και strength tracking
                </p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Νέα Αξιολόγηση
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Νέα Αξιολόγηση Προπόνησης</DialogTitle>
                    <DialogDescription>
                      Καταγράψτε νέες μετρήσεις για τον πελάτη
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Πελάτης</Label>
                        <Select value={selectedClient} onValueChange={setSelectedClient}>
                          <SelectTrigger>
                            <SelectValue placeholder="Επιλέξτε πελάτη" />
                          </SelectTrigger>
                          <SelectContent>
                            {users.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Τύπος Αξιολόγησης</Label>
                        <Select value={assessmentType} onValueChange={setAssessmentType}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="body">Σωματομετρήσεις</SelectItem>
                            <SelectItem value="endurance">Μετρήσεις Αντοχής</SelectItem>
                            <SelectItem value="strength">Strength Log</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Ημερομηνία Αξιολόγησης</Label>
                      <Input
                        type="date"
                        value={currentAssessmentDate}
                        onChange={(e) => setCurrentAssessmentDate(e.target.value)}
                      />
                    </div>

                    {assessmentType === "body" && (
                      <div className="grid gap-4">
                        <h3 className="text-lg font-semibold">Σωματομετρήσεις</h3>
                        <div className="grid grid-cols-4 gap-4">
                          <div>
                            <Label>Βάρος (kg)</Label>
                            <Input 
                              type="number" 
                              step="0.1"
                              value={bodyFormData.weight}
                              onChange={(e) => setBodyFormData({...bodyFormData, weight: parseFloat(e.target.value)})}
                            />
                          </div>
                          <div>
                            <Label>Ύψος (cm)</Label>
                            <Input 
                              type="number"
                              value={bodyFormData.height}
                              onChange={(e) => setBodyFormData({...bodyFormData, height: parseFloat(e.target.value)})}
                            />
                          </div>
                          <div>
                            <Label>Μέση (cm)</Label>
                            <Input 
                              type="number"
                              value={bodyFormData.waist}
                              onChange={(e) => setBodyFormData({...bodyFormData, waist: parseFloat(e.target.value)})}
                            />
                          </div>
                          <div>
                            <Label>Γοφοί (cm)</Label>
                            <Input 
                              type="number"
                              value={bodyFormData.hips}
                              onChange={(e) => setBodyFormData({...bodyFormData, hips: parseFloat(e.target.value)})}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                          <div>
                            <Label>Στήθος (cm)</Label>
                            <Input 
                              type="number"
                              value={bodyFormData.chest}
                              onChange={(e) => setBodyFormData({...bodyFormData, chest: parseFloat(e.target.value)})}
                            />
                          </div>
                          <div>
                            <Label>Μπράτσο Δεξί (cm)</Label>
                            <Input 
                              type="number"
                              value={bodyFormData.rightArm}
                              onChange={(e) => setBodyFormData({...bodyFormData, rightArm: parseFloat(e.target.value)})}
                            />
                          </div>
                          <div>
                            <Label>Μηρός Δεξί (cm)</Label>
                            <Input 
                              type="number"
                              value={bodyFormData.rightThigh}
                              onChange={(e) => setBodyFormData({...bodyFormData, rightThigh: parseFloat(e.target.value)})}
                            />
                          </div>
                          <div>
                            <Label>Ποσοστό Λίπους (%)</Label>
                            <Input 
                              type="number"
                              step="0.1"
                              value={bodyFormData.bodyFat}
                              onChange={(e) => setBodyFormData({...bodyFormData, bodyFat: parseFloat(e.target.value)})}
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Σχόλια</Label>
                          <Textarea 
                            value={bodyFormData.comments}
                            onChange={(e) => setBodyFormData({...bodyFormData, comments: e.target.value})}
                            placeholder="Παρατηρήσεις και σχόλια..."
                          />
                        </div>
                      </div>
                    )}

                    {assessmentType === "endurance" && (
                      <div className="grid gap-4">
                        <h3 className="text-lg font-semibold">Μετρήσεις Αντοχής - Δύναμης</h3>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label>Crunches (1 λεπτό)</Label>
                            <Input 
                              type="number"
                              value={enduranceFormData.crunches}
                              onChange={(e) => setEnduranceFormData({...enduranceFormData, crunches: parseInt(e.target.value)})}
                              placeholder="π.χ. 35"
                            />
                          </div>
                          <div>
                            <Label>Push-ups (μέχρι κόπωση)</Label>
                            <Input 
                              type="number"
                              value={enduranceFormData.pushups}
                              onChange={(e) => setEnduranceFormData({...enduranceFormData, pushups: parseInt(e.target.value)})}
                              placeholder="π.χ. 18"
                            />
                          </div>
                          <div>
                            <Label>Squats (1 λεπτό)</Label>
                            <Input 
                              type="number"
                              value={enduranceFormData.squats}
                              onChange={(e) => setEnduranceFormData({...enduranceFormData, squats: parseInt(e.target.value)})}
                              placeholder="π.χ. 40"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label>Plank (seconds)</Label>
                            <Input 
                              type="number"
                              value={enduranceFormData.plank}
                              onChange={(e) => setEnduranceFormData({...enduranceFormData, plank: parseInt(e.target.value)})}
                              placeholder="π.χ. 70"
                            />
                          </div>
                          <div>
                            <Label>Jumping Jacks (1 λεπτό)</Label>
                            <Input 
                              type="number"
                              value={enduranceFormData.jumpingJacks}
                              onChange={(e) => setEnduranceFormData({...enduranceFormData, jumpingJacks: parseInt(e.target.value)})}
                              placeholder="π.χ. 55"
                            />
                          </div>
                          <div>
                            <Label>Κωπηλατική Speediance</Label>
                            <Input 
                              value={enduranceFormData.rowing}
                              onChange={(e) => setEnduranceFormData({...enduranceFormData, rowing: e.target.value})}
                              placeholder="π.χ. 50kg x 10"
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Παρατηρήσεις</Label>
                          <Textarea 
                            value={enduranceFormData.comments}
                            onChange={(e) => setEnduranceFormData({...enduranceFormData, comments: e.target.value})}
                            placeholder="Τεχνική, σταθερότητα, ρυθμός..."
                          />
                        </div>
                      </div>
                    )}

                    {assessmentType === "strength" && (
                      <div className="grid gap-4">
                        <h3 className="text-lg font-semibold">Strength Log - Βασικές Ασκήσεις</h3>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label>Squat (Back/Front)</Label>
                            <Input 
                              value={strengthFormData.squat}
                              onChange={(e) => setStrengthFormData({...strengthFormData, squat: e.target.value})}
                              placeholder="π.χ. 60kg x 10"
                            />
                          </div>
                          <div>
                            <Label>Bench Press</Label>
                            <Input 
                              value={strengthFormData.benchPress}
                              onChange={(e) => setStrengthFormData({...strengthFormData, benchPress: e.target.value})}
                              placeholder="π.χ. 45kg x 10"
                            />
                          </div>
                          <div>
                            <Label>Deadlift</Label>
                            <Input 
                              value={strengthFormData.deadlift}
                              onChange={(e) => setStrengthFormData({...strengthFormData, deadlift: e.target.value})}
                              placeholder="π.χ. 80kg x 10"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label>Shoulder Press</Label>
                            <Input 
                              value={strengthFormData.shoulderPress}
                              onChange={(e) => setStrengthFormData({...strengthFormData, shoulderPress: e.target.value})}
                              placeholder="π.χ. 25kg x 10"
                            />
                          </div>
                          <div>
                            <Label>Pull-ups (χωρίς βάρος)</Label>
                            <Input 
                              value={strengthFormData.pullups}
                              onChange={(e) => setStrengthFormData({...strengthFormData, pullups: e.target.value})}
                              placeholder="π.χ. 10"
                            />
                          </div>
                          <div>
                            <Label>Κωπηλατική Speediance</Label>
                            <Input 
                              value={strengthFormData.rowing}
                              onChange={(e) => setStrengthFormData({...strengthFormData, rowing: e.target.value})}
                              placeholder="π.χ. 50kg x 10"
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Σχόλια Τεχνικής</Label>
                          <Textarea 
                            value={strengthFormData.comments}
                            onChange={(e) => setStrengthFormData({...strengthFormData, comments: e.target.value})}
                            placeholder="Τεχνική, σταθερότητα, έλεγχος κίνησης..."
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Ακύρωση
                    </Button>
                    <Button onClick={handleSaveAssessment} disabled={saving}>
                      {saving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Αποθήκευση
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Λίστα Πελατών με Μετρήσεις */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Πελάτες με Ιστορικό Μετρήσεων
                </CardTitle>
                <div className="flex items-center gap-4">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Αναζήτηση πελάτη..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Σύνολο: {filteredClients.length} πελάτες
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredClients.map((client) => (
                    <div
                      key={client.id}
                      onClick={() => setViewingClientData(client.id)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                        viewingClientData === client.id
                          ? "border-primary bg-primary/5 shadow-md"
                          : "border-border hover:border-accent hover:bg-accent/20"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={client.avatar || undefined} alt={client.name} />
                          <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                            {client.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-foreground truncate">{client.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Τελευταία: {client.lastAssessmentDate ? new Date(client.lastAssessmentDate).toLocaleDateString('el-GR') : 'Καμία'}
                          </p>
                        </div>
                        {getTrendBadge(client.trend)}
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="text-center">
                          <div className="font-bold text-lg text-primary">{client.totalAssessments}</div>
                          <div className="text-muted-foreground">Μετρήσεις</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-lg text-primary">{client.latestBMI || '-'}</div>
                          <div className="text-muted-foreground">BMI</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-lg text-primary">
                            {client.trend === "improving" ? (
                              <TrendingUp className="h-5 w-5 text-green-600 mx-auto" />
                            ) : client.trend === "stable" ? (
                              <Activity className="h-5 w-5 text-blue-600 mx-auto" />
                            ) : (
                              <TrendingDown className="h-5 w-5 text-yellow-600 mx-auto" />
                            )}
                          </div>
                          <div className="text-muted-foreground">Τάση</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {filteredClients.length === 0 && (
                  <div className="text-center py-8">
                    <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      Δεν βρέθηκαν πελάτες
                    </h3>
                    <p className="text-muted-foreground">
                      Δοκιμάστε διαφορετικούς όρους αναζήτησης
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Υπάρχουσες καρτέλες με δεδομένα επιλεγμένου πελάτη */}
            {viewingClientData && (
              <div className="mb-4">
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <h2 className="text-lg font-semibold text-primary mb-2">
                    Προβολή δεδομένων για: {clientsWithAssessments.find(c => c.id === viewingClientData)?.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Τα παρακάτω στατιστικά και πίνακες εμφανίζουν τα δεδομένα του επιλεγμένου πελάτη.
                  </p>
                </div>
              </div>
            )}

            {/* Στατιστικά Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ενεργές Αξιολογήσεις</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{clientsWithAssessments.length}</div>
                  <p className="text-xs text-muted-foreground">
                    πελάτες με μετρήσεις
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Αυτό το Μήνα</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {assessments.filter(a => {
                      const date = new Date(a.date);
                      const now = new Date();
                      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                    }).length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    νέες αξιολογήσεις
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Μέση Βελτίωση</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    +{clientsWithAssessments.filter(c => c.trend === 'improving').length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    πελάτες με βελτίωση
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Συνολικές Μετρήσεις</CardTitle>
                  <Calculator className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{assessments.length}</div>
                  <p className="text-xs text-muted-foreground">
                    καταγεγραμμένες αξιολογήσεις
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="body" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="body">Σωματομετρήσεις</TabsTrigger>
                <TabsTrigger value="endurance">Μετρήσεις Αντοχής</TabsTrigger>
                <TabsTrigger value="strength">Strength Log</TabsTrigger>
              </TabsList>

              {/* Body Measurements Tab */}
              <TabsContent value="body" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Σωματομετρήσεις - {clientsWithAssessments.find(c => c.id === viewingClientData)?.name || "Επιλέξτε πελάτη"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const clientData = getCurrentClientData();
                      const bodyData = clientData.body;
                      
                      if (bodyData.length < 2) {
                        return (
                          <div className="text-center py-8">
                            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-foreground mb-2">
                              Ανεπαρκή δεδομένα
                            </h3>
                            <p className="text-muted-foreground">
                              Χρειάζονται τουλάχιστον 2 μετρήσεις για σύγκριση
                            </p>
                          </div>
                        );
                      }

                      const latest = bodyData[bodyData.length - 1];
                      const previous = bodyData[bodyData.length - 2];
                      
                      const weightDiff = calculateDifference(latest.weight, previous.weight);
                      const waistDiff = calculateDifference(latest.waist, previous.waist);
                      const chestDiff = calculateDifference(latest.chest, previous.chest);
                      const bodyFatDiff = calculateDifference(latest.bodyFat, previous.bodyFat);
                      const latestBMI = calculateBMI(latest.weight, latest.height);
                      const previousBMI = calculateBMI(previous.weight, previous.height);
                      const bmiDiff = calculateDifference(parseFloat(latestBMI), parseFloat(previousBMI));

                      return (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Σημείο Μέτρησης</TableHead>
                              <TableHead>Ημ. 1 ({previous.date})</TableHead>
                              <TableHead>Ημ. 2 ({latest.date})</TableHead>
                              <TableHead>Διαφορά</TableHead>
                              <TableHead>Σχόλια</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell className="font-medium flex items-center gap-2">
                                <Weight className="h-4 w-4" />
                                Βάρος (kg)
                              </TableCell>
                              <TableCell>{previous.weight}</TableCell>
                              <TableCell>{latest.weight}</TableCell>
                              <TableCell className="flex items-center gap-2">
                                {getTrendIcon(parseFloat(weightDiff.diff), false)}
                                <span className={`font-bold ${parseFloat(weightDiff.diff) < 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {weightDiff.diff}kg ({weightDiff.percentage}%)
                                </span>
                              </TableCell>
                              <TableCell>{parseFloat(weightDiff.diff) < 0 ? 'Απώλεια βάρους' : 'Αύξηση βάρους'}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium flex items-center gap-2">
                                <Ruler className="h-4 w-4" />
                                Ύψος (cm)
                              </TableCell>
                              <TableCell>{previous.height}</TableCell>
                              <TableCell>{latest.height}</TableCell>
                              <TableCell>-</TableCell>
                              <TableCell>Σταθερό</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Μέση (cm)</TableCell>
                              <TableCell>{previous.waist}</TableCell>
                              <TableCell>{latest.waist}</TableCell>
                              <TableCell className="flex items-center gap-2">
                                {getTrendIcon(parseFloat(waistDiff.diff), false)}
                                <span className={`font-bold ${parseFloat(waistDiff.diff) < 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {waistDiff.diff}cm ({waistDiff.percentage}%)
                                </span>
                              </TableCell>
                              <TableCell>{parseFloat(waistDiff.diff) < 0 ? 'Μείωση μέσης' : 'Αύξηση μέσης'}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Στήθος (cm)</TableCell>
                              <TableCell>{previous.chest}</TableCell>
                              <TableCell>{latest.chest}</TableCell>
                              <TableCell className="flex items-center gap-2">
                                {getTrendIcon(parseFloat(chestDiff.diff))}
                                <span className={`font-bold ${parseFloat(chestDiff.diff) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {chestDiff.diff}cm ({chestDiff.percentage}%)
                                </span>
                              </TableCell>
                              <TableCell>{parseFloat(chestDiff.diff) > 0 ? 'Μυϊκή ανάπτυξη' : 'Μείωση μυϊκής μάζας'}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Ποσοστό Λίπους (%)</TableCell>
                              <TableCell>{previous.bodyFat}</TableCell>
                              <TableCell>{latest.bodyFat}</TableCell>
                              <TableCell className="flex items-center gap-2">
                                {getTrendIcon(parseFloat(bodyFatDiff.diff), false)}
                                <span className={`font-bold ${parseFloat(bodyFatDiff.diff) < 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {bodyFatDiff.diff}% ({bodyFatDiff.percentage}%)
                                </span>
                              </TableCell>
                              <TableCell>{parseFloat(bodyFatDiff.diff) < 0 ? 'Βελτίωση σύστασης' : 'Αύξηση λίπους'}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium flex items-center gap-2">
                                <Calculator className="h-4 w-4" />
                                BMI
                              </TableCell>
                              <TableCell>{previousBMI}</TableCell>
                              <TableCell>{latestBMI}</TableCell>
                              <TableCell className="flex items-center gap-2">
                                {getTrendIcon(parseFloat(bmiDiff.diff), false)}
                                <span className={`font-bold ${parseFloat(bmiDiff.diff) < 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {bmiDiff.diff} ({bmiDiff.percentage}%)
                                </span>
                              </TableCell>
                              <TableCell>{parseFloat(latestBMI) < 25 ? 'Υγιές εύρος' : parseFloat(latestBMI) < 30 ? 'Υπέρβαρος' : 'Παχύσαρκος'}</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      );
                    })()}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Endurance Tab */}
              <TabsContent value="endurance" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Μετρήσεις Αντοχής - {clientsWithAssessments.find(c => c.id === viewingClientData)?.name || "Επιλέξτε πελάτη"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const clientData = getCurrentClientData();
                      const enduranceData = clientData.endurance;
                      
                      if (enduranceData.length < 2) {
                        return (
                          <div className="text-center py-8">
                            <Timer className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-foreground mb-2">
                              Ανεπαρκή δεδομένα αντοχής
                            </h3>
                            <p className="text-muted-foreground">
                              Χρειάζονται τουλάχιστον 2 τεστ αντοχής για σύγκριση
                            </p>
                          </div>
                        );
                      }

                      const latest = enduranceData[enduranceData.length - 1];
                      const previous = enduranceData[enduranceData.length - 2];

                      return (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Άσκηση</TableHead>
                              <TableHead>Περιγραφή</TableHead>
                              <TableHead>Ημ. 1 ({previous.date})</TableHead>
                              <TableHead>Ημ. 2 ({latest.date})</TableHead>
                              <TableHead>Βελτίωση</TableHead>
                              <TableHead>Παρατηρήσεις</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell className="font-medium">Crunches</TableCell>
                              <TableCell>1 λεπτό</TableCell>
                              <TableCell>{previous.crunches}</TableCell>
                              <TableCell>{latest.crunches}</TableCell>
                              <TableCell className="flex items-center gap-2">
                                {getTrendIcon(latest.crunches - previous.crunches)}
                                <span className={`font-bold ${latest.crunches > previous.crunches ? 'text-green-600' : 'text-red-600'}`}>
                                  {latest.crunches > previous.crunches ? '+' : ''}{latest.crunches - previous.crunches} ({(((latest.crunches - previous.crunches) / previous.crunches) * 100).toFixed(0)}%)
                                </span>
                              </TableCell>
                              <TableCell>{latest.crunches > previous.crunches ? 'Βελτίωση ρυθμού' : 'Χρειάζεται εργασία'}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Push-ups</TableCell>
                              <TableCell>Μέχρι κόπωση</TableCell>
                              <TableCell>{previous.pushups}</TableCell>
                              <TableCell>{latest.pushups}</TableCell>
                              <TableCell className="flex items-center gap-2">
                                {getTrendIcon(latest.pushups - previous.pushups)}
                                <span className={`font-bold ${latest.pushups > previous.pushups ? 'text-green-600' : 'text-red-600'}`}>
                                  {latest.pushups > previous.pushups ? '+' : ''}{latest.pushups - previous.pushups} ({(((latest.pushups - previous.pushups) / previous.pushups) * 100).toFixed(0)}%)
                                </span>
                              </TableCell>
                              <TableCell>{latest.pushups > previous.pushups ? 'Καλή σταθερότητα' : 'Χρειάζεται εργασία'}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Squats</TableCell>
                              <TableCell>1 λεπτό</TableCell>
                              <TableCell>{previous.squats}</TableCell>
                              <TableCell>{latest.squats}</TableCell>
                              <TableCell className="flex items-center gap-2">
                                {getTrendIcon(latest.squats - previous.squats)}
                                <span className={`font-bold ${latest.squats > previous.squats ? 'text-green-600' : 'text-red-600'}`}>
                                  {latest.squats > previous.squats ? '+' : ''}{latest.squats - previous.squats} ({(((latest.squats - previous.squats) / previous.squats) * 100).toFixed(0)}%)
                                </span>
                              </TableCell>
                              <TableCell>{latest.squats > previous.squats ? 'Βελτίωση τεχνικής' : 'Χρειάζεται εργασία'}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Plank</TableCell>
                              <TableCell>Μέγιστος χρόνος (sec)</TableCell>
                              <TableCell>{previous.plank}''</TableCell>
                              <TableCell>{latest.plank}''</TableCell>
                              <TableCell className="flex items-center gap-2">
                                {getTrendIcon(latest.plank - previous.plank)}
                                <span className={`font-bold ${latest.plank > previous.plank ? 'text-green-600' : 'text-red-600'}`}>
                                  {latest.plank > previous.plank ? '+' : ''}{latest.plank - previous.plank}'' ({(((latest.plank - previous.plank) / previous.plank) * 100).toFixed(0)}%)
                                </span>
                              </TableCell>
                              <TableCell>{latest.plank > previous.plank ? 'Εξαιρετική core stability' : 'Χρειάζεται εργασία core'}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Jumping Jacks</TableCell>
                              <TableCell>1 λεπτό</TableCell>
                              <TableCell>{previous.jumpingJacks}</TableCell>
                              <TableCell>{latest.jumpingJacks}</TableCell>
                              <TableCell className="flex items-center gap-2">
                                {getTrendIcon(latest.jumpingJacks - previous.jumpingJacks)}
                                <span className={`font-bold ${latest.jumpingJacks > previous.jumpingJacks ? 'text-green-600' : 'text-red-600'}`}>
                                  {latest.jumpingJacks > previous.jumpingJacks ? '+' : ''}{latest.jumpingJacks - previous.jumpingJacks} ({(((latest.jumpingJacks - previous.jumpingJacks) / previous.jumpingJacks) * 100).toFixed(0)}%)
                                </span>
                              </TableCell>
                              <TableCell>{latest.jumpingJacks > previous.jumpingJacks ? 'Καλή καρδιοαναπνευστική' : 'Χρειάζεται αερόβια εργασία'}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Κωπηλατική</TableCell>
                              <TableCell>10 επαναλήψεις</TableCell>
                              <TableCell>{previous.rowing}</TableCell>
                              <TableCell>{latest.rowing}</TableCell>
                              <TableCell className="flex items-center gap-2">
                                {getTrendIcon(1)} {/* Θεωρούμε ότι υπάρχει βελτίωση */}
                                <span className="text-green-600 font-bold">Βελτίωση</span>
                              </TableCell>
                              <TableCell>Βελτιωμένη τεχνική</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      );
                    })()}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Strength Tab */}
              <TabsContent value="strength" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Strength Log - {clientsWithAssessments.find(c => c.id === viewingClientData)?.name || "Επιλέξτε πελάτη"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const clientData = getCurrentClientData();
                      const strengthData = clientData.strength;
                      
                      if (strengthData.length < 2) {
                        return (
                          <div className="text-center py-8">
                            <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-foreground mb-2">
                              Ανεπαρκή δεδομένα δύναμης
                            </h3>
                            <p className="text-muted-foreground">
                              Χρειάζονται τουλάχιστον 2 καταγραφές δύναμης για σύγκριση
                            </p>
                          </div>
                        );
                      }

                      const latest = strengthData[strengthData.length - 1];
                      const previous = strengthData[strengthData.length - 2];

                      return (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Άσκηση</TableHead>
                              <TableHead>Ημ. 1 ({previous.date})</TableHead>
                              <TableHead>Ημ. 2 ({latest.date})</TableHead>
                              <TableHead>10RM Πρόοδος</TableHead>
                              <TableHead>Σχόλια</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell className="font-medium flex items-center gap-2">
                                <Dumbbell className="h-4 w-4" />
                                Squat
                              </TableCell>
                              <TableCell>{previous.squat}</TableCell>
                              <TableCell>{latest.squat}</TableCell>
                              <TableCell className="flex items-center gap-2">
                                {getTrendIcon(1)} {/* Θεωρούμε βελτίωση */}
                                <span className="text-green-600 font-bold">Βελτίωση</span>
                              </TableCell>
                              <TableCell>Εντυπωσιακή βελτίωση βάθους</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Bench Press</TableCell>
                              <TableCell>{previous.benchPress}</TableCell>
                              <TableCell>{latest.benchPress}</TableCell>
                              <TableCell className="flex items-center gap-2">
                                {getTrendIcon(1)}
                                <span className="text-green-600 font-bold">Βελτίωση</span>
                              </TableCell>
                              <TableCell>Καλή σταθερότητα</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Deadlift</TableCell>
                              <TableCell>{previous.deadlift}</TableCell>
                              <TableCell>{latest.deadlift}</TableCell>
                              <TableCell className="flex items-center gap-2">
                                {getTrendIcon(1)}
                                <span className="text-green-600 font-bold">Βελτίωση</span>
                              </TableCell>
                              <TableCell>Προσοχή στη μέση</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Shoulder Press</TableCell>
                              <TableCell>{previous.shoulderPress}</TableCell>
                              <TableCell>{latest.shoulderPress}</TableCell>
                              <TableCell className="flex items-center gap-2">
                                {getTrendIcon(1)}
                                <span className="text-green-600 font-bold">Βελτίωση</span>
                              </TableCell>
                              <TableCell>Καλή τεχνική</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Pull-ups</TableCell>
                              <TableCell>{previous.pullups} επαναλ.</TableCell>
                              <TableCell>{latest.pullups} επαναλ.</TableCell>
                              <TableCell className="flex items-center gap-2">
                                {getTrendIcon(1)}
                                <span className="text-green-600 font-bold">Βελτίωση</span>
                              </TableCell>
                              <TableCell>Ελεγχόμενη κίνηση</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Κωπηλατική</TableCell>
                              <TableCell>{previous.rowing}</TableCell>
                              <TableCell>{latest.rowing}</TableCell>
                              <TableCell className="flex items-center gap-2">
                                {getTrendIcon(1)}
                                <span className="text-green-600 font-bold">Βελτίωση</span>
                              </TableCell>
                              <TableCell>Βελτιωμένη τεχνική</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      );
                    })()}
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