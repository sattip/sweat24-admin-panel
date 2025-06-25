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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaymentInstallmentsModal } from "@/components/PaymentInstallmentsModal";
import { CashRegisterModal } from "@/components/CashRegisterModal";
import { BusinessExpenseModal } from "@/components/BusinessExpenseModal";
import {
  Euro,
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  Clock,
  AlertCircle,
  FileText,
  CreditCard,
  Banknote,
  Smartphone,
  UserX,
  ExternalLink,
  Wallet,
  Receipt,
  Calculator,
} from "lucide-react";
import { format } from "date-fns";
import { el } from "date-fns/locale";
import { useToast } from "@/components/ui/use-toast";

// Mock data για οικονομικά
const todayRevenue = {
  total: 2456.50,
  byService: {
    group_classes: 856.40,
    personal_training: 720.00,
    ems: 480.00,
    pilates: 320.10,
    trial_sessions: 80.00, // Δοκιμαστικές ξεχωριστά
  },
  byProduct: {
    supplements: 340.20,
    ems_gear: 179.98,
    pilates_accessories: 74.97,
    cambridge: 139.96,
    accessories: 59.99,
  },
  byPaymentMethod: {
    iris: 1234.56,
    pos: 867.43,
    cash: 354.51,
  },
};

const monthlyRevenue = {
  total: 45890.75,
  byService: {
    group_classes: 18456.30,
    personal_training: 15670.20,
    ems: 7840.50,
    pilates: 3123.75,
    trial_sessions: 800.00,
  },
  lastMonth: 41250.30,
  growth: 11.2,
};

const todaySessions = {
  total: 47,
  byService: {
    group_classes: 24,
    personal_training: 12,
    ems: 8,
    pilates: 3,
  },
  trial_sessions: 4, // Δοκιμαστικές ξεχωριστά
  completed: 43,
  cancelled: 4,
};

const inactiveClients = [
  {
    id: "1",
    name: "Αλέξανδρος Νικολάου",
    email: "alex@email.com",
    lastVisit: "2024-03-15",
    daysSinceVisit: 71,
    remainingSessions: 5,
    membershipType: "Premium",
    phone: "6944123456",
  },
  {
    id: "2",
    name: "Ελένη Παπαδάκη",
    email: "eleni@email.com",
    lastVisit: "2024-04-02",
    daysSinceVisit: 53,
    remainingSessions: 0,
    membershipType: "Basic",
    phone: "6955234567",
  },
  {
    id: "3",
    name: "Νίκος Καραγιάννης",
    email: "nikos@email.com",
    lastVisit: "2024-02-28",
    daysSinceVisit: 87,
    remainingSessions: 8,
    membershipType: "Personal Training",
    phone: "6966345678",
  },
];

const outstandingDebts = [
  {
    id: "1",
    type: "client",
    name: "Γιώργος Μιχαηλίδης",
    amount: 120.00,
    description: "Μηνιαία συνδρομή Μαρτίου",
    dueDate: "2024-04-01",
    overdueDays: 54,
    phone: "6977456789",
  },
  {
    id: "2",
    type: "trainer",
    name: "Άλεξ Ροδρίγκεζ",
    amount: 45.99,
    description: "Αγορά Protein Powder",
    dueDate: "2024-05-20",
    overdueDays: 4,
    phone: "6944111222",
  },
  {
    id: "3",
    type: "client",
    name: "Μαρίνα Κωστοπούλου",
    amount: 89.99,
    description: "Personal Training package",
    dueDate: "2024-05-15",
    overdueDays: 9,
    phone: "6988567890",
  },
];

