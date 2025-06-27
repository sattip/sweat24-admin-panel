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
import { useToast } from "@/components/ui/use-toast";
import { TimeTrackingModal } from "@/components/TimeTrackingModal";
import { PayrollAgreementsModal } from "@/components/PayrollAgreementsModal";
import { TrainerReportModal } from "@/components/TrainerReportModal";
import {
  User,
  UserPlus,
  Search,
  Calendar,
  Clock,
  Award,
  Dumbbell,
  Users,
  TrendingUp,
  Edit,
  Trash2,
  Eye,
  Plus,
  Star,
  DollarSign,
  Target,
  Euro,
  Loader2,
} from "lucide-react";
import { instructorsApi } from "@/services/apiService";
import type { Instructor } from "@/data/mockData";


const specialtyOptions = [
  "HIIT", "Strength Training", "Yoga", "Pilates", "Cardio", "CrossFit",
  "Olympic Lifting", "Powerlifting", "Bodybuilding", "Personal Training",
  "Group Fitness", "Dance", "EMS", "Functional Training", "Nutrition"
];


export function TrainersPage() {
  const { toast } = useToast();
  const [trainers, setTrainers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    specialties: [],
    certifications: "",
    experience: "",
    bio: "",
  });

  // Fetch trainers from API
  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        setIsLoading(true);
        const response = await instructorsApi.getAll();
        setTrainers(response.data || response);
      } catch (error) {
        console.error('Error fetching trainers:', error);
        toast({
          title: "Σφάλμα",
          description: "Αποτυχία φόρτωσης προπονητών. Παρακαλώ δοκιμάστε ξανά.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrainers();
  }, [toast]);

  const filteredTrainers = trainers.filter((trainer) => {
    let specialties = trainer.specialties || [];
    if (typeof specialties === 'string') {
      try {
        specialties = JSON.parse(specialties);
      } catch {
        specialties = [];
      }
    }
    
    const matchesSearch = 
      trainer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || trainer.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleCreateTrainer = async () => {
    if (!formData.name || !formData.email) {
      toast({
        title: "Σφάλμα",
        description: "Το Ονοματεπώνυμο και το Email είναι υποχρεωτικά.",
        variant: "destructive",
      });
      return;
    }

    try {
      const newTrainerData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        specialties: formData.specialties,
        certifications: formData.certifications.split(",").map(c => c.trim()),
        experience: formData.experience,
        bio: formData.bio,
      };

      const response = await instructorsApi.create(newTrainerData);
      const newTrainer = response.data || response;
      
      setTrainers([...trainers, newTrainer]);
      setIsDialogOpen(false);

      toast({
        title: "Επιτυχία!",
        description: `Ο προπονητής ${formData.name} προστέθηκε με επιτυχία.`,
      });

      resetForm();
    } catch (error) {
      console.error('Error creating trainer:', error);
      toast({
        title: "Σφάλμα",
        description: "Αποτυχία δημιουργίας προπονητή. Παρακαλώ δοκιμάστε ξανά.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      specialties: [],
      certifications: "",
      experience: "",
      bio: "",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default" className="bg-green-100 text-green-800">Ενεργός</Badge>;
      case "inactive":
        return <Badge variant="secondary">Ανενεργός</Badge>;
      case "vacation":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Άδεια</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleSpecialtyToggle = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
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
                <h1 className="text-3xl font-bold text-foreground">Διαχείριση Προπονητών</h1>
                <p className="text-muted-foreground">
                  Διαχείριση προπονητών, στατιστικά και αντιστοίχιση με πελάτες
                </p>
              </div>
              <div className="flex gap-2">
                <TrainerReportModal />
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-primary/90 text-white">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Νέος Προπονητής
                    </Button>
                  </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Προσθήκη Νέου Προπονητή</DialogTitle>
                    <DialogDescription>
                      Εισάγετε τα στοιχεία του νέου προπονητή
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
                          placeholder="email@sweat24.com"
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
                        <Label htmlFor="experience">Εμπειρία</Label>
                        <Input
                          id="experience"
                          value={formData.experience}
                          onChange={(e) => setFormData({...formData, experience: e.target.value})}
                          placeholder="π.χ. 5 χρόνια"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Ειδικότητες</Label>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {specialtyOptions.map((specialty) => (
                          <Button
                            key={specialty}
                            variant={formData.specialties.includes(specialty) ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleSpecialtyToggle(specialty)}
                            className="justify-start"
                          >
                            {specialty}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="certifications">Πιστοποιήσεις</Label>
                      <Input
                        id="certifications"
                        value={formData.certifications}
                        onChange={(e) => setFormData({...formData, certifications: e.target.value})}
                        placeholder="π.χ. NASM-CPT, CSCS, TRX (χωρισμένα με κόμμα)"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio">Βιογραφικό</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                        placeholder="Σύντομη περιγραφή εμπειρίας και ειδικότητας..."
                        rows={3}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Ακύρωση
                    </Button>
                    <Button onClick={handleCreateTrainer}>
                      Προσθήκη Προπονητή
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Συνολικοί Προπονητές</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Φόρτωση...</span>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{trainers.length}</div>
                      <p className="text-xs text-muted-foreground">
                        {trainers.filter(t => t.status === 'active').length} ενεργοί
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Εβδομαδιαίες Ώρες</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Φόρτωση...</span>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">
                        {trainers.reduce((sum, t) => sum + (t.weekly_hours || t.work_hours || 0), 0)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        συνολικές ώρες αυτή την εβδομάδα
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Μηνιαία Μαθήματα</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Φόρτωση...</span>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">
                        {trainers.reduce((sum, t) => sum + (t.monthly_classes || t.classes_count || 0), 0)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        συνολικά μαθήματα αυτό το μήνα
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Μέση Αξιολόγηση</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Φόρτωση...</span>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">
                        {trainers.length > 0 ? 
                          (trainers.reduce((sum, t) => sum + (t.rating || 0), 0) / trainers.length).toFixed(1) : 
                          '0.0'
                        }
                      </div>
                      <p className="text-xs text-muted-foreground">
                        από 5.0 στάρια
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Φίλτρα Αναζήτησης</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Αναζήτηση προπονητή ή ειδικότητας..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Κατάσταση" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Όλοι</SelectItem>
                      <SelectItem value="active">Ενεργοί</SelectItem>
                      <SelectItem value="inactive">Ανενεργοί</SelectItem>
                      <SelectItem value="vacation">Σε άδεια</SelectItem>
                    </SelectContent>
                  </Select>
                  <TrainerReportModal />
                </div>
              </CardContent>
            </Card>

            {/* Main Content Tabs */}
            <Tabs defaultValue="trainers" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="trainers">Προπονητές</TabsTrigger>
                <TabsTrigger value="stats">Στατιστικά</TabsTrigger>
                <TabsTrigger value="payroll">Μισθοδοσία</TabsTrigger>
              </TabsList>

              {/* Trainers Tab */}
              <TabsContent value="trainers" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Λίστα Προπονητών</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Προπονητής</TableHead>
                          <TableHead>Ειδικότητες</TableHead>
                          <TableHead>Εμπειρία</TableHead>
                          <TableHead>Εβδομαδιαίες Ώρες</TableHead>
                          <TableHead>Αξιολόγηση</TableHead>
                          <TableHead>Κατάσταση</TableHead>
                          <TableHead>Ενέργειες</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTrainers.map((trainer) => (
                          <TableRow key={trainer.id} className="hover:bg-muted/50">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={trainer.avatar || undefined} />
                                  <AvatarFallback>{trainer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{trainer.name}</div>
                                  <div className="text-muted-foreground text-sm">{trainer.email}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {(() => {
                                  let specialties = trainer.specialties || [];
                                  if (typeof specialties === 'string') {
                                    try {
                                      specialties = JSON.parse(specialties);
                                    } catch {
                                      specialties = [];
                                    }
                                  }
                                  return specialties.slice(0, 3).map(spec => (
                                    <Badge key={spec} variant="secondary">{spec}</Badge>
                                  ));
                                })()}
                              </div>
                            </TableCell>
                            <TableCell>{trainer.experience}</TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div className="font-medium">{trainer.weekly_hours || trainer.work_hours || 0}h</div>
                                <div className="text-muted-foreground">
                                  {trainer.monthly_classes || trainer.classes_count || 0} μαθήματα/μήνα
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center gap-1">
                                <Star className="h-4 w-4 text-yellow-400" />
                                <span>{trainer.rating}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(trainer.status)}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1 justify-end">
                                <Button variant="ghost" size="icon" title="Προβολή Προφίλ">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" title="Επεξεργασία">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <TimeTrackingModal instructorId={trainer.id} />
                                <PayrollAgreementsModal instructorId={trainer.id} />
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" title="Διαγραφή">
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

              {/* Stats Tab */}
              <TabsContent value="stats" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Στατιστικά Προπονητών</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Προπονητής</TableHead>
                          <TableHead>Συνεδρίες Εβδομάδας</TableHead>
                          <TableHead>Συνεδρίες Μήνα</TableHead>
                          <TableHead>Συνολικές Ώρες</TableHead>
                          <TableHead>Αξιολόγηση</TableHead>
                          <TableHead>Δημοφιλείς Ώρες</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoading ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8">
                              <div className="flex items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                                <span className="text-muted-foreground">Φόρτωση στατιστικών...</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : filteredTrainers.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                              Δεν υπάρχουν διαθέσιμα στατιστικά
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredTrainers.map((trainer) => (
                            <TableRow key={trainer.id} className="hover:bg-muted/50">
                              <TableCell className="font-medium">{trainer.name}</TableCell>
                              <TableCell>{trainer.this_week_sessions || trainer.weekly_sessions || 0}</TableCell>
                              <TableCell>{trainer.this_month_sessions || trainer.monthly_sessions || 0}</TableCell>
                              <TableCell>{trainer.weekly_hours || trainer.work_hours || 0}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 text-yellow-400" />
                                  <span>{trainer.rating || '0.0'}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  {(trainer.popular_times || []).map((time, index) => (
                                    <div key={index} className="text-muted-foreground">
                                      {time}
                                    </div>
                                  ))}
                                  {(!trainer.popular_times || trainer.popular_times.length === 0) && (
                                    <div className="text-muted-foreground">Δεν υπάρχουν δεδομένα</div>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Payroll Tab */}
              <TabsContent value="payroll" className="space-y-4">
                {/* Performance & Revenue Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Ανάλυση Απόδοσης & Τζίρου
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Προπονητής</TableHead>
                          <TableHead>Συνολικός Τζίρος</TableHead>
                          <TableHead>Ολοκληρωμένες Συνεδρίες</TableHead>
                          <TableHead>Μέσος Τζίρος/Συνεδρία</TableHead>
                          <TableHead>Αναλογία στον Τζίρο</TableHead>
                          <TableHead>Τύπος Σύμβασης</TableHead>
                          <TableHead>Ωριαία Αμοιβή</TableHead>
                          <TableHead>Προβλεπόμενος Μισθός</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTrainers.map((trainer) => {
                          const totalRevenue = filteredTrainers.reduce((sum, t) => sum + (t.total_revenue || 0), 0);
                          const revenuePercentage = totalRevenue > 0 ? (((trainer.total_revenue || 0) / totalRevenue) * 100).toFixed(1) : '0.0';
                          const avgRevenuePerSession = (trainer.completed_sessions || 0) > 0 ? ((trainer.total_revenue || 0) / (trainer.completed_sessions || 1)).toFixed(1) : '0.0';
                          
                          // Calculate expected monthly salary
                          let expectedSalary = 0;
                          if (trainer.contract_type === 'hourly') {
                            expectedSalary = (Number(trainer.weekly_hours) || 0) * 4 * (Number(trainer.hourly_rate) || 0) + (Number(trainer.monthly_bonus) || 0);
                          } else if (trainer.contract_type === 'commission') {
                            expectedSalary = (Number(trainer.total_revenue) || 0) * (Number(trainer.commission_rate) || 0);
                          } else if (trainer.contract_type === 'salary') {
                            expectedSalary = (Number(trainer.hourly_rate) || 0) * 160 + (Number(trainer.monthly_bonus) || 0); // 160h/month average
                          }
                          expectedSalary = Number(expectedSalary) || 0;

                          // For now, skip payroll agreements as they're not implemented yet
                          const agreementTotal = 0;

                          const getContractTypeBadge = (type: string) => {
                            switch (type) {
                              case 'hourly':
                                return <Badge variant="outline">Ωριαία</Badge>;
                              case 'commission':
                                return <Badge variant="default" className="bg-blue-100 text-blue-800">Προμήθεια</Badge>;
                              case 'salary':
                                return <Badge variant="secondary">Μισθός</Badge>;
                              default:
                                return <Badge variant="outline">{type || 'Δεν έχει οριστεί'}</Badge>;
                            }
                          };

                          return (
                            <TableRow key={trainer.id} className="hover:bg-muted/50">
                              <TableCell className="font-medium">{trainer.name}</TableCell>
                              <TableCell>
                                <div className="font-semibold text-green-600">€{trainer.total_revenue || 0}</div>
                              </TableCell>
                              <TableCell>{trainer.completed_sessions || 0}</TableCell>
                              <TableCell>€{avgRevenuePerSession}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="w-16 bg-muted rounded-full h-2">
                                    <div 
                                      className="bg-blue-500 h-2 rounded-full" 
                                      style={{ width: `${Math.min(parseFloat(revenuePercentage), 100)}%` }}
                                    />
                                  </div>
                                  <span className="text-sm font-medium">{revenuePercentage}%</span>
                                </div>
                              </TableCell>
                              <TableCell>{getContractTypeBadge(trainer.contract_type)}</TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  <div>€{trainer.hourly_rate || 0}/ώρα</div>
                                  {trainer.commission_rate && (
                                    <div className="text-muted-foreground">
                                      {((Number(trainer.commission_rate) || 0) * 100).toFixed(0)}% προμήθεια
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="font-semibold text-green-600">
                                  €{expectedSalary.toFixed(0)}/μήνα
                                </div>
                                {trainer.monthly_bonus && (
                                  <div className="text-xs text-muted-foreground">
                                    +€{trainer.monthly_bonus} bonus
                                  </div>
                                )}
                                {agreementTotal !== 0 && (
                                  <div className="text-xs text-blue-600">
                                    {agreementTotal > 0 ? '+' : ''}€{agreementTotal} ειδικές συμφωνίες
                                  </div>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Time Tracking & Payroll Management */}
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Διαχείριση Ωρομέτρησης
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground">
                        Καταχώρηση και έγκριση ωρών εργασίας προπονητών
                      </p>
                      <TimeTrackingModal />
                      
                      {/* Quick stats */}
                      <div className="grid gap-2 pt-4 border-t">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Εκκρεμείς εγκρίσεις:</span>
                          <span className="font-medium">
                            0
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Συνολικές ώρες εβδομάδας:</span>
                          <span className="font-medium">
                            {trainers.reduce((sum, trainer) => sum + (trainer.weekly_hours || 0), 0)}h
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Ειδικές Συμφωνίες Μισθοδοσίας
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground">
                        Διαχείριση bonus, αφαιρέσεων και ειδικών τιμών
                      </p>
                      <PayrollAgreementsModal />
                      
                      {/* Quick stats */}
                      <div className="grid gap-2 pt-4 border-t">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Ενεργές συμφωνίες:</span>
                          <span className="font-medium">
                            0
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Συνολικά μηνιαία bonus:</span>
                          <span className="font-medium text-green-600">
                            +€0
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
} 