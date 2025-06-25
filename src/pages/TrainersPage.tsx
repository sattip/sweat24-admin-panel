import { useState } from "react";
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
} from "lucide-react";
import { mockInstructorsData, mockWorkTimeEntries, mockPayrollAgreements } from "@/data/mockData";
import type { Instructor } from "@/data/mockData";

// Εκτεταμένα mock data για προπονητές
const mockTrainers: any[] = [
  {
    id: "1",
    name: "Άλεξ Ροδρίγκεζ",
    email: "alex@sweat24.com",
    phone: "6944111222",
    specialties: ["HIIT", "Strength Training", "Weight Loss"],
    certifications: ["NASM-CPT", "CSCS", "TRX Certified"],
    experience: "8 χρόνια",
    joinDate: "2020-03-15",
    status: "active",
    weeklyHours: 35,
    monthlyClasses: 48,
    rating: 4.9,
    bio: "Εξειδικεύεται σε προπονήσεις υψηλής έντασης και αύξηση μυϊκής μάζας",
    avatar: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952",
    hourlyRate: 25,
    monthlyBonus: 100,
    commissionRate: 0.10,
    contractType: 'hourly' as const,
    totalRevenue: 4500,
    completedSessions: 180
  },
  {
    id: "2",
    name: "Εμιλι Τσεν",
    email: "emily@sweat24.com",
    phone: "6955222333",
    specialties: ["Yoga", "Pilates", "Mindfulness"],
    certifications: ["RYT-500", "Functional Movement", "Thai Massage"],
    experience: "6 χρόνια",
    joinDate: "2021-01-20",
    status: "active",
    weeklyHours: 28,
    monthlyClasses: 32,
    rating: 4.8,
    bio: "Εστιάζει στην ολιστική προσέγγιση φυσικής και πνευματικής υγείας",
    avatar: "https://images.unsplash.com/photo-1518495973542-4542c06a5843",
    hourlyRate: 30,
    commissionRate: 0.15,
    contractType: 'commission' as const,
    totalRevenue: 3800,
    completedSessions: 145
  },
  {
    id: "3",
    name: "Τζέιμς Τέιλορ",
    email: "james@sweat24.com",
    phone: "6966333444",
    specialties: ["Powerlifting", "Bodybuilding", "Strength"],
    certifications: ["NSCA-CSCS", "Westside Certified", "Sports Nutrition"],
    experience: "12 χρόνια",
    joinDate: "2019-08-10",
    status: "active",
    weeklyHours: 40,
    monthlyClasses: 56,
    rating: 4.9,
    bio: "Ειδικός σε προγράμματα δύναμης και αισθητικής ανάπτυξης",
    avatar: "https://images.unsplash.com/photo-1469474968028-56623f02e42e",
    hourlyRate: 35,
    monthlyBonus: 150,
    contractType: 'salary' as const,
    totalRevenue: 6200,
    completedSessions: 220
  },
  {
    id: "4",
    name: "Σάρα Τζόνσον",
    email: "sarah@sweat24.com",
    phone: "6977444555",
    specialties: ["Group Fitness", "Cardio", "Dance"],
    certifications: ["ACE-GFI", "Les Mills", "Zumba Instructor"],
    experience: "5 χρόνια",
    joinDate: "2022-02-14",
    status: "active",
    weeklyHours: 25,
    monthlyClasses: 36,
    rating: 4.7,
    bio: "Ενεργητική προπονήτρια ομαδικών προγραμμάτων με έμφαση στη διασκέδαση",
    avatar: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
    hourlyRate: 22,
    monthlyBonus: 50,
    contractType: 'hourly' as const,
    totalRevenue: 2100,
    completedSessions: 95
  },
  {
    id: "5",
    name: "Μάρκους Ουίλιαμς",
    email: "marcus@sweat24.com",
    phone: "6988555666",
    specialties: ["CrossFit", "Olympic Lifting"],
    certifications: ["CrossFit L2", "USAW Sport Performance"],
    experience: "7 χρόνια",
    joinDate: "2021-09-05",
    status: "active",
    weeklyHours: 32,
    monthlyClasses: 42,
    rating: 4.8,
    bio: "Ειδικός σε functional fitness και olympic lifting",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
    hourlyRate: 28,
    commissionRate: 0.12,
    contractType: 'commission' as const,
    totalRevenue: 3200,
    completedSessions: 128
  },
];