export function FinancePage() {
  const [selectedPeriod, setSelectedPeriod] = useState("today");
  const [currentTime, setCurrentTime] = useState(new Date());
  const { toast } = useToast();

  const handleApproveExpense = (expenseId: string) => {
    toast({
      title: "Έξοδο Εγκρίθηκε",
      description: "Το έξοδο εγκρίθηκε επιτυχώς."
    });
  };

  const handleRejectExpense = (expenseId: string) => {
    toast({
      title: "Έξοδο Απορρίφθηκε",
      description: "Το έξοδο απορρίφθηκε και διαγράφηκε.",
      variant: "destructive"
    });
  };

  // Live clock update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getServiceIcon = (service: string) => {
    switch (service) {
      case "group_classes": return "👥";
      case "personal_training": return "🏋️";
      case "ems": return "⚡";
      case "pilates": return "🧘";
      case "trial_sessions": return "🎯";
      default: return "💪";
    }
  };

  const getServiceLabel = (service: string) => {
    switch (service) {
      case "group_classes": return "Ομαδικά Μαθήματα";
      case "personal_training": return "Personal Training";
      case "ems": return "EMS Training";
      case "pilates": return "Pilates";
      case "trial_sessions": return "Δοκιμαστικές";
      default: return service;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "iris": return <Smartphone className="h-4 w-4" />;
      case "pos": return <CreditCard className="h-4 w-4" />;
      case "cash": return <Banknote className="h-4 w-4" />;
      default: return <Euro className="h-4 w-4" />;
    }
  };

  const getInactivityBadge = (days: number) => {
    if (days > 90) return <Badge variant="destructive">Κρίσιμο ({days} ημέρες)</Badge>;
    if (days > 60) return <Badge variant="secondary">Μέτριο ({days} ημέρες)</Badge>;
    return <Badge variant="outline">Πρόσφατο ({days} ημέρες)</Badge>;
  };

  const getDebtBadge = (overdueDays: number) => {
    if (overdueDays > 30) return <Badge variant="destructive">Καθυστερημένο</Badge>;
    if (overdueDays > 7) return <Badge variant="secondary">Προσοχή</Badge>;
    return <Badge variant="outline">Πρόσφατο</Badge>;
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <AdminHeader />
          <main className="flex-1 p-6 space-y-6">
            {/* Header με Live Clock */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Οικονομικά & Πωλήσεις</h1>
                <p className="text-muted-foreground">
                  Live tracking εσόδων, συνεδριών και οφειλών
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Live Update</div>
                <div className="text-lg font-mono">
                  {format(currentTime, "HH:mm:ss", { locale: el })}
                </div>
                <div className="text-sm text-muted-foreground">
                  {format(currentTime, "dd/MM/yyyy", { locale: el })}
                </div>
              </div>
            </div>

            {/* Live Σύνολα Σήμερα */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="border-green-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Έσοδα Σήμερα</CardTitle>
                  <Euro className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">€{todayRevenue.total}</div>
                  <p className="text-xs text-muted-foreground">
                    Live update - {format(currentTime, "HH:mm")}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-blue-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Συνεδρίες Σήμερα</CardTitle>
                  <Users className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{todaySessions.total}</div>
                  <p className="text-xs text-muted-foreground">
                    {todaySessions.completed} ολοκληρωμένες / {todaySessions.cancelled} ακυρώσεις
                  </p>
                </CardContent>
              </Card>
              <Card className="border-orange-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Δοκιμαστικές</CardTitle>
                  <Clock className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{todaySessions.trial_sessions}</div>
                  <p className="text-xs text-muted-foreground">
                    €{todayRevenue.byService.trial_sessions} έσοδα
                  </p>
                </CardContent>
              </Card>
              <Card className="border-purple-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Μηνιαία Άύξηση</CardTitle>
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">+{monthlyRevenue.growth}%</div>
                  <p className="text-xs text-muted-foreground">
                    vs προηγούμενος μήνας
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="revenue" className="w-full">
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="revenue">Έσοδα</TabsTrigger>
                <TabsTrigger value="sessions">Συνεδρίες</TabsTrigger>
                <TabsTrigger value="installments">Δόσεις</TabsTrigger>
                <TabsTrigger value="cashregister">Live Ταμείο</TabsTrigger>
                <TabsTrigger value="expenses">Έξοδα</TabsTrigger>
                <TabsTrigger value="inactive">Ανενεργοί</TabsTrigger>
                <TabsTrigger value="debts">Οφειλές</TabsTrigger>
              </TabsList>

              {/* Revenue Tab */}
              <TabsContent value="revenue" className="space-y-4">
                <div className="grid gap-6 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Έσοδα ανά Υπηρεσία (Σήμερα)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Object.entries(todayRevenue.byService).map(([service, amount]) => (
                          <div key={service} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{getServiceIcon(service)}</span>
                              <span className="font-medium">{getServiceLabel(service)}</span>
                            </div>
                            <div className="text-right">
                              <div className="font-bold">€{amount}</div>
                              <div className="text-sm text-muted-foreground">
                                {Math.round((amount / todayRevenue.total) * 100)}%
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Μέθοδοι Πληρωμής (Σήμερα)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Object.entries(todayRevenue.byPaymentMethod).map(([method, amount]) => (
                          <div key={method} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              {getPaymentMethodIcon(method)}
                              <span className="font-medium">{method.toUpperCase()}</span>
                            </div>
                            <div className="text-right">
                              <div className="font-bold">€{amount}</div>
                              <div className="text-sm text-muted-foreground">
                                {Math.round((amount / todayRevenue.total) * 100)}%
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Πωλήσεις Προϊόντων (Σήμερα)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-5">
                      {Object.entries(todayRevenue.byProduct).map(([product, amount]) => (
                        <div key={product} className="text-center p-4 border rounded-lg">
                          <div className="font-medium text-sm mb-2">
                            {product.replace('_', ' ').toUpperCase()}
                          </div>
                          <div className="text-xl font-bold">€{amount}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Sessions Tab */}
              <TabsContent value="sessions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Live Συνεδρίες ανά Υπηρεσία</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Υπηρεσία</TableHead>
                          <TableHead>Σήμερα</TableHead>
                          <TableHead>Αυτό το Μήνα</TableHead>
                          <TableHead>Έσοδα Σήμερα</TableHead>
                          <TableHead>Έσοδα Μήνα</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(todaySessions.byService).map(([service, todayCount]) => (
                          <TableRow key={service}>
                            <TableCell className="flex items-center gap-2">
                              <span>{getServiceIcon(service)}</span>
                              {getServiceLabel(service)}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{todayCount}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {Math.round(todayCount * 24)} {/* εκτίμηση μήνα */}
                              </Badge>
                            </TableCell>
                            <TableCell>€{todayRevenue.byService[service]}</TableCell>
                            <TableCell>€{monthlyRevenue.byService[service]}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="border-t-2">
                          <TableCell className="font-bold">Δοκιμαστικές (Ξεχωριστά)</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-orange-100">{todaySessions.trial_sessions}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {Math.round(todaySessions.trial_sessions * 24)}
                            </Badge>
                          </TableCell>
                          <TableCell>€{todayRevenue.byService.trial_sessions}</TableCell>
                          <TableCell>€{monthlyRevenue.byService.trial_sessions}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Payment Installments Tab */}
              <TabsContent value="installments" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Διαχείριση Δόσεων Πληρωμής</h2>
                  <PaymentInstallmentsModal />
                </div>
                
                <div className="grid gap-4 md:grid-cols-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Calculator className="h-4 w-4" />
                        Συνολικές Δόσεις
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">42</div>
                      <p className="text-xs text-muted-foreground">
                        Όλοι οι πελάτες
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Clock className="h-4 w-4 text-orange-600" />
                        Εκκρεμείς
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-orange-600">18</div>
                      <p className="text-xs text-muted-foreground">
                        €3,600 σύνολο
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        Καθυστερημένες
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">5</div>
                      <p className="text-xs text-muted-foreground">
                        €750 σύνολο
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        Αυτόματα Ξεκλειδώματα
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">12</div>
                      <p className="text-xs text-muted-foreground">
                        Τον τελευταίο μήνα
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Επισκόπηση Δόσεων & Ξεκλειδώματα Τιμοκαταλόγου</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Διαχείριση Δόσεων Πληρωμής</h3>
                      <p className="text-muted-foreground mb-4">
                        Καταγράψτε δόσεις πελατών και παρακολουθήστε τα αυτόματα ξεκλειδώματα τιμοκαταλόγου
                      </p>
                      <PaymentInstallmentsModal />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Cash Register Tab */}
              <TabsContent value="cashregister" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Live Ταμείο</h2>
                  <CashRegisterModal />
                </div>
                
                <div className="grid gap-4 md:grid-cols-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        Σημερινά Έσοδα
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">€{todayRevenue.total.toFixed(2)}</div>
                      <p className="text-xs text-muted-foreground">
                        15 συναλλαγές
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-red-600" />
                        Σημερινές Αναλήψεις
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">€500.00</div>
                      <p className="text-xs text-muted-foreground">
                        1 ανάληψη ιδιοκτήτη
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Wallet className="h-4 w-4" />
                        Καθαρό Σημερινό
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        €{(todayRevenue.total - 500).toFixed(2)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Έσοδα - Αναλήψεις
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Banknote className="h-4 w-4" />
                        Μετρητά στο Ταμείο
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">€{(todayRevenue.byPaymentMethod.cash - 500).toFixed(2)}</div>
                      <p className="text-xs text-muted-foreground">
                        Διαθέσιμα μετρητά
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Παρακολούθηση Ταμείου σε Πραγματικό Χρόνο</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <Wallet className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Live Ταμείο</h3>
                      <p className="text-muted-foreground mb-4">
                        Καταγράψτε έσοδα και αναλήψεις με άμεση ενημέρωση υπολοίπου
                      </p>
                      <CashRegisterModal />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Business Expenses Tab */}
              <TabsContent value="expenses" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Καταγραφή Εξόδων</h2>
                  <BusinessExpenseModal />
                </div>
                
                <div className="grid gap-4 md:grid-cols-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Σημερινά Έξοδα</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">€230.00</div>
                      <p className="text-xs text-muted-foreground">
                        3 έξοδα
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Μηνιαία Έξοδα</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">€5,450.00</div>
                      <p className="text-xs text-muted-foreground">
                        42 έξοδα
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Εκκρεμή Έξοδα</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-orange-600">€80.00</div>
                      <p className="text-xs text-muted-foreground">
                        1 εκκρεμές
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Κύρια Κατηγορία</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg font-bold">Λειτουργικά</div>
                      <p className="text-xs text-muted-foreground">
                        65% των εξόδων
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Πρόσφατα Έξοδα</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ημερομηνία</TableHead>
                          <TableHead>Κατηγορία</TableHead>
                          <TableHead>Περιγραφή</TableHead>
                          <TableHead>Προμηθευτής</TableHead>
                          <TableHead>Ποσό</TableHead>
                          <TableHead>Κατάσταση</TableHead>
                          <TableHead>Ενέργειες</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>{format(new Date(), 'dd/MM/yyyy', { locale: el })}</TableCell>
                          <TableCell>
                            <Badge variant="outline">Λειτουργικά</Badge>
                          </TableCell>
                          <TableCell>Λογαριασμός ΔΕΗ Μαΐου</TableCell>
                          <TableCell>ΔΕΗ</TableCell>
                          <TableCell className="font-bold">€320.00</TableCell>
                          <TableCell>
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              Εγκεκριμένο
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              <FileText className="h-4 w-4 mr-1" />
                              Απόδειξη
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>22/05/2024</TableCell>
                          <TableCell>
                            <Badge variant="outline">Εξοπλισμός</Badge>
                          </TableCell>
                          <TableCell>Επισκευή treadmill #3</TableCell>
                          <TableCell>TechnoGym Service</TableCell>
                          <TableCell className="font-bold">€150.00</TableCell>
                          <TableCell>
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              Εγκεκριμένο
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              <FileText className="h-4 w-4 mr-1" />
                              Απόδειξη
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>23/05/2024</TableCell>
                          <TableCell>
                            <Badge variant="outline">Αναλώσιμα</Badge>
                          </TableCell>
                          <TableCell>Καθαριστικά προϊόντα</TableCell>
                          <TableCell>CleanPro</TableCell>
                          <TableCell className="font-bold">€80.00</TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              Εκκρεμεί έγκριση
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                                onClick={() => handleApproveExpense("exp_3")}
                              >
                                Έγκριση
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                                onClick={() => handleRejectExpense("exp_3")}
                              >
                                Απόρριψη
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Inactive Clients Tab */}
              <TabsContent value="inactive" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Ανενεργοί Πελάτες (60+ ημέρες)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Πελάτης</TableHead>
                          <TableHead>Τελευταία Επίσκεψη</TableHead>
                          <TableHead>Κατάσταση</TableHead>
                          <TableHead>Συνεδρίες</TableHead>
                          <TableHead>Πακέτο</TableHead>
                          <TableHead>Ενέργειες</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {inactiveClients.map((client) => (
                          <TableRow key={client.id}>
                            <TableCell className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarFallback>
                                  {client.name.split(" ").map(n => n[0]).join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{client.name}</div>
                                <div className="text-sm text-muted-foreground">{client.email}</div>
                              </div>
                            </TableCell>
                            <TableCell>{client.lastVisit}</TableCell>
                            <TableCell>
                              {getInactivityBadge(client.daysSinceVisit)}
                            </TableCell>
                            <TableCell>
                              <Badge variant={client.remainingSessions > 0 ? "default" : "destructive"}>
                                {client.remainingSessions} απομένουν
                              </Badge>
                            </TableCell>
                            <TableCell>{client.membershipType}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline">
                                  <ExternalLink className="h-4 w-4 mr-1" />
                                  Καλέστε
                                </Button>
                                <Button size="sm" variant="outline">
                                  Email
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

              {/* Debts Tab */}
              <TabsContent value="debts" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Οφειλές Πελατών & Προπονητών</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Όνομα</TableHead>
                          <TableHead>Τύπος</TableHead>
                          <TableHead>Ποσό</TableHead>
                          <TableHead>Περιγραφή</TableHead>
                          <TableHead>Ημ. Λήξης</TableHead>
                          <TableHead>Κατάσταση</TableHead>
                          <TableHead>Ενέργειες</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {outstandingDebts.map((debt) => (
                          <TableRow key={debt.id}>
                            <TableCell className="font-medium">{debt.name}</TableCell>
                            <TableCell>
                              <Badge variant={debt.type === "client" ? "default" : "secondary"}>
                                {debt.type === "client" ? "Πελάτης" : "Προπονητής"}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-bold">€{debt.amount}</TableCell>
                            <TableCell>{debt.description}</TableCell>
                            <TableCell>{debt.dueDate}</TableCell>
                            <TableCell>
                              {getDebtBadge(debt.overdueDays)}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline">
                                  <ExternalLink className="h-4 w-4 mr-1" />
                                  Καλέστε
                                </Button>
                                <Button size="sm" variant="outline">
                                  Υπενθύμιση
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
            </Tabs>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
} 