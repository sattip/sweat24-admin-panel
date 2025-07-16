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
import {
  Euro,
  TrendingUp,
  TrendingDown,
  Plus,
  Minus,
  Calendar,
  Clock,
  User,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
} from "lucide-react";
import { CashRegisterModal } from "@/components/CashRegisterModal";
import { toast } from "sonner";
import { cashRegisterApi } from "@/services/apiService";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminHeader } from "@/components/AdminHeader";
import { useAuth } from "@/contexts/AuthContext";

const CashRegisterPage = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'income' | 'withdrawal'>('income');
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('today');
  const [typeFilter, setTypeFilter] = useState('all');
  const [balance, setBalance] = useState({
    current: 0,
    dailyIncome: 0,
    dailyWithdrawal: 0,
    monthlyIncome: 0,
    monthlyWithdrawal: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await cashRegisterApi.getAll();
      const entriesData = response.data || [];
      setEntries(entriesData);
      
      // Calculate balances
      const today = new Date().toISOString().split('T')[0];
      const thisMonth = new Date().toISOString().slice(0, 7);
      
      let current = 0;
      let dailyIncome = 0;
      let dailyWithdrawal = 0;
      let monthlyIncome = 0;
      let monthlyWithdrawal = 0;
      
      entriesData.forEach((entry: any) => {
        if (entry.type === 'income') {
          current += entry.amount;
          if (entry.timestamp.startsWith(today)) dailyIncome += entry.amount;
          if (entry.timestamp.startsWith(thisMonth)) monthlyIncome += entry.amount;
        } else {
          current -= entry.amount;
          if (entry.timestamp.startsWith(today)) dailyWithdrawal += entry.amount;
          if (entry.timestamp.startsWith(thisMonth)) monthlyWithdrawal += entry.amount;
        }
      });
      
      setBalance({
        current,
        dailyIncome,
        dailyWithdrawal,
        monthlyIncome,
        monthlyWithdrawal,
      });
    } catch (error) {
      console.error('Error fetching cash register:', error);
      toast.error('Σφάλμα κατά τη φόρτωση ταμείου');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (type: 'income' | 'withdrawal') => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const filteredEntries = entries.filter(entry => {
    let matchesType = typeFilter === 'all' || entry.type === typeFilter;
    
    let matchesDate = true;
    const entryDate = new Date(entry.timestamp);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // If user is trainer, only show entries from last 7 days
    if (user?.role === 'trainer') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      matchesDate = entryDate >= weekAgo;
    } else {
      switch (dateFilter) {
        case 'today':
          matchesDate = entryDate.toDateString() === today.toDateString();
          break;
        case 'week':
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          matchesDate = entryDate >= weekAgo;
          break;
        case 'month':
          matchesDate = entryDate.getMonth() === today.getMonth() && 
                       entryDate.getFullYear() === today.getFullYear();
          break;
      }
    }
    
    return matchesType && matchesDate;
  });

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      'package_payment': 'Πληρωμή Πακέτου',
      'personal_training': 'Personal Training',
      'product_sale': 'Πώληση Προϊόντος',
      'membership': 'Συνδρομή',
      'expense': 'Έξοδο',
      'salary': 'Μισθός',
      'utilities': 'Λογαριασμοί',
      'other': 'Άλλο',
    };
    return labels[category] || category;
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
                <h1 className="text-3xl font-bold tracking-tight">Ταμείο</h1>
                <p className="text-muted-foreground">
                  {user?.role === 'trainer' 
                    ? 'Προβολή κινήσεων τελευταίας εβδομάδας'
                    : 'Διαχείριση εσόδων και εξόδων σε πραγματικό χρόνο'}
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleOpenModal('income')} variant="default">
                  <Plus className="mr-2 h-4 w-4" />
                  Νέο Έσοδο
                </Button>
                <Button onClick={() => handleOpenModal('withdrawal')} variant="outline">
                  <Minus className="mr-2 h-4 w-4" />
                  Νέο Έξοδο
                </Button>
              </div>
            </div>

      {/* Balance Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Τρέχον Υπόλοιπο</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance.current >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {balance.current.toFixed(2)}€
            </div>
            <p className="text-xs text-muted-foreground">
              Συνολικό υπόλοιπο ταμείου
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Σημερινά Έσοδα</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +{balance.dailyIncome.toFixed(2)}€
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString('el-GR')}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Σημερινά Έξοδα</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              -{balance.dailyWithdrawal.toFixed(2)}€
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString('el-GR')}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Μηνιαία Έσοδα</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +{balance.monthlyIncome.toFixed(2)}€
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleString('el-GR', { month: 'long' })}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Μηνιαία Έξοδα</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              -{balance.monthlyWithdrawal.toFixed(2)}€
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleString('el-GR', { month: 'long' })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters - Only show date filter for admin */}
      {user?.role === 'admin' && (
        <Card>
          <CardHeader>
            <CardTitle>Φίλτρα</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="dateFilter">Περίοδος</Label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger id="dateFilter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Σήμερα</SelectItem>
                    <SelectItem value="week">Τελευταία εβδομάδα</SelectItem>
                    <SelectItem value="month">Τρέχων μήνας</SelectItem>
                    <SelectItem value="all">Όλες</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="typeFilter">Τύπος</Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger id="typeFilter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Όλα</SelectItem>
                    <SelectItem value="income">Έσοδα</SelectItem>
                    <SelectItem value="withdrawal">Έξοδα</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* For trainers, show only type filter */}
      {user?.role === 'trainer' && (
        <Card>
          <CardHeader>
            <CardTitle>Φίλτρα</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-w-sm">
              <Label htmlFor="typeFilter">Τύπος</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger id="typeFilter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Όλα</SelectItem>
                  <SelectItem value="income">Έσοδα</SelectItem>
                  <SelectItem value="withdrawal">Έξοδα</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Entries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Κινήσεις Ταμείου</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ημερομηνία/Ώρα</TableHead>
                <TableHead>Τύπος</TableHead>
                <TableHead>Κατηγορία</TableHead>
                <TableHead>Περιγραφή</TableHead>
                <TableHead>Τρόπος Πληρωμής</TableHead>
                <TableHead className="text-right">Ποσό</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Φόρτωση...
                  </TableCell>
                </TableRow>
              ) : filteredEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Δεν βρέθηκαν κινήσεις
                  </TableCell>
                </TableRow>
              ) : (
                filteredEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {new Date(entry.timestamp).toLocaleDateString('el-GR')}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(entry.timestamp).toLocaleTimeString('el-GR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {entry.type === 'income' ? (
                        <Badge className="bg-green-100 text-green-800">
                          <ArrowUpRight className="mr-1 h-3 w-3" />
                          Έσοδο
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">
                          <ArrowDownRight className="mr-1 h-3 w-3" />
                          Έξοδο
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{getCategoryLabel(entry.category)}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{entry.description}</div>
                        {entry.relatedEntityType === 'customer' && (
                          <div className="text-sm text-muted-foreground">
                            <User className="inline h-3 w-3 mr-1" />
                            Πελάτης
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {entry.paymentMethod === 'cash' && 'Μετρητά'}
                        {entry.paymentMethod === 'card' && 'Κάρτα'}
                        {entry.paymentMethod === 'transfer' && 'Μεταφορά'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      <span className={entry.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                        {entry.type === 'income' ? '+' : '-'}{entry.amount.toFixed(2)}€
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

            {/* Cash Register Modal */}
            <CashRegisterModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              type={modalType}
              onSuccess={fetchData}
            />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default CashRegisterPage;