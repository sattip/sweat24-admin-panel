import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  CreditCard,
  Calendar,
  User,
  AlertCircle,
  Check,
  Clock,
  Search,
  Filter,
  Plus,
  Euro,
  TrendingUp,
  Download,
} from "lucide-react";
import { PaymentInstallmentsModal } from "@/components/PaymentInstallmentsModal";
import { toast } from "sonner";
import { paymentInstallmentsApi } from "@/services/apiService";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminHeader } from "@/components/AdminHeader";

const PaymentsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [installments, setInstallments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPending: 0,
    totalPaid: 0,
    totalOverdue: 0,
    todayCollection: 0,
    monthlyCollection: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch installments
      const response = await paymentInstallmentsApi.getAll();
      const installmentsData = response.data || [];
      setInstallments(installmentsData);
      
      // Calculate stats
      const pending = installmentsData.filter((i: any) => i.status === 'pending');
      const paid = installmentsData.filter((i: any) => i.status === 'paid');
      const overdue = installmentsData.filter((i: any) => i.status === 'overdue');
      const today = new Date().toISOString().split('T')[0];
      const todayPaid = paid.filter((i: any) => i.paidDate?.startsWith(today));
      const thisMonth = new Date().toISOString().slice(0, 7);
      const monthPaid = paid.filter((i: any) => i.paidDate?.startsWith(thisMonth));
      
      setStats({
        totalPending: pending.reduce((sum: number, i: any) => sum + i.amount, 0),
        totalPaid: paid.reduce((sum: number, i: any) => sum + i.amount, 0),
        totalOverdue: overdue.reduce((sum: number, i: any) => sum + i.amount, 0),
        todayCollection: todayPaid.reduce((sum: number, i: any) => sum + i.amount, 0),
        monthlyCollection: monthPaid.reduce((sum: number, i: any) => sum + i.amount, 0),
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Σφάλμα κατά τη φόρτωση δεδομένων');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentRecord = async (installmentId: string) => {
    try {
      await paymentInstallmentsApi.markAsPaid(installmentId, {
        paymentMethod: 'cash',
        paidDate: new Date().toISOString(),
      });
      toast.success('Η πληρωμή καταχωρήθηκε επιτυχώς');
      fetchData();
    } catch (error) {
      toast.error('Σφάλμα κατά την καταχώρηση πληρωμής');
    }
  };

  const filteredInstallments = installments.filter(installment => {
    const matchesSearch = 
      installment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      installment.packageName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || installment.status === statusFilter;
    
    let matchesPeriod = true;
    if (periodFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      matchesPeriod = installment.dueDate.startsWith(today);
    } else if (periodFilter === 'week') {
      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      matchesPeriod = new Date(installment.dueDate) <= weekFromNow;
    } else if (periodFilter === 'month') {
      const monthFromNow = new Date();
      monthFromNow.setMonth(monthFromNow.getMonth() + 1);
      matchesPeriod = new Date(installment.dueDate) <= monthFromNow;
    }
    
    return matchesSearch && matchesStatus && matchesPeriod;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Πληρωμένο</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Εκκρεμεί</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800">Ληξιπρόθεσμο</Badge>;
      default:
        return <Badge>{status}</Badge>;
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
                <h1 className="text-3xl font-bold tracking-tight">Πληρωμές & Δόσεις</h1>
                <p className="text-muted-foreground">
                  Διαχείριση πληρωμών πελατών και δόσεων πακέτων
                </p>
              </div>
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Νέα Δόση
              </Button>
            </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Εκκρεμείς Πληρωμές</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPending.toFixed(2)}€</div>
            <p className="text-xs text-muted-foreground">
              {installments.filter(i => i.status === 'pending').length} δόσεις
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ληξιπρόθεσμες</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.totalOverdue.toFixed(2)}€</div>
            <p className="text-xs text-muted-foreground">
              {installments.filter(i => i.status === 'overdue').length} δόσεις
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Σημερινές Εισπράξεις</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayCollection.toFixed(2)}€</div>
            <p className="text-xs text-muted-foreground">
              από πληρωμές δόσεων
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Μηνιαίες Εισπράξεις</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.monthlyCollection.toFixed(2)}€</div>
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleString('el-GR', { month: 'long' })}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Συνολικές Εισπράξεις</CardTitle>
            <Check className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.totalPaid.toFixed(2)}€</div>
            <p className="text-xs text-muted-foreground">
              {installments.filter(i => i.status === 'paid').length} πληρωμένες
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
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <Label htmlFor="search">Αναζήτηση</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Όνομα πελάτη ή πακέτο..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="status">Κατάσταση</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Όλες</SelectItem>
                  <SelectItem value="pending">Εκκρεμείς</SelectItem>
                  <SelectItem value="paid">Πληρωμένες</SelectItem>
                  <SelectItem value="overdue">Ληξιπρόθεσμες</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="period">Περίοδος</Label>
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger id="period">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Όλες</SelectItem>
                  <SelectItem value="today">Σήμερα</SelectItem>
                  <SelectItem value="week">Αυτή την εβδομάδα</SelectItem>
                  <SelectItem value="month">Αυτόν τον μήνα</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Εξαγωγή
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Installments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Λίστα Δόσεων</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Πελάτης</TableHead>
                <TableHead>Πακέτο</TableHead>
                <TableHead>Δόση</TableHead>
                <TableHead>Ποσό</TableHead>
                <TableHead>Ημ. Λήξης</TableHead>
                <TableHead>Κατάσταση</TableHead>
                <TableHead>Ενέργειες</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Φόρτωση...
                  </TableCell>
                </TableRow>
              ) : filteredInstallments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Δεν βρέθηκαν δόσεις
                  </TableCell>
                </TableRow>
              ) : (
                filteredInstallments.map((installment) => (
                  <TableRow key={installment.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {installment.customerName}
                      </div>
                    </TableCell>
                    <TableCell>{installment.packageName}</TableCell>
                    <TableCell>
                      {installment.installmentNumber}/{installment.totalInstallments}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {installment.amount.toFixed(2)}€
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(installment.dueDate).toLocaleDateString('el-GR')}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(installment.status)}</TableCell>
                    <TableCell>
                      {installment.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => handlePaymentRecord(installment.id)}
                        >
                          <CreditCard className="mr-2 h-4 w-4" />
                          Πληρωμή
                        </Button>
                      )}
                      {installment.status === 'paid' && installment.paidDate && (
                        <span className="text-sm text-muted-foreground">
                          {new Date(installment.paidDate).toLocaleDateString('el-GR')}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

            {/* Payment Modal */}
            <PaymentInstallmentsModal
              isOpen={isModalOpen}
              onClose={() => {
                setIsModalOpen(false);
                setSelectedCustomerId(null);
              }}
              customerId={selectedCustomerId}
              onSuccess={fetchData}
            />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default PaymentsPage;