const specialtyOptions = [
  "HIIT", "Strength Training", "Yoga", "Pilates", "Cardio", "CrossFit",
  "Olympic Lifting", "Powerlifting", "Bodybuilding", "Personal Training",
  "Group Fitness", "Dance", "EMS", "Functional Training", "Nutrition"
];

const trainerStats = [
  {
    trainerId: "1",
    trainerName: "Άλεξ Ροδρίγκεζ",
    thisWeekSessions: 18,
    thisMonthSessions: 48,
    totalHours: 35,
    averageRating: 4.9,
    popularTimes: ["09:00-11:00", "17:00-19:00"],
  },
  {
    trainerId: "2", 
    trainerName: "Εμιλι Τσεν",
    thisWeekSessions: 14,
    thisMonthSessions: 32,
    totalHours: 28,
    averageRating: 4.8,
    popularTimes: ["18:00-20:00", "10:00-12:00"],
  },
  {
    trainerId: "3",
    trainerName: "Τζέιμς Τέιλορ", 
    thisWeekSessions: 22,
    thisMonthSessions: 56,
    totalHours: 40,
    averageRating: 4.9,
    popularTimes: ["06:00-08:00", "16:00-18:00"],
  },
];

export function TrainersPage() {
  const { toast } = useToast();
  const [trainers, setTrainers] = useState(mockTrainers);
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

  const filteredTrainers = trainers.filter((trainer) => {
    const matchesSearch = 
      trainer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trainer.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || trainer.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleCreateTrainer = () => {
    if (!formData.name || !formData.email) {
      toast({
        title: "Σφάλμα",
        description: "Το Ονοματεπώνυμο και το Email είναι υποχρεωτικά.",
        variant: "destructive",
      });
      return;
    }

    const newTrainer = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      specialties: formData.specialties,
      certifications: formData.certifications.split(",").map(c => c.trim()),
      experience: formData.experience,
      joinDate: new Date().toISOString().split("T")[0],
      status: "active",
      weeklyHours: 0,
      monthlyClasses: 0,
      rating: 0,
      bio: formData.bio,
      avatar: null,
    };

    setTrainers([...trainers, newTrainer]);
    setIsDialogOpen(false);

    toast({
      title: "Επιτυχία!",
      description: `Ο προπονητής ${formData.name} προστέθηκε με επιτυχία.`,
    });

    resetForm();
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
                  <div className="text-2xl font-bold">{trainers.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {trainers.filter(t => t.status === 'active').length} ενεργοί
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Εβδομαδιαίες Ώρες</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {trainers.reduce((sum, t) => sum + t.weeklyHours, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    συνολικές ώρες αυτή την εβδομάδα
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Μηνιαία Μαθήματα</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {trainers.reduce((sum, t) => sum + t.monthlyClasses, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    συνολικά μαθήματα αυτό το μήνα
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Μέση Αξιολόγηση</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(trainers.reduce((sum, t) => sum + t.rating, 0) / trainers.length).toFixed(1)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    από 5.0 στάρια
                  </p>
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
                                {trainer.specialties.slice(0, 3).map(spec => (
                                  <Badge key={spec} variant="secondary">{spec}</Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>{trainer.experience}</TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div className="font-medium">{trainer.weeklyHours}h</div>
                                <div className="text-muted-foreground">
                                  {trainer.monthlyClasses} μαθήματα/μήνα
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
                        {trainerStats.map((stat) => (
                          <TableRow key={stat.trainerId} className="hover:bg-muted/50">
                            <TableCell className="font-medium">{stat.trainerName}</TableCell>
                            <TableCell>{stat.thisWeekSessions}</TableCell>
                            <TableCell>{stat.thisMonthSessions}</TableCell>
                            <TableCell>{stat.totalHours}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-400" />
                                <span>{stat.averageRating}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {stat.popularTimes.map((time, index) => (
                                  <div key={index} className="text-muted-foreground">
                                    {time}
                                  </div>
                                ))}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
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
                        {mockTrainers.map((trainer) => {
                          const totalRevenue = mockTrainers.reduce((sum, t) => sum + t.totalRevenue, 0);
                          const revenuePercentage = ((trainer.totalRevenue / totalRevenue) * 100).toFixed(1);
                          const avgRevenuePerSession = (trainer.totalRevenue / trainer.completedSessions).toFixed(1);
                          
                          // Calculate expected monthly salary
                          let expectedSalary = 0;
                          if (trainer.contractType === 'hourly') {
                            expectedSalary = trainer.weeklyHours * 4 * trainer.hourlyRate + (trainer.monthlyBonus || 0);
                          } else if (trainer.contractType === 'commission') {
                            expectedSalary = trainer.totalRevenue * (trainer.commissionRate || 0);
                          } else if (trainer.contractType === 'salary') {
                            expectedSalary = trainer.hourlyRate * 160 + (trainer.monthlyBonus || 0); // 160h/month average
                          }

                          // Add active agreements
                          const activeAgreements = mockPayrollAgreements.filter(
                            a => a.instructorId === trainer.id && a.isActive && a.isRecurring
                          );
                          const agreementTotal = activeAgreements.reduce((sum, a) => {
                            return a.type === 'deduction' ? sum - a.amount : sum + a.amount;
                          }, 0);
                          expectedSalary += agreementTotal;

                          const getContractTypeBadge = (type: string) => {
                            switch (type) {
                              case 'hourly':
                                return <Badge variant="outline">Ωριαία</Badge>;
                              case 'commission':
                                return <Badge variant="default" className="bg-blue-100 text-blue-800">Προμήθεια</Badge>;
                              case 'salary':
                                return <Badge variant="secondary">Μισθός</Badge>;
                              default:
                                return <Badge variant="outline">{type}</Badge>;
                            }
                          };

                          return (
                            <TableRow key={trainer.id} className="hover:bg-muted/50">
                              <TableCell className="font-medium">{trainer.name}</TableCell>
                              <TableCell>
                                <div className="font-semibold text-green-600">€{trainer.totalRevenue}</div>
                              </TableCell>
                              <TableCell>{trainer.completedSessions}</TableCell>
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
                              <TableCell>{getContractTypeBadge(trainer.contractType)}</TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  <div>€{trainer.hourlyRate}/ώρα</div>
                                  {trainer.commissionRate && (
                                    <div className="text-muted-foreground">
                                      {(trainer.commissionRate * 100).toFixed(0)}% προμήθεια
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="font-semibold text-green-600">
                                  €{expectedSalary.toFixed(0)}/μήνα
                                </div>
                                {trainer.monthlyBonus && (
                                  <div className="text-xs text-muted-foreground">
                                    +€{trainer.monthlyBonus} bonus
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
                            {mockWorkTimeEntries.filter(entry => !entry.approved).length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Συνολικές ώρες εβδομάδας:</span>
                          <span className="font-medium">
                            {mockWorkTimeEntries.reduce((sum, entry) => sum + entry.hoursWorked, 0)}h
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
                            {mockPayrollAgreements.filter(agreement => agreement.isActive).length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Συνολικά μηνιαία bonus:</span>
                          <span className="font-medium text-green-600">
                            +€{mockPayrollAgreements
                              .filter(a => a.isActive && a.type === 'bonus' && a.isRecurring)
                              .reduce((sum, a) => sum + a.amount, 0)}
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