import React, { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminHeader } from "@/components/AdminHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Plus,
  Edit,
  Trash2,
  Clock,
  RefreshCw,
  AlertCircle,
  Settings,
} from "lucide-react";
import { toast } from "sonner";

const CancellationPoliciesPage = () => {
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    hours_before: 24,
    penalty_percentage: 0,
    allow_reschedule: true,
    reschedule_hours_before: 12,
    max_reschedules_per_month: 3,
    priority: 1,
    applicable_to: {
      class_types: [] as string[],
      package_ids: [] as number[],
    },
  });

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      // Mock data for now
      const mockPolicies = [
        {
          id: 1,
          name: "Βασική Πολιτική Ακύρωσης",
          description: "Ακύρωση χωρίς χρέωση έως 24 ώρες πριν το μάθημα.",
          hours_before: 24,
          penalty_percentage: 50,
          allow_reschedule: true,
          reschedule_hours_before: 12,
          max_reschedules_per_month: 3,
          is_active: true,
          priority: 1,
          applicable_to: { class_types: ["group"] },
        },
        {
          id: 2,
          name: "Πολιτική Personal Training",
          description: "Ακύρωση χωρίς χρέωση έως 48 ώρες πριν τη συνεδρία.",
          hours_before: 48,
          penalty_percentage: 100,
          allow_reschedule: true,
          reschedule_hours_before: 24,
          max_reschedules_per_month: 2,
          is_active: true,
          priority: 2,
          applicable_to: { class_types: ["personal"] },
        },
      ];
      setPolicies(mockPolicies);
    } catch (error) {
      toast.error("Σφάλμα κατά τη φόρτωση πολιτικών");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (policy?: any) => {
    if (policy) {
      setEditingPolicy(policy);
      setFormData({
        name: policy.name,
        description: policy.description,
        hours_before: policy.hours_before,
        penalty_percentage: policy.penalty_percentage,
        allow_reschedule: policy.allow_reschedule,
        reschedule_hours_before: policy.reschedule_hours_before,
        max_reschedules_per_month: policy.max_reschedules_per_month,
        priority: policy.priority,
        applicable_to: policy.applicable_to || { class_types: [], package_ids: [] },
      });
    } else {
      setEditingPolicy(null);
      setFormData({
        name: "",
        description: "",
        hours_before: 24,
        penalty_percentage: 0,
        allow_reschedule: true,
        reschedule_hours_before: 12,
        max_reschedules_per_month: 3,
        priority: 1,
        applicable_to: { class_types: [], package_ids: [] },
      });
    }
    setModalOpen(true);
  };

  const handleSavePolicy = async () => {
    try {
      if (editingPolicy) {
        toast.success("Η πολιτική ενημερώθηκε επιτυχώς");
      } else {
        toast.success("Η πολιτική δημιουργήθηκε επιτυχώς");
      }
      setModalOpen(false);
      fetchPolicies();
    } catch (error) {
      toast.error("Σφάλμα κατά την αποθήκευση");
    }
  };

  const handleDeletePolicy = async (id: number) => {
    if (confirm("Είστε σίγουροι ότι θέλετε να διαγράψετε αυτή την πολιτική;")) {
      try {
        toast.success("Η πολιτική διαγράφηκε επιτυχώς");
        fetchPolicies();
      } catch (error) {
        toast.error("Σφάλμα κατά τη διαγραφή");
      }
    }
  };

  const getApplicableToText = (applicable_to: any) => {
    if (!applicable_to) return "Όλα";
    const parts = [];
    if (applicable_to.class_types?.length > 0) {
      parts.push(`Τύποι: ${applicable_to.class_types.join(", ")}`);
    }
    if (applicable_to.package_ids?.length > 0) {
      parts.push(`Πακέτα: ${applicable_to.package_ids.join(", ")}`);
    }
    return parts.length > 0 ? parts.join(" | ") : "Όλα";
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
          <h1 className="text-3xl font-bold tracking-tight">Πολιτικές Ακύρωσης & Μετάθεσης</h1>
          <p className="text-muted-foreground">
            Διαχείριση κανόνων ακύρωσης και μετάθεσης μαθημάτων
          </p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="mr-2 h-4 w-4" />
          Νέα Πολιτική
        </Button>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ενεργές Πολιτικές</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{policies.filter(p => p.is_active).length}</div>
            <p className="text-xs text-muted-foreground">από {policies.length} συνολικά</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Μέσος Χρόνος Ακύρωσης</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {policies.length > 0 
                ? Math.round(policies.reduce((sum, p) => sum + p.hours_before, 0) / policies.length)
                : 0
              } ώρες
            </div>
            <p className="text-xs text-muted-foreground">πριν το μάθημα</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Μέγιστες Μεταθέσεις</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {policies.length > 0 
                ? Math.max(...policies.map(p => p.max_reschedules_per_month))
                : 0
              }
            </div>
            <p className="text-xs text-muted-foreground">ανά μήνα</p>
          </CardContent>
        </Card>
      </div>

      {/* Policies Table */}
      <Card>
        <CardHeader>
          <CardTitle>Λίστα Πολιτικών</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Όνομα</TableHead>
                <TableHead>Ώρες Πριν</TableHead>
                <TableHead>Χρέωση %</TableHead>
                <TableHead>Μεταθέσεις</TableHead>
                <TableHead>Εφαρμόζεται σε</TableHead>
                <TableHead>Προτεραιότητα</TableHead>
                <TableHead>Κατάσταση</TableHead>
                <TableHead>Ενέργειες</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Φόρτωση...
                  </TableCell>
                </TableRow>
              ) : policies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Δεν υπάρχουν πολιτικές
                  </TableCell>
                </TableRow>
              ) : (
                policies.map((policy) => (
                  <TableRow key={policy.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{policy.name}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {policy.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {policy.hours_before}ω
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={policy.penalty_percentage > 0 ? "destructive" : "secondary"}>
                        {policy.penalty_percentage}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {policy.allow_reschedule ? (
                        <div>
                          <div className="flex items-center gap-1">
                            <RefreshCw className="h-3 w-3" />
                            {policy.max_reschedules_per_month}/μήνα
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {policy.reschedule_hours_before}ω πριν
                          </div>
                        </div>
                      ) : (
                        <Badge variant="outline">Όχι</Badge>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <span className="text-sm truncate">
                        {getApplicableToText(policy.applicable_to)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{policy.priority}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={policy.is_active ? "bg-green-100 text-green-800" : ""}>
                        {policy.is_active ? "Ενεργή" : "Ανενεργή"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleOpenModal(policy)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeletePolicy(policy.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit/Create Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingPolicy ? "Επεξεργασία Πολιτικής" : "Νέα Πολιτική"}
            </DialogTitle>
            <DialogDescription>
              Ορίστε τους κανόνες ακύρωσης και μετάθεσης για τα μαθήματα
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Όνομα Πολιτικής</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="π.χ. Βασική Πολιτική"
                />
              </div>
              <div>
                <Label htmlFor="priority">Προτεραιότητα</Label>
                <Input
                  id="priority"
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                  min="0"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Περιγραφή</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Περιγράψτε την πολιτική..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hours_before">Ώρες πριν το μάθημα (χωρίς χρέωση)</Label>
                <Input
                  id="hours_before"
                  type="number"
                  value={formData.hours_before}
                  onChange={(e) => setFormData({ ...formData, hours_before: parseInt(e.target.value) })}
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="penalty">Ποσοστό χρέωσης (%)</Label>
                <Input
                  id="penalty"
                  type="number"
                  value={formData.penalty_percentage}
                  onChange={(e) => setFormData({ ...formData, penalty_percentage: parseInt(e.target.value) })}
                  min="0"
                  max="100"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="allow_reschedule"
                checked={formData.allow_reschedule}
                onCheckedChange={(checked) => setFormData({ ...formData, allow_reschedule: checked })}
              />
              <Label htmlFor="allow_reschedule" className="font-normal">
                Επιτρέπεται μετάθεση
              </Label>
            </div>

            {formData.allow_reschedule && (
              <div className="grid grid-cols-2 gap-4 pl-6">
                <div>
                  <Label htmlFor="reschedule_hours">Ώρες πριν για μετάθεση</Label>
                  <Input
                    id="reschedule_hours"
                    type="number"
                    value={formData.reschedule_hours_before}
                    onChange={(e) => setFormData({ ...formData, reschedule_hours_before: parseInt(e.target.value) })}
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="max_reschedules">Μέγιστες μεταθέσεις/μήνα</Label>
                  <Input
                    id="max_reschedules"
                    type="number"
                    value={formData.max_reschedules_per_month}
                    onChange={(e) => setFormData({ ...formData, max_reschedules_per_month: parseInt(e.target.value) })}
                    min="0"
                  />
                </div>
              </div>
            )}

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Οι πολιτικές με υψηλότερη προτεραιότητα εφαρμόζονται πρώτες όταν ταιριάζουν πολλές πολιτικές.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Ακύρωση
            </Button>
            <Button onClick={handleSavePolicy}>
              {editingPolicy ? "Ενημέρωση" : "Δημιουργία"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default CancellationPoliciesPage;