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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Search,
  TrendingUp,
  TrendingDown,
  Ruler,
  Weight,
  Activity,
  Target,
  Calculator,
  Camera,
} from "lucide-react";
import { ProgressPhotosGallery } from "@/components/ProgressPhotosGallery";
import { usersApi, measurementsApi } from "@/services/apiService";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";

// Mock data για σωματομετρήσεις - TO BE REMOVED WHEN IMPLEMENTED
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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserFromDropdown, setSelectedUserFromDropdown] = useState("");
  const [viewingClientData, setViewingClientData] = useState(""); // Κανένας επιλεγμένος αρχικά
  const [photosCount, setPhotosCount] = useState(0);
  const [realUsers, setRealUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userMeasurements, setUserMeasurements] = useState<{[userId: string]: any}>({});
  const [loadingMeasurements, setLoadingMeasurements] = useState<{[userId: string]: boolean}>({});
  const { toast } = useToast();

  // Φόρτωση πραγματικών χρηστών από το API
  useEffect(() => {
    fetchUsers();
  }, []);

  // Φόρτωση measurements για συγκεκριμένο χρήστη
  const fetchUserMeasurements = async (userId: string) => {
    if (userMeasurements[userId] || loadingMeasurements[userId]) {
      return; // Already loaded or loading
    }

    setLoadingMeasurements(prev => ({ ...prev, [userId]: true }));
    try {
      const measurements = await measurementsApi.getUserMeasurements(userId);
      setUserMeasurements(prev => ({ 
        ...prev, 
        [userId]: measurements 
      }));
    } catch (error) {
      console.error(`Error fetching measurements for user ${userId}:`, error);
      // Don't show toast for missing measurements - it's normal
    } finally {
      setLoadingMeasurements(prev => ({ ...prev, [userId]: false }));
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await usersApi.getAll();
      console.log('API Response:', response); // Debug log
      
      // Ελέγχουμε αν το response είναι array ή αν περιέχει data property
      let users = [];
      if (Array.isArray(response)) {
        users = response;
      } else if (response?.data && Array.isArray(response.data)) {
        users = response.data;
      } else if (response?.users && Array.isArray(response.users)) {
        users = response.users;
      } else {
        console.error('Unexpected API response structure:', response);
        throw new Error('Invalid response format');
      }
      
      // Φιλτράρουμε μόνο active χρήστες
      const activeUsers = users.filter((user: any) => 
        user.status === 'active' || user.status === 'pending_approval'
      );
      
      setRealUsers(activeUsers);
      // Αν υπάρχουν χρήστες, επίλεξε τον πρώτο
      if (activeUsers.length > 0) {
        const firstUserId = activeUsers[0].id.toString();
        setViewingClientData(firstUserId);
        setSelectedUserFromDropdown(firstUserId);
        // Φόρτωσε measurements για τον πρώτο χρήστη
        fetchUserMeasurements(firstUserId);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Σφάλμα",
        description: "Αποτυχία φόρτωσης χρηστών",
        variant: "destructive"
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  // Helper function για τελευταία μέτρηση
  const getLastMeasurementInfo = (userId: string) => {
    const measurements = userMeasurements[userId];
    if (!measurements || measurements.length === 0) {
      return null;
    }

    // Βρες την τελευταία μέτρηση
    const latest = measurements[measurements.length - 1];
    const measurementDate = new Date(latest.date);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - measurementDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      daysAgo: diffDays,
      weight: latest.weight,
      bmi: latest.bmi
    };
  };

  const getCurrentClientData = () => {
    const clientId = viewingClientData;
    
    // Get real measurements from API
    const realMeasurements = userMeasurements[clientId] || [];
    
    // Convert API format to expected format for compatibility
    const bodyData = realMeasurements.map((measurement: any) => ({
      date: measurement.date,
      weight: parseFloat(measurement.weight),
      height: parseFloat(measurement.height),
      waist: parseFloat(measurement.waist),
      hips: parseFloat(measurement.hips),
      chest: parseFloat(measurement.chest),
      rightArm: parseFloat(measurement.arm), // API uses 'arm' instead of 'rightArm'
      rightThigh: parseFloat(measurement.thigh), // API uses 'thigh' instead of 'rightThigh'
      bodyFat: parseFloat(measurement.bodyFat),
      bmi: parseFloat(measurement.bmi),
      comments: measurement.notes || ''
    }));

    // Keep mock data for endurance and strength (not implemented yet)
    const enduranceData = enduranceTests.find(e => e.id === clientId);
    const strengthData = strengthLogs.find(s => s.id === clientId);
    
    return {
      body: bodyData,
      endurance: enduranceData?.tests || [],
      strength: strengthData?.exercises || []
    };
  };

  // Χρησιμοποιούμε τους πραγματικούς χρήστες αντί για mock
  const filteredClients = realUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );




  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <AdminHeader />
          <main className="flex-1 p-6 space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-foreground">Αξιολόγηση Προπόνησης</h1>
              <p className="text-muted-foreground">
                Προβολή σωματομετρήσεων και φωτογραφιών προόδου πελατών
              </p>
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
                  <div className="min-w-[200px]">
                    <Select 
                      value={selectedUserFromDropdown} 
                      onValueChange={(value) => {
                        setSelectedUserFromDropdown(value);
                        setViewingClientData(value);
                        fetchUserMeasurements(value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Επιλέξτε πελάτη" />
                      </SelectTrigger>
                      <SelectContent>
                        {realUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.name} ({user.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Σύνολο: {filteredClients.length} πελάτες
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loadingUsers ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      Φόρτωση χρηστών...
                    </h3>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredClients.map((client) => {
                      // Fetch measurements when card becomes visible
                      if (!userMeasurements[client.id] && !loadingMeasurements[client.id]) {
                        fetchUserMeasurements(client.id.toString());
                      }
                      
                      const lastMeasurement = getLastMeasurementInfo(client.id.toString());
                      
                      return (
                        <div
                          key={client.id}
                          onClick={() => {
                            const userId = client.id.toString();
                            setViewingClientData(userId);
                            setSelectedUserFromDropdown(userId);
                            fetchUserMeasurements(userId);
                          }}
                          className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                            viewingClientData === client.id.toString()
                              ? "border-primary bg-primary/5 shadow-md"
                              : "border-border hover:border-accent hover:bg-accent/20"
                          }`}
                        >
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={client.profilePicture || undefined} alt={client.name} />
                          <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                            {client.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-foreground truncate">{client.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {client.email}
                          </p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Ενεργός</Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-center">
                          <div className="font-bold text-lg text-primary">{client.phone || 'N/A'}</div>
                          <div className="text-muted-foreground">Τηλέφωνο</div>
                        </div>
                        <div className="text-center">
                          {loadingMeasurements[client.id] ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mx-auto"></div>
                          ) : lastMeasurement ? (
                            <div className="font-bold text-lg text-primary">
                              {lastMeasurement.daysAgo}η
                            </div>
                          ) : (
                            <div className="font-bold text-lg text-muted-foreground">-</div>
                          )}
                          <div className="text-muted-foreground">Τελ. μέτρηση</div>
                        </div>
                      </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {!loadingUsers && filteredClients.length === 0 && (
                  <div className="text-center py-8">
                    <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      Δεν βρέθηκαν πελάτες
                    </h3>
                    <p className="text-muted-foreground">
                      Δοκιμάστε διαφορετικούς όρους αναζήτησης ή ελέγξτε τη σύνδεση με το API
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
                    Προβολή δεδομένων για: {realUsers.find(u => u.id.toString() === viewingClientData)?.name || 'Άγνωστο'}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Τα παρακάτω στατιστικά και πίνακες εμφανίζουν τα δεδομένα του επιλεγμένου πελάτη.
                  </p>
                </div>
              )}
            </div>

            {/* Στατιστικά Cards με πραγματικά δεδομένα */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ενεργές Αξιολογήσεις</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {realUsers.filter(user => userMeasurements[user.id] && userMeasurements[user.id].length > 0).length}
                  </div>
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
                    {(() => {
                      const currentMonth = new Date().getMonth();
                      const currentYear = new Date().getFullYear();
                      let count = 0;
                      Object.values(userMeasurements).forEach((measurements: any) => {
                        measurements.forEach((m: any) => {
                          const mDate = new Date(m.date);
                          if (mDate.getMonth() === currentMonth && mDate.getFullYear() === currentYear) {
                            count++;
                          }
                        });
                      });
                      return count;
                    })()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    νέες αξιολογήσεις
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Μέση Απώλεια Βάρους</CardTitle>
                  <TrendingDown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(() => {
                      let totalWeightLoss = 0;
                      let usersWithLoss = 0;
                      Object.values(userMeasurements).forEach((measurements: any) => {
                        if (measurements.length >= 2) {
                          const sorted = [...measurements].sort((a: any, b: any) => 
                            new Date(a.date).getTime() - new Date(b.date).getTime()
                          );
                          const weightDiff = parseFloat(sorted[sorted.length - 1].weight) - parseFloat(sorted[0].weight);
                          if (weightDiff < 0) {
                            totalWeightLoss += Math.abs(weightDiff);
                            usersWithLoss++;
                          }
                        }
                      });
                      return usersWithLoss > 0 ? (totalWeightLoss / usersWithLoss).toFixed(1) + 'kg' : '0kg';
                    })()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    ανά πελάτη
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Φωτογραφίες</CardTitle>
                  <Camera className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{photosCount}</div>
                  <p className="text-xs text-muted-foreground">
                    {photosCount === 1 ? 'φωτογραφία προόδου' : 'φωτογραφίες προόδου'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="body" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="body">Σωματομετρήσεις</TabsTrigger>
                <TabsTrigger value="photos">Φωτογραφίες</TabsTrigger>
              </TabsList>

              {/* Body Measurements Tab */}
              <TabsContent value="body" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Σωματομετρήσεις - {realUsers.find(u => u.id.toString() === viewingClientData)?.name || "Επιλέξτε πελάτη"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      // Show loading if measurements are being fetched
                      if (loadingMeasurements[viewingClientData]) {
                        return (
                          <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                            <h3 className="text-lg font-medium text-foreground mb-2">
                              Φόρτωση μετρήσεων...
                            </h3>
                          </div>
                        );
                      }

                      const clientData = getCurrentClientData();
                      const bodyData = clientData.body;
                      
                      if (bodyData.length === 0) {
                        return (
                          <div className="text-center py-8">
                            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-foreground mb-2">
                              Δεν υπάρχουν μετρήσεις
                            </h3>
                            <p className="text-muted-foreground">
                              Ο χρήστης δεν έχει καταγράψει καμία σωματομέτρηση ακόμη
                            </p>
                          </div>
                        );
                      }

                      // Sort measurements by date (newest first)
                      const sortedData = [...bodyData].sort((a, b) => 
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                      );

                      return (
                        <>
                          {/* Summary of total measurements */}
                          <div className="mb-4 p-4 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">
                              Σύνολο μετρήσεων: <span className="font-bold text-foreground">{bodyData.length}</span>
                            </p>
                          </div>

                          {/* All measurements table */}
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Ημερομηνία</TableHead>
                                <TableHead>Βάρος (kg)</TableHead>
                                <TableHead>BMI</TableHead>
                                <TableHead>Μέση (cm)</TableHead>
                                <TableHead>Στήθος (cm)</TableHead>
                                <TableHead>Γοφοί (cm)</TableHead>
                                <TableHead>Μπράτσο (cm)</TableHead>
                                <TableHead>Μηρός (cm)</TableHead>
                                <TableHead>Σχόλια</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {sortedData.map((measurement, index) => {
                                const isLatest = index === 0;
                                const prevMeasurement = index < sortedData.length - 1 ? sortedData[index + 1] : null;
                                
                                return (
                                  <TableRow key={index} className={isLatest ? "bg-primary/5" : ""}>
                                    <TableCell className="font-medium">
                                      {new Date(measurement.date).toLocaleDateString('el-GR')}
                                      {isLatest && (
                                        <Badge className="ml-2 bg-green-100 text-green-800">Τελευταία</Badge>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        {measurement.weight}
                                        {prevMeasurement && (
                                          <span className={`text-xs ${measurement.weight < prevMeasurement.weight ? 'text-green-600' : measurement.weight > prevMeasurement.weight ? 'text-red-600' : 'text-gray-400'}`}>
                                            {measurement.weight < prevMeasurement.weight ? '↓' : measurement.weight > prevMeasurement.weight ? '↑' : '='}
                                            {Math.abs(measurement.weight - prevMeasurement.weight).toFixed(1)}
                                          </span>
                                        )}
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        {measurement.bmi}
                                        {prevMeasurement && (
                                          <span className={`text-xs ${measurement.bmi < prevMeasurement.bmi ? 'text-green-600' : measurement.bmi > prevMeasurement.bmi ? 'text-red-600' : 'text-gray-400'}`}>
                                            {measurement.bmi < prevMeasurement.bmi ? '↓' : measurement.bmi > prevMeasurement.bmi ? '↑' : '='}
                                          </span>
                                        )}
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        {measurement.waist}
                                        {prevMeasurement && (
                                          <span className={`text-xs ${measurement.waist < prevMeasurement.waist ? 'text-green-600' : measurement.waist > prevMeasurement.waist ? 'text-red-600' : 'text-gray-400'}`}>
                                            {measurement.waist < prevMeasurement.waist ? '↓' : measurement.waist > prevMeasurement.waist ? '↑' : '='}
                                          </span>
                                        )}
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        {measurement.chest}
                                        {prevMeasurement && (
                                          <span className={`text-xs ${measurement.chest > prevMeasurement.chest ? 'text-green-600' : measurement.chest < prevMeasurement.chest ? 'text-red-600' : 'text-gray-400'}`}>
                                            {measurement.chest > prevMeasurement.chest ? '↑' : measurement.chest < prevMeasurement.chest ? '↓' : '='}
                                          </span>
                                        )}
                                      </div>
                                    </TableCell>
                                    <TableCell>{measurement.hips}</TableCell>
                                    <TableCell>{measurement.rightArm}</TableCell>
                                    <TableCell>{measurement.rightThigh}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                                      {measurement.comments || '-'}
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>

                          {/* Comparison section if we have 2+ measurements */}
                          {bodyData.length >= 2 && (
                            <div className="mt-6">
                              <h4 className="text-lg font-semibold mb-4">Σύγκριση Τελευταίων Μετρήσεων</h4>
                              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                <Card>
                                  <CardHeader className="pb-2">
                                    <CardTitle className="text-sm">Βάρος</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="flex items-center gap-2">
                                      <Weight className="h-4 w-4 text-muted-foreground" />
                                      <span className="text-2xl font-bold">
                                        {sortedData[0].weight}kg
                                      </span>
                                      {sortedData[1] && (
                                        <span className={`text-sm ${sortedData[0].weight < sortedData[1].weight ? 'text-green-600' : 'text-red-600'}`}>
                                          {sortedData[0].weight < sortedData[1].weight ? '↓' : '↑'}
                                          {Math.abs(sortedData[0].weight - sortedData[1].weight).toFixed(1)}kg
                                        </span>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>

                                <Card>
                                  <CardHeader className="pb-2">
                                    <CardTitle className="text-sm">BMI</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="flex items-center gap-2">
                                      <Calculator className="h-4 w-4 text-muted-foreground" />
                                      <span className="text-2xl font-bold">
                                        {sortedData[0].bmi}
                                      </span>
                                      {sortedData[1] && (
                                        <span className={`text-sm ${sortedData[0].bmi < sortedData[1].bmi ? 'text-green-600' : 'text-red-600'}`}>
                                          {sortedData[0].bmi < sortedData[1].bmi ? '↓' : '↑'}
                                          {Math.abs(sortedData[0].bmi - sortedData[1].bmi).toFixed(1)}
                                        </span>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>

                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Progress Photos Tab */}
              <TabsContent value="photos" className="space-y-4">
                {viewingClientData ? (
                  <ProgressPhotosGallery
                    userId={viewingClientData}
                    userName={realUsers.find(u => u.id.toString() === viewingClientData)?.name || ""}
                    onPhotosCountChange={setPhotosCount}
                  />
                ) : (
                  <Card>
                    <CardContent className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">
                          Επιλέξτε πελάτη
                        </h3>
                        <p className="text-muted-foreground">
                          Παρακαλώ επιλέξτε έναν πελάτη από τη λίστα για να δείτε τις φωτογραφίες προόδου του.
                        </p>
                      </div>
                  </CardContent>
                </Card>
                )}
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
