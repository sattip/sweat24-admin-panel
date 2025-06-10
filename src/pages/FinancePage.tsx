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
import {
  Euro,
  TrendingUp,
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
} from "lucide-react";
import { format } from "date-fns";
import { el } from "date-fns/locale";

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
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="revenue">Έσοδα</TabsTrigger>
                <TabsTrigger value="sessions">Συνεδρίες</TabsTrigger>
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