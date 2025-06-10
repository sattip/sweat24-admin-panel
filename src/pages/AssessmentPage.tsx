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
} from "lucide-react";

// Mock data για σωματομετρήσεις
const bodyMeasurements = [
  {
    id: "1",
    clientName: "Γιάννης Παπαδόπουλος",
    measurements: [
      {
        date: "2024-01-15",
        weight: 85.5,
        height: 178,
        waist: 92,
        hips: 98,
        chest: 102,
        rightArm: 32,
        rightThigh: 58,
        bodyFat: 18.5,
        bmi: 27.0,
        comments: "Αρχική μέτρηση"
      },
      {
        date: "2024-05-24",
        weight: 78.2,
        height: 178,
        waist: 84,
        hips: 95,
        chest: 105,
        rightArm: 35,
        rightThigh: 55,
        bodyFat: 14.2,
        bmi: 24.7,
        comments: "Εξαιρετική πρόοδος!"
      }
    ]
  },
  {
    id: "2",
    clientName: "Μαρία Κωνσταντίνου",
    measurements: [
      {
        date: "2024-02-10",
        weight: 68.0,
        height: 165,
        waist: 75,
        hips: 95,
        chest: 88,
        rightArm: 26,
        rightThigh: 52,
        bodyFat: 22.8,
        bmi: 25.0,
        comments: "Αρχική αξιολόγηση"
      },
      {
        date: "2024-05-20",
        weight: 63.5,
        height: 165,
        waist: 70,
        hips: 92,
        chest: 90,
        rightArm: 28,
        rightThigh: 50,
        bodyFat: 19.2,
        bmi: 23.3,
        comments: "Καλή πρόοδος"
      }
    ]
  },
  {
    id: "3",
    clientName: "Κώστας Δημητρίου",
    measurements: [
      {
        date: "2024-01-08",
        weight: 95.2,
        height: 182,
        waist: 105,
        hips: 108,
        chest: 112,
        rightArm: 38,
        rightThigh: 65,
        bodyFat: 24.5,
        bmi: 28.7,
        comments: "Υπερβάλλον βάρος"
      },
      {
        date: "2024-05-18",
        weight: 88.1,
        height: 182,
        waist: 98,
        hips: 102,
        chest: 115,
        rightArm: 40,
        rightThigh: 62,
        bodyFat: 20.1,
        bmi: 26.6,
        comments: "Εξαιρετική βελτίωση!"
      }
    ]
  },
  {
    id: "4",
    clientName: "Ελένη Παπαδάκη",
    measurements: [
      {
        date: "2024-03-01",
        weight: 58.5,
        height: 160,
        waist: 65,
        hips: 85,
        chest: 82,
        rightArm: 24,
        rightThigh: 48,
        bodyFat: 18.5,
        bmi: 22.9,
        comments: "Καλή φυσική κατάσταση"
      },
      {
        date: "2024-05-15",
        weight: 59.2,
        height: 160,
        waist: 64,
        hips: 86,
        chest: 84,
        rightArm: 25,
        rightThigh: 49,
        bodyFat: 17.8,
        bmi: 23.1,
        comments: "Μυϊκή ανάπτυξη"
      }
    ]
  },
  {
    id: "5",
    clientName: "Νίκος Αλεξάνδρου",
    measurements: [
      {
        date: "2024-02-20",
        weight: 82.0,
        height: 175,
        waist: 88,
        hips: 96,
        chest: 98,
        rightArm: 34,
        rightThigh: 56,
        bodyFat: 20.2,
        bmi: 26.8,
        comments: "Μέτρια φυσική κατάσταση"
      },
      {
        date: "2024-05-10",
        weight: 81.5,
        height: 175,
        waist: 89,
        hips: 97,
        chest: 99,
        rightArm: 34,
        rightThigh: 57,
        bodyFat: 20.8,
        bmi: 26.6,
        comments: "Σταθερή κατάσταση"
      }
    ]
  }
];

