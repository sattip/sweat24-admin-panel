import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  Euro,
  Users,
  Package,
  FileText,
  Download,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  AlertCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminHeader } from "@/components/AdminHeader";

const ReportsPage = () => {
  const [timeRange, setTimeRange] = useState("month");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    revenue: {
      total: 0,
      growth: 0,
      chart: [] as any[],
    },
    expenses: {
      total: 0,
      growth: 0,
      byCategory: [] as any[],
    },
    customers: {
      active: 0,
      inactive: 0,
      new: 0,
      chart: [] as any[],
    },
    packages: {
      topSelling: [] as any[],
      revenue: [] as any[],
    },
    sessions: {
      total: 0,
      revenue: 0,
      avgRevenue: 0,
      chart: [] as any[],
    },
    debts: {
      total: 0,
      overdue: 0,
      list: [] as any[],
    },
  });

  useEffect(() => {
    generateMockData();
  }, [timeRange]);

  const generateMockData = () => {
    setLoading(true);
    
    // Mock data generation based on time range
    const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365;
    
    // Revenue chart data
    const revenueChart = [];
    const sessionChart = [];
    const customerChart = [];
    
    for (let i = days; i > 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('el-GR', { 
        day: '2-digit', 
        month: timeRange === 'year' ? 'short' : '2-digit' 
      });
      
      revenueChart.push({
        date: dateStr,
        έσοδα: Math.floor(Math.random() * 1000) + 500,
        έξοδα: Math.floor(Math.random() * 500) + 200,
      });
      
      sessionChart.push({
        date: dateStr,
        συνεδρίες: Math.floor(Math.random() * 20) + 10,
        έσοδα: Math.floor(Math.random() * 800) + 400,
      });
      
      if (i % 7 === 0) { // Weekly customer data
        customerChart.push({
          εβδομάδα: `Εβδ. ${Math.ceil(i / 7)}`,
          νέοι: Math.floor(Math.random() * 10) + 5,
          ανενεργοί: Math.floor(Math.random() * 5) + 1,
        });
      }
    }
    
    // Expense categories
    const expenseCategories = [
      { name: 'Λογαριασμοί', value: 2500, color: '#3B82F6' },
      { name: 'Μισθοί', value: 8000, color: '#10B981' },
      { name: 'Εξοπλισμός', value: 1500, color: '#8B5CF6' },
      { name: 'Συντήρηση', value: 800, color: '#F59E0B' },
      { name: 'Marketing', value: 1200, color: '#EF4444' },
      { name: 'Άλλα', value: 500, color: '#6B7280' },
    ];
    
    // Top packages
    const topPackages = [
      { name: 'Personal Training - 12 Συνεδρίες', sales: 45, revenue: 13500 },
      { name: 'Group Fitness Pass - 1 Μήνας', sales: 120, revenue: 9600 },
      { name: 'Premium Membership 6 μήνες', sales: 30, revenue: 9000 },
      { name: 'Yoga & Pilates - 10 Συνεδρίες', sales: 60, revenue: 9000 },
      { name: 'Basic Membership 1 μήνας', sales: 150, revenue: 7500 },
    ];
    
    // Outstanding debts
    const debts = [
      { customer: 'Γιάννης Παπαδόπουλος', amount: 150, daysOverdue: 15 },
      { customer: 'Μαρία Κωνσταντίνου', amount: 80, daysOverdue: 7 },
      { customer: 'Κώστας Δημητρίου', amount: 200, daysOverdue: 30 },
      { customer: 'Ελένη Γεωργίου', amount: 100, daysOverdue: 5 },
      { customer: 'Νίκος Αντωνίου', amount: 300, daysOverdue: 45 },
    ];
    
    setData({
      revenue: {
        total: revenueChart.reduce((sum, d) => sum + d.έσοδα, 0),
        growth: 12.5,
        chart: revenueChart,
      },
      expenses: {
        total: expenseCategories.reduce((sum, c) => sum + c.value, 0),
        growth: -5.2,
        byCategory: expenseCategories,
      },
      customers: {
        active: 285,
        inactive: 45,
        new: customerChart.reduce((sum, d) => sum + d.νέοι, 0),
        chart: customerChart,
      },
      packages: {
        topSelling: topPackages,
        revenue: topPackages.map(p => ({ name: p.name, value: p.revenue })),
      },
      sessions: {
        total: sessionChart.reduce((sum, d) => sum + d.συνεδρίες, 0),
        revenue: sessionChart.reduce((sum, d) => sum + d.έσοδα, 0),
        avgRevenue: sessionChart.reduce((sum, d) => sum + d.έσοδα, 0) / sessionChart.reduce((sum, d) => sum + d.συνεδρίες, 0),
        chart: sessionChart,
      },
      debts: {
        total: debts.reduce((sum, d) => sum + d.amount, 0),
        overdue: debts.filter(d => d.daysOverdue > 14).length,
        list: debts,
      },
    });
    
    setTimeout(() => setLoading(false), 500);
  };

  const exportReport = (type: string) => {
    toast.success(`Εξαγωγή αναφοράς ${type} ξεκίνησε`);
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
                <h1 className="text-3xl font-bold tracking-tight">Οικονομικές Αναφορές</h1>
                <p className="text-muted-foreground">
                  Αναλυτικές αναφορές και στατιστικά στοιχεία
                </p>
              </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Εβδομάδα</SelectItem>
              <SelectItem value="month">Μήνας</SelectItem>
              <SelectItem value="year">Έτος</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => exportReport('PDF')}>
            <Download className="mr-2 h-4 w-4" />
            PDF
          </Button>
          <Button variant="outline" onClick={() => exportReport('Excel')}>
            <Download className="mr-2 h-4 w-4" />
            Excel
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Συνολικά Έσοδα</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.revenue.total.toFixed(2)}€</div>
            <p className="text-xs text-green-600">
              +{data.revenue.growth}% από προηγούμενη περίοδο
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Συνολικά Έξοδα</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.expenses.total.toFixed(2)}€</div>
            <p className="text-xs text-red-600">
              {data.expenses.growth}% από προηγούμενη περίοδο
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Καθαρό Κέρδος</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(data.revenue.total - data.expenses.total).toFixed(2)}€
            </div>
            <p className="text-xs text-muted-foreground">
              Περιθώριο: {((data.revenue.total - data.expenses.total) / data.revenue.total * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Οφειλές</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.debts.total.toFixed(2)}€</div>
            <p className="text-xs text-yellow-600">
              {data.debts.overdue} ληξιπρόθεσμες οφειλές
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Reports Tabs */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="revenue">Έσοδα</TabsTrigger>
          <TabsTrigger value="expenses">Έξοδα</TabsTrigger>
          <TabsTrigger value="customers">Πελάτες</TabsTrigger>
          <TabsTrigger value="packages">Πακέτα</TabsTrigger>
          <TabsTrigger value="sessions">Συνεδρίες</TabsTrigger>
        </TabsList>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Έσοδα vs Έξοδα</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={data.revenue.chart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="έσοδα" 
                    stroke="#10B981" 
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="έξοδα" 
                    stroke="#EF4444" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Κατανομή Εξόδων</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <RechartsPieChart>
                  <Pie
                    data={data.expenses.byCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.expenses.byCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Ενεργοί Πελάτες</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.customers.active}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Ανενεργοί</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{data.customers.inactive}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Νέοι Πελάτες</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">+{data.customers.new}</div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Νέοι vs Ανενεργοί Πελάτες</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.customers.chart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="εβδομάδα" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="νέοι" fill="#10B981" />
                  <Bar dataKey="ανενεργοί" fill="#EF4444" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Packages Tab */}
        <TabsContent value="packages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Πακέτα</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.packages.topSelling.map((pkg, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{pkg.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {pkg.sales} πωλήσεις
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{pkg.revenue.toFixed(2)}€</div>
                      <div className="text-sm text-muted-foreground">
                        {(pkg.revenue / pkg.sales).toFixed(2)}€ μ.ο.
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Συνολικές Συνεδρίες</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.sessions.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Έσοδα Συνεδριών</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.sessions.revenue.toFixed(2)}€</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Μ.Ο. ανά Συνεδρία</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.sessions.avgRevenue.toFixed(2)}€</div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Συνεδρίες & Έσοδα</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.sessions.chart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="συνεδρίες" fill="#3B82F6" />
                  <Bar yAxisId="right" dataKey="έσοδα" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Outstanding Debts */}
      <Card>
        <CardHeader>
          <CardTitle>Ληξιπρόθεσμες Οφειλές</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.debts.list.map((debt, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted">
                <div>
                  <div className="font-medium">{debt.customer}</div>
                  <div className="text-sm text-muted-foreground">
                    Καθυστέρηση: {debt.daysOverdue} ημέρες
                  </div>
                </div>
                <div className="font-semibold text-red-600">
                  {debt.amount.toFixed(2)}€
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ReportsPage;