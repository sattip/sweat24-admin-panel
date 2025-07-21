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
  FileText,
  Calendar,
  Receipt,
  Check,
  X,
  Clock,
  TrendingUp,
  PieChart,
  Plus,
  Filter,
  Download,
} from "lucide-react";
import { BusinessExpenseModal } from "@/components/BusinessExpenseModal";
import { toast } from "sonner";
import { businessExpensesApi } from "@/services/apiService";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminHeader } from "@/components/AdminHeader";

const ExpensesPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("month");
  const [stats, setStats] = useState({
    totalExpenses: 0,
    monthlyExpenses: 0,
    pendingApproval: 0,
    categoriesBreakdown: {} as { [key: string]: number },
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await businessExpensesApi.getAll();
      const expensesData = response.data || [];
      setExpenses(expensesData);
      
      // Calculate stats
      const thisMonth = new Date().toISOString().slice(0, 7);
      const monthlyExpenses = expensesData.filter((e: any) => 
        e.date.startsWith(thisMonth) && e.approved
      );
      const pendingExpenses = expensesData.filter((e: any) => !e.approved);
      
      // Category breakdown
      const categoriesBreakdown: { [key: string]: number } = {};
      expensesData.forEach((expense: any) => {
        if (expense.approved) {
          categoriesBreakdown[expense.category] = 
            (categoriesBreakdown[expense.category] || 0) + expense.amount;
        }
      });
      
      setStats({
        totalExpenses: expensesData
          .filter((e: any) => e.approved)
          .reduce((sum: number, e: any) => sum + e.amount, 0),
        monthlyExpenses: monthlyExpenses
          .reduce((sum: number, e: any) => sum + e.amount, 0),
        pendingApproval: pendingExpenses.length,
        categoriesBreakdown,
      });
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast.error('Σφάλμα κατά τη φόρτωση εξόδων');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveExpense = async (expenseId: string) => {
    try {
      await businessExpensesApi.update(expenseId, { approved: true });
      toast.success('Το έξοδο εγκρίθηκε επιτυχώς');
      fetchData();
    } catch (error) {
      toast.error('Σφάλμα κατά την έγκριση');
    }
  };

  const handleRejectExpense = async (expenseId: string) => {
    if (!confirm('Είστε σίγουροι ότι θέλετε να απορρίψετε αυτό το έξοδο;')) return;
    
    try {
      await businessExpensesApi.delete(expenseId);
      toast.success('Το έξοδο απορρίφθηκε');
      fetchData();
    } catch (error) {
      toast.error('Σφάλμα κατά την απόρριψη');
    }
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = 
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (expense.vendor && expense.vendor.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'approved' && expense.approved) ||
      (statusFilter === 'pending' && !expense.approved);
    
    let matchesDate = true;
    const expenseDate = new Date(expense.date);
    const today = new Date();
    
    switch (dateFilter) {
      case 'today':
        matchesDate = expenseDate.toDateString() === today.toDateString();
        break;
      case 'week': {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        matchesDate = expenseDate >= weekAgo;
        break;
      }
      case 'month':
        matchesDate = expenseDate.getMonth() === today.getMonth() && 
                     expenseDate.getFullYear() === today.getFullYear();
        break;
    }
    
    return matchesSearch && matchesCategory && matchesStatus && matchesDate;
  });

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      'utilities': 'Λογαριασμοί',
      'equipment': 'Εξοπλισμός',
      'maintenance': 'Συντήρηση',
      'supplies': 'Αναλώσιμα',
      'marketing': 'Marketing',
      'other': 'Άλλο',
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'utilities': 'bg-blue-100 text-blue-800',
      'equipment': 'bg-purple-100 text-purple-800',
      'maintenance': 'bg-orange-100 text-orange-800',
      'supplies': 'bg-green-100 text-green-800',
      'marketing': 'bg-pink-100 text-pink-800',
      'other': 'bg-gray-100 text-gray-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
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
                <h1 className="text-3xl font-bold tracking-tight">Έξοδα Επιχείρησης</h1>
                <p className="text-muted-foreground">
                  Διαχείριση και παρακολούθηση επιχειρηματικών εξόδων
                </p>
              </div>
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Νέο Έξοδο
              </Button>
            </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Συνολικά Έξοδα</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalExpenses.toFixed(2)}€</div>
            <p className="text-xs text-muted-foreground">
              Εγκεκριμένα έξοδα
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Μηνιαία Έξοδα</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.monthlyExpenses.toFixed(2)}€</div>
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleString('el-GR', { month: 'long' })}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Προς Έγκριση</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApproval}</div>
            <p className="text-xs text-muted-foreground">
              Έξοδα σε αναμονή
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Κατηγορίες</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(stats.categoriesBreakdown).length}</div>
            <p className="text-xs text-muted-foreground">
              Ενεργές κατηγορίες
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Ανάλυση ανά Κατηγορία</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {Object.entries(stats.categoriesBreakdown).map(([category, amount]) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className={getCategoryColor(category)}>
                    {getCategoryLabel(category)}
                  </Badge>
                </div>
                <span className="font-semibold">{amount.toFixed(2)}€</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Φίλτρα</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <Label htmlFor="search">Αναζήτηση</Label>
              <Input
                id="search"
                placeholder="Περιγραφή ή προμηθευτής..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="category">Κατηγορία</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Όλες</SelectItem>
                  <SelectItem value="utilities">Λογαριασμοί</SelectItem>
                  <SelectItem value="equipment">Εξοπλισμός</SelectItem>
                  <SelectItem value="maintenance">Συντήρηση</SelectItem>
                  <SelectItem value="supplies">Αναλώσιμα</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="other">Άλλο</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="status">Κατάσταση</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Όλες</SelectItem>
                  <SelectItem value="approved">Εγκεκριμένα</SelectItem>
                  <SelectItem value="pending">Προς έγκριση</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="period">Περίοδος</Label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger id="period">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Σήμερα</SelectItem>
                  <SelectItem value="week">Εβδομάδα</SelectItem>
                  <SelectItem value="month">Μήνας</SelectItem>
                  <SelectItem value="all">Όλα</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Λίστα Εξόδων</CardTitle>
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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Φόρτωση...
                  </TableCell>
                </TableRow>
              ) : filteredExpenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Δεν βρέθηκαν έξοδα
                  </TableCell>
                </TableRow>
              ) : (
                filteredExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(expense.date).toLocaleDateString('el-GR')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getCategoryColor(expense.category)}>
                        {getCategoryLabel(expense.category)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{expense.description}</div>
                        {expense.notes && (
                          <div className="text-sm text-muted-foreground">{expense.notes}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{expense.vendor || '-'}</TableCell>
                    <TableCell className="font-semibold">
                      {expense.amount.toFixed(2)}€
                    </TableCell>
                    <TableCell>
                      {expense.approved ? (
                        <Badge className="bg-green-100 text-green-800">
                          <Check className="mr-1 h-3 w-3" />
                          Εγκεκριμένο
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Clock className="mr-1 h-3 w-3" />
                          Προς έγκριση
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {!expense.approved && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApproveExpense(expense.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectExpense(expense.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                      {expense.receipt && (
                        <Button size="sm" variant="outline">
                          <Receipt className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

            {/* Expense Modal */}
            <BusinessExpenseModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onSuccess={fetchData}
            />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ExpensesPage;