// Mock data για μετρήσεις αντοχής
const enduranceTests = [
  {
    id: "1",
    clientName: "Γιάννης Παπαδόπουλος",
    tests: [
      {
        date: "2024-01-15",
        crunches: 25,
        pushups: 12,
        squats: 30,
        plank: 45,
        jumpingJacks: 40,
        rowing: "40kg x 10",
        comments: "Αρχική αξιολόγηση"
      },
      {
        date: "2024-05-24",
        crunches: 45,
        pushups: 28,
        squats: 55,
        plank: 120,
        jumpingJacks: 70,
        rowing: "65kg x 10",
        comments: "Μεγάλη βελτίωση σε όλους τους τομείς"
      }
    ]
  },
  {
    id: "2",
    clientName: "Μαρία Κωνσταντίνου",
    tests: [
      {
        date: "2024-02-10",
        crunches: 35,
        pushups: 8,
        squats: 40,
        plank: 60,
        jumpingJacks: 50,
        rowing: "25kg x 10",
        comments: "Καλή αρχική κατάσταση"
      },
      {
        date: "2024-05-20",
        crunches: 50,
        pushups: 15,
        squats: 60,
        plank: 90,
        jumpingJacks: 75,
        rowing: "35kg x 10",
        comments: "Σταθερή πρόοδος"
      }
    ]
  },
  {
    id: "3",
    clientName: "Κώστας Δημητρίου",
    tests: [
      {
        date: "2024-01-08",
        crunches: 15,
        pushups: 5,
        squats: 20,
        plank: 30,
        jumpingJacks: 25,
        rowing: "50kg x 8",
        comments: "Χαμηλή αντοχή"
      },
      {
        date: "2024-05-18",
        crunches: 40,
        pushups: 20,
        squats: 45,
        plank: 85,
        jumpingJacks: 60,
        rowing: "70kg x 10",
        comments: "Εντυπωσιακή βελτίωση!"
      }
    ]
  },
  {
    id: "4",
    clientName: "Ελένη Παπαδάκη",
    tests: [
      {
        date: "2024-03-01",
        crunches: 40,
        pushups: 10,
        squats: 45,
        plank: 75,
        jumpingJacks: 65,
        rowing: "20kg x 10",
        comments: "Καλή αντοχή"
      },
      {
        date: "2024-05-15",
        crunches: 48,
        pushups: 12,
        squats: 52,
        plank: 85,
        jumpingJacks: 72,
        rowing: "25kg x 10",
        comments: "Σταδιακή βελτίωση"
      }
    ]
  },
  {
    id: "5",
    clientName: "Νίκος Αλεξάνδρου",
    tests: [
      {
        date: "2024-02-20",
        crunches: 30,
        pushups: 15,
        squats: 35,
        plank: 65,
        jumpingJacks: 45,
        rowing: "45kg x 10",
        comments: "Μέτρια αντοχή"
      },
      {
        date: "2024-05-10",
        crunches: 28,
        pushups: 14,
        squats: 33,
        plank: 60,
        jumpingJacks: 42,
        rowing: "42kg x 10",
        comments: "Μικρή υποχώρηση"
      }
    ]
  }
];

