import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, CreditCard, Plus, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { paymentInstallmentsApi, usersApi, packagesApi } from "@/services/api";
import type { PaymentInstallment, User, Package } from "@/data/mockData";
import { format } from "date-fns";
import { el } from "date-fns/locale";

interface PaymentInstallmentsModalProps {
  customerId?: string;
  onUpdate?: () => void;
}

export function PaymentInstallmentsModal({ customerId, onUpdate }: PaymentInstallmentsModalProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [installments, setInstallments] = useState<PaymentInstallment[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerId: customerId || '',
    packageId: '',
    totalAmount: '',
    installmentCount: '1',
    firstDueDate: format(new Date(), 'yyyy-MM-dd'),
    paymentMethod: 'cash' as 'cash' | 'card' | 'transfer',
    notes: ''
  });

  // Fetch data when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [installmentsData, customersData, packagesData] = await Promise.all([
        paymentInstallmentsApi.getAll(customerId ? { customer: customerId } : undefined),
        usersApi.getAll(),
        packagesApi.getAll()
      ]);
      
      // Handle response data
      setInstallments(Array.isArray(installmentsData) ? installmentsData : (installmentsData.data || []));
      setCustomers(Array.isArray(customersData) ? customersData : (customersData.data || []));
      setPackages(Array.isArray(packagesData) ? packagesData : (packagesData.data || []));
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Σφάλμα",
        description: "Αποτυχία φόρτωσης δεδομένων.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredInstallments = customerId 
    ? installments.filter(inst => inst.customerId === customerId)
    : installments;

  const getCustomerName = (id: string) => {
    const customer = customers.find(c => c.id === id);
    return customer?.name || 'Άγνωστος';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="default" className="bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Πληρωμένη
        </Badge>;
      case 'pending':
        return <Badge variant="secondary">
          <Clock className="h-3 w-3 mr-1" />
          Εκκρεμεί
        </Badge>;
      case 'overdue':
        return <Badge variant="destructive">
          <AlertCircle className="h-3 w-3 mr-1" />
          Καθυστέρηση
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleCreateInstallments = async () => {
    if (!formData.customerId || !formData.packageId || !formData.totalAmount) {
      toast({
        title: "Σφάλμα",
        description: "Παρακαλώ συμπληρώστε όλα τα απαραίτητα πεδία.",
        variant: "destructive"
      });
      return;
    }

    const totalAmount = parseFloat(formData.totalAmount);
    const installmentCount = parseInt(formData.installmentCount);
    const installmentAmount = totalAmount / installmentCount;

    if (isNaN(totalAmount) || totalAmount <= 0) {
      toast({
        title: "Σφάλμα",
        description: "Το συνολικό ποσό πρέπει να είναι έγκυρος θετικός αριθμός.",
        variant: "destructive"
      });
      return;
    }

    const customer = customers.find(c => c.id === formData.customerId);
    const selectedPackage = packages.find(p => p.id === formData.packageId);
    if (!customer || !selectedPackage) return;

    try {
      setIsLoading(true);
      const firstDueDate = new Date(formData.firstDueDate);
      
      // Create installments via API calls
      const promises = [];
      for (let i = 0; i < installmentCount; i++) {
        const dueDate = new Date(firstDueDate);
        dueDate.setMonth(dueDate.getMonth() + i);

        const installmentData = {
          customerId: formData.customerId,
          customerName: customer.name,
          packageId: formData.packageId,
          packageName: selectedPackage.name,
          installmentNumber: i + 1,
          totalInstallments: installmentCount,
          amount: Math.round(installmentAmount * 100) / 100,
          dueDate: format(dueDate, 'yyyy-MM-dd'),
          status: 'pending' as const,
          notes: formData.notes
        };
        
        promises.push(paymentInstallmentsApi.create(installmentData));
      }
      
      await Promise.all(promises);
      
      toast({
        title: "Δόσεις Δημιουργήθηκαν",
        description: `Δημιουργήθηκαν ${installmentCount} δόσεις για τον ${customer.name}.`
      });
      
      // Reset form
      setFormData({
        customerId: customerId || '',
        packageId: '',
        totalAmount: '',
        installmentCount: '1',
        firstDueDate: format(new Date(), 'yyyy-MM-dd'),
        paymentMethod: 'cash',
        notes: ''
      });
      
      // Refresh data
      await fetchData();
      if (onUpdate) onUpdate();
      
      setIsOpen(false);
    } catch (error) {
      console.error('Error creating installments:', error);
      toast({
        title: "Σφάλμα",
        description: "Αποτυχία δημιουργίας δόσεων.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayInstallment = async (installmentId: string, paymentMethod: 'cash' | 'card' | 'transfer') => {
    const installment = installments.find(inst => inst.id === installmentId);
    if (!installment) return;

    try {
      setIsLoading(true);
      
      // Update installment via API
      await paymentInstallmentsApi.update(installmentId, {
        status: 'paid' as const,
        paidDate: format(new Date(), 'yyyy-MM-dd'),
        paymentMethod: paymentMethod
      });
      
      toast({
        title: "Πληρωμή Καταγράφηκε ✓",
        description: `Η δόση των €${installment.amount} καταγράφηκε επιτυχώς.`
      });
      
      // Refresh data
      await fetchData();
      if (onUpdate) onUpdate();
      
    } catch (error) {
      console.error('Error updating installment:', error);
      toast({
        title: "Σφάλμα",
        description: "Αποτυχία καταγραφής πληρωμής.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const overdueSummary = filteredInstallments.filter(inst => inst.status === 'overdue');
  const pendingSummary = filteredInstallments.filter(inst => inst.status === 'pending');
  const totalPending = pendingSummary.reduce((sum, inst) => sum + inst.amount, 0);
  
  const hasAccess = customerId ? customers.find(c => c.id === customerId)?.status === 'active' : false;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <CreditCard className="h-4 w-4 mr-2" />
          Διαχείριση Δόσεων
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle>Διαχείριση Δόσεων Πληρωμής</DialogTitle>
          <DialogDescription>
            Δημιουργία δόσεων για πελάτες και καταγραφή πληρωμών όταν πληρώνουν
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6">
          {/* Summary Cards */}
          {customerId && (
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Εκκρεμείς Δόσεις</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingSummary.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Σύνολο: €{totalPending.toFixed(2)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Καθυστερημένες</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{overdueSummary.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Απαιτείται επικοινωνία
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Πρόσβαση Τιμοκαταλόγου</CardTitle>
                </CardHeader>
                <CardContent>
                  {hasAccess ? (
                    <div className="text-2xl font-bold text-green-600">✓</div>
                  ) : (
                    <div className="text-2xl font-bold text-gray-400">✗</div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Κατάσταση πρόσβασης
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Form για νέες δόσεις */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 text-blue-700">📝 Δημιουργία Νέων Δόσεων</h3>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                {!customerId && (
                  <div>
                    <Label>Πελάτης</Label>
                    <Select value={formData.customerId} onValueChange={(value) => setFormData(prev => ({...prev, customerId: value}))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Επιλογή πελάτη" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map(customer => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div>
                  <Label>Πακέτο</Label>
                  <Select 
                    value={formData.packageId} 
                    onValueChange={(value) => {
                      const selectedPackage = packages.find(p => p.id === value);
                      setFormData(prev => ({
                        ...prev, 
                        packageId: value,
                        totalAmount: selectedPackage ? selectedPackage.price.toString() : ''
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Επιλογή πακέτου" />
                    </SelectTrigger>
                    <SelectContent>
                      {packages.map(pkg => (
                        <SelectItem key={pkg.id} value={pkg.id}>
                          <div className="flex justify-between items-center w-full">
                            <span>{pkg.name}</span>
                            <span className="ml-2 text-muted-foreground">€{pkg.price}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Συνολικό Ποσό (€)</Label>
                  <Input
                    type="number"
                    value={formData.totalAmount}
                    onChange={(e) => setFormData(prev => ({...prev, totalAmount: e.target.value}))}
                    placeholder="600"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <Label>Αριθμός Δόσεων</Label>
                  <Select value={formData.installmentCount} onValueChange={(value) => setFormData(prev => ({...prev, installmentCount: value}))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 δόση</SelectItem>
                      <SelectItem value="2">2 δόσεις</SelectItem>
                      <SelectItem value="3">3 δόσεις</SelectItem>
                      <SelectItem value="6">6 δόσεις</SelectItem>
                      <SelectItem value="12">12 δόσεις</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Πρώτη Προθεσμία</Label>
                  <Input
                    type="date"
                    value={formData.firstDueDate}
                    onChange={(e) => setFormData(prev => ({...prev, firstDueDate: e.target.value}))}
                  />
                </div>
              </div>
              <div>
                <Label>Σημειώσεις</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({...prev, notes: e.target.value}))}
                  placeholder="Προαιρετικές σημειώσεις..."
                  rows={2}
                />
              </div>
              <Button onClick={handleCreateInstallments} className="w-fit" disabled={isLoading}>
                <Plus className="h-4 w-4 mr-2" />
                {isLoading ? 'Περιμένετε...' : 'Δημιουργία Δόσεων'}
              </Button>
            </div>
          </div>

          {/* Πίνακας δόσεων */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-green-700">💰 Καταγραφή Πληρωμών</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  {!customerId && <TableHead>Πελάτης</TableHead>}
                  <TableHead>Πακέτο</TableHead>
                  <TableHead>Δόση</TableHead>
                  <TableHead>Ποσό</TableHead>
                  <TableHead>Προθεσμία</TableHead>
                  <TableHead>Κατάσταση</TableHead>
                  <TableHead>Ενέργειες</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInstallments.slice(0, 10).map((installment) => (
                  <TableRow key={installment.id}>
                    {!customerId && (
                      <TableCell className="font-medium">
                        {installment.customerName}
                      </TableCell>
                    )}
                    <TableCell>{installment.packageName}</TableCell>
                    <TableCell>
                      {installment.installmentNumber}/{installment.totalInstallments}
                    </TableCell>
                    <TableCell>€{installment.amount}</TableCell>
                    <TableCell>
                      {format(new Date(installment.dueDate), 'dd/MM/yyyy', { locale: el })}
                    </TableCell>
                    <TableCell>{getStatusBadge(installment.status)}</TableCell>
                    <TableCell>
                      {installment.status === 'pending' || installment.status === 'overdue' ? (
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePayInstallment(installment.id, 'cash')}
                            className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                            disabled={isLoading}
                          >
                            💵 ΠΛΗΡΩΣΗ Μετρητά
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePayInstallment(installment.id, 'card')}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                            disabled={isLoading}
                          >
                            💳 ΠΛΗΡΩΣΗ Κάρτα
                          </Button>
                        </div>
                      ) : (
                        installment.paidDate && (
                          <div className="text-sm text-muted-foreground">
                            Πληρώθηκε: {format(new Date(installment.paidDate), 'dd/MM/yyyy', { locale: el })}
                          </div>
                        )
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}