// Mock data για strength log
const strengthLogs = [
  {
    id: "1",
    clientName: "Γιάννης Παπαδόπουλος",
    exercises: [
      {
        date: "2024-01-15",
        squat: "60kg x 8",
        benchPress: "50kg x 6",
        deadlift: "80kg x 5",
        shoulderPress: "30kg x 8",
        pullups: 5,
        rowing: "45kg x 10",
        comments: "Καλή τεχνική, χρειάζεται βελτίωση στη δύναμη"
      },
      {
        date: "2024-05-24",
        squat: "85kg x 10",
        benchPress: "70kg x 10",
        deadlift: "110kg x 8",
        shoulderPress: "45kg x 10",
        pullups: 15,
        rowing: "65kg x 10",
        comments: "Εντυπωσιακή πρόοδος σε όλες τις ασκήσεις"
      }
    ]
  },
  {
    id: "2",
    clientName: "Μαρία Κωνσταντίνου",
    exercises: [
      {
        date: "2024-02-10",
        squat: "30kg x 8",
        benchPress: "20kg x 8",
        deadlift: "40kg x 6",
        shoulderPress: "15kg x 8",
        pullups: 2,
        rowing: "25kg x 10",
        comments: "Αρχάρια επίπεδο"
      },
      {
        date: "2024-05-20",
        squat: "45kg x 10",
        benchPress: "30kg x 10",
        deadlift: "55kg x 8",
        shoulderPress: "20kg x 10",
        pullups: 6,
        rowing: "35kg x 10",
        comments: "Καλή πρόοδος στη δύναμη"
      }
    ]
  },
  {
    id: "3",
    clientName: "Κώστας Δημητρίου",
    exercises: [
      {
        date: "2024-01-08",
        squat: "40kg x 5",
        benchPress: "35kg x 4",
        deadlift: "50kg x 3",
        shoulderPress: "20kg x 5",
        pullups: 0,
        rowing: "30kg x 8",
        comments: "Αδύναμος, χρειάζεται εργασία"
      },
      {
        date: "2024-05-18",
        squat: "75kg x 10",
        benchPress: "60kg x 8",
        deadlift: "95kg x 8",
        shoulderPress: "35kg x 10",
        pullups: 8,
        rowing: "55kg x 10",
        comments: "Απίστευτη βελτίωση!"
      }
    ]
  },
  {
    id: "4",
    clientName: "Ελένη Παπαδάκη",
    exercises: [
      {
        date: "2024-03-01",
        squat: "35kg x 10",
        benchPress: "25kg x 8",
        deadlift: "45kg x 8",
        shoulderPress: "12kg x 10",
        pullups: 3,
        rowing: "20kg x 10",
        comments: "Καλή αρχική δύναμη"
      },
      {
        date: "2024-05-15",
        squat: "42kg x 10",
        benchPress: "28kg x 10",
        deadlift: "52kg x 10",
        shoulderPress: "15kg x 10",
        pullups: 5,
        rowing: "25kg x 10",
        comments: "Σταδιακή βελτίωση"
      }
    ]
  },
  {
    id: "5",
    clientName: "Νίκος Αλεξάνδρου",
    exercises: [
      {
        date: "2024-02-20",
        squat: "65kg x 8",
        benchPress: "55kg x 6",
        deadlift: "75kg x 6",
        shoulderPress: "35kg x 8",
        pullups: 8,
        rowing: "50kg x 10",
        comments: "Καλό επίπεδο δύναμης"
      },
      {
        date: "2024-05-10",
        squat: "68kg x 8",
        benchPress: "52kg x 8",
        deadlift: "72kg x 8",
        shoulderPress: "33kg x 8",
        pullups: 7,
        rowing: "48kg x 10",
        comments: "Στασιμότητα στην πρόοδο"
      }
    ]
  }
];

export function AssessmentPage() {
  const [selectedClient, setSelectedClient] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [assessmentType, setAssessmentType] = useState("body");
  const [viewingClientData, setViewingClientData] = useState("1"); // Προεπιλογή πρώτος πελάτης
  
  const [bodyFormData, setBodyFormData] = useState({
    weight: "",
    height: "",
    waist: "",
    hips: "",
    chest: "",
    rightArm: "",
    rightThigh: "",
    bodyFat: "",
    comments: ""
  });

  const [enduranceFormData, setEnduranceFormData] = useState({
    crunches: "",
    pushups: "",
    squats: "",
    plank: "",
    jumpingJacks: "",
    rowing: "",
    comments: ""
  });

  const [strengthFormData, setStrengthFormData] = useState({
    squat: "",
    benchPress: "",
    deadlift: "",
    shoulderPress: "",
    pullups: "",
    rowing: "",
    comments: ""
  });

  // Λίστα όλων των πελατών με μετρήσεις
  const clientsWithAssessments = [
    {
      id: "1",
      name: "Γιάννης Παπαδόπουλος",
      avatar: "/avatars/giannis.jpg",
      initials: "ΓΠ",
      lastAssessment: "2024-05-24",
      totalAssessments: 8,
      latestBMI: "24.7",
      trend: "improving"
    },
    {
      id: "2", 
      name: "Μαρία Κωνσταντίνου",
      avatar: null,
      initials: "ΜΚ",
      lastAssessment: "2024-05-20",
      totalAssessments: 5,
      latestBMI: "22.1",
      trend: "stable"
    },
    {
      id: "3",
      name: "Κώστας Δημητρίου", 
      avatar: null,
      initials: "ΚΔ",
      lastAssessment: "2024-05-18",
      totalAssessments: 12,
      latestBMI: "26.8",
      trend: "improving"
    },
    {
      id: "4",
      name: "Ελένη Παπαδάκη",
      avatar: null,
      initials: "ΕΠ", 
      lastAssessment: "2024-05-15",
      totalAssessments: 3,
      latestBMI: "21.5",
      trend: "stable"
    },
    {
      id: "5",
      name: "Νίκος Αλεξάνδρου",
      avatar: null,
      initials: "ΝΑ",
      lastAssessment: "2024-05-10",
      totalAssessments: 6,
      latestBMI: "25.2",
      trend: "declining"
    }
  ];

  const getCurrentClientData = () => {
    const clientId = viewingClientData;
    const bodyData = bodyMeasurements.find(b => b.id === clientId);
    const enduranceData = enduranceTests.find(e => e.id === clientId);
    const strengthData = strengthLogs.find(s => s.id === clientId);
    
    return {
      body: bodyData?.measurements || [],
      endurance: enduranceData?.tests || [],
      strength: strengthData?.exercises || []
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

  const handleSaveAssessment = () => {
    // Εδώ θα προστεθεί η λογική αποθήκευσης
    console.log("Saving assessment:", { assessmentType, bodyFormData, enduranceFormData, strengthFormData });
    setIsDialogOpen(false);
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
                            <SelectItem value="1">Γιάννης Παπαδόπουλος</SelectItem>
                            <SelectItem value="2">Μαρία Κωνσταντίνου</SelectItem>
                            <SelectItem value="3">Κώστας Δημητρίου</SelectItem>
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

                    {assessmentType === "body" && (
                      <div className="grid gap-4">
                        <h3 className="text-lg font-semibold">Σωματομετρήσεις</h3>
                        <div className="grid grid-cols-4 gap-4">
                          <div>
                            <Label>Βάρος (kg)</Label>
                            <Input 
                              type="number" 
                              value={bodyFormData.weight}
                              onChange={(e) => setBodyFormData({...bodyFormData, weight: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label>Ύψος (cm)</Label>
                            <Input 
                              type="number"
                              value={bodyFormData.height}
                              onChange={(e) => setBodyFormData({...bodyFormData, height: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label>Μέση (cm)</Label>
                            <Input 
                              type="number"
                              value={bodyFormData.waist}
                              onChange={(e) => setBodyFormData({...bodyFormData, waist: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label>Γοφοί (cm)</Label>
                            <Input 
                              type="number"
                              value={bodyFormData.hips}
                              onChange={(e) => setBodyFormData({...bodyFormData, hips: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                          <div>
                            <Label>Στήθος (cm)</Label>
                            <Input 
                              type="number"
                              value={bodyFormData.chest}
                              onChange={(e) => setBodyFormData({...bodyFormData, chest: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label>Μπράτσο Δεξί (cm)</Label>
                            <Input 
                              type="number"
                              value={bodyFormData.rightArm}
                              onChange={(e) => setBodyFormData({...bodyFormData, rightArm: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label>Μηρός Δεξί (cm)</Label>
                            <Input 
                              type="number"
                              value={bodyFormData.rightThigh}
                              onChange={(e) => setBodyFormData({...bodyFormData, rightThigh: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label>Ποσοστό Λίπους (%)</Label>
                            <Input 
                              type="number"
                              step="0.1"
                              value={bodyFormData.bodyFat}
                              onChange={(e) => setBodyFormData({...bodyFormData, bodyFat: e.target.value})}
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
                              onChange={(e) => setEnduranceFormData({...enduranceFormData, crunches: e.target.value})}
                              placeholder="π.χ. 35"
                            />
                          </div>
                          <div>
                            <Label>Push-ups (μέχρι κόπωση)</Label>
                            <Input 
                              type="number"
                              value={enduranceFormData.pushups}
                              onChange={(e) => setEnduranceFormData({...enduranceFormData, pushups: e.target.value})}
                              placeholder="π.χ. 18"
                            />
                          </div>
                          <div>
                            <Label>Squats (1 λεπτό)</Label>
                            <Input 
                              type="number"
                              value={enduranceFormData.squats}
                              onChange={(e) => setEnduranceFormData({...enduranceFormData, squats: e.target.value})}
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
                              onChange={(e) => setEnduranceFormData({...enduranceFormData, plank: e.target.value})}
                              placeholder="π.χ. 70"
                            />
                          </div>
                          <div>
                            <Label>Jumping Jacks (1 λεπτό)</Label>
                            <Input 
                              type="number"
                              value={enduranceFormData.jumpingJacks}
                              onChange={(e) => setEnduranceFormData({...enduranceFormData, jumpingJacks: e.target.value})}
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
                              type="number"
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
                    <Button onClick={handleSaveAssessment}>
                      <Save className="h-4 w-4 mr-2" />
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
                            Τελευταία: {client.lastAssessment}
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
                          <div className="font-bold text-lg text-primary">{client.latestBMI}</div>
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
            <div className="mb-4">
              {viewingClientData && (
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <h2 className="text-lg font-semibold text-primary mb-2">
                    Προβολή δεδομένων για: {clientsWithAssessments.find(c => c.id === viewingClientData)?.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Τα παρακάτω στατιστικά και πίνακες εμφανίζουν τα δεδομένα του επιλεγμένου πελάτη.
                  </p>
                </div>
              )}
            </div>

            {/* Στατιστικά Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ενεργές Αξιολογήσεις</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
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
                  <div className="text-2xl font-bold">18</div>
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
                  <div className="text-2xl font-bold">+12%</div>
                  <p className="text-xs text-muted-foreground">
                    σε strength metrics
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Φωτογραφίες</CardTitle>
                  <Camera className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">156</div>
                  <p className="text-xs text-muted-foreground">
                    progress photos αποθηκευμένες
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
                      const bmiDiff = calculateDifference(latest.bmi, previous.bmi);

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
                              <TableCell>{previous.bmi}</TableCell>
                              <TableCell>{latest.bmi}</TableCell>
                              <TableCell className="flex items-center gap-2">
                                {getTrendIcon(parseFloat(bmiDiff.diff), false)}
                                <span className={`font-bold ${parseFloat(bmiDiff.diff) < 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {bmiDiff.diff} ({bmiDiff.percentage}%)
                                </span>
                              </TableCell>
                              <TableCell>{latest.bmi < 25 ? 'Υγιές εύρος' : latest.bmi < 30 ? 'Υπέρβαρος' : 'Παχύσαρκος'}</TableCell>
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
                                {getTrendIcon(latest.pullups - previous.pullups)}
                                <span className={`font-bold ${latest.pullups > previous.pullups ? 'text-green-600' : 'text-red-600'}`}>
                                  {latest.pullups > previous.pullups ? '+' : ''}{latest.pullups - previous.pullups} ({(((latest.pullups - previous.pullups) / previous.pullups) * 100).toFixed(0)}%)
                                </span>
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