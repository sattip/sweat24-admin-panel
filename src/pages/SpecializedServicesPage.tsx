import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminHeader } from "@/components/AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { useToast } from "@/components/ui/use-toast";
import {
  Edit,
  Trash2,
  Plus,
  Briefcase,
  Calendar,
  Phone,
  Clock,
  User,
  FileText,
} from "lucide-react";
import { specializedServicesApi, appointmentRequestsApi } from "@/api/modules/specializedServices";

interface SpecializedService {
  id: number;
  name: string;
  slug: string;
  description: string;
  duration: string;
  price: string;
  icon: string;
  preferred_time_slots: string[];
}

interface AppointmentRequest {
  id: number;
  specialized_service_id: number;
  name: string;
  phone: string;
  preferred_time_slot: string;
  notes: string;
  status: string;
  created_at: string;
  service?: SpecializedService;
}

export default function SpecializedServicesPage() {
  const { toast } = useToast();
  const [services, setServices] = useState<SpecializedService[]>([]);
  const [appointmentRequests, setAppointmentRequests] = useState<AppointmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingService, setEditingService] = useState<SpecializedService | null>(null);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: '',
    price: '',
    icon: '',
    preferred_time_slots: [] as string[],
  });

  useEffect(() => {
    fetchServices();
    fetchAppointmentRequests();
  }, []);

  const fetchServices = async () => {
    try {
      const data = await specializedServicesApi.getAll();
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: "Σφάλμα",
        description: "Αποτυχία φόρτωσης υπηρεσιών",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointmentRequests = async () => {
    try {
      const data = await appointmentRequestsApi.getAll();
      setAppointmentRequests(data);
    } catch (error) {
      console.error('Error fetching appointment requests:', error);
    }
  };

  const handleOpenDialog = (service?: SpecializedService) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        description: service.description,
        duration: service.duration,
        price: service.price,
        icon: service.icon,
        preferred_time_slots: service.preferred_time_slots || [],
      });
      setSelectedTimeSlots(service.preferred_time_slots || []);
    } else {
      setEditingService(null);
      setFormData({
        name: '',
        description: '',
        duration: '',
        price: '',
        icon: '',
        preferred_time_slots: [],
      });
      setSelectedTimeSlots([]);
    }
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    try {
      const dataToSubmit = {
        ...formData,
        preferred_time_slots: selectedTimeSlots,
      };
      
      if (editingService) {
        await specializedServicesApi.update(editingService.id, dataToSubmit);
        toast({
          title: "Επιτυχία",
          description: "Η υπηρεσία ενημερώθηκε",
        });
      } else {
        await specializedServicesApi.create(dataToSubmit);
        toast({
          title: "Επιτυχία",
          description: "Η υπηρεσία δημιουργήθηκε",
        });
      }
      fetchServices();
      setOpenDialog(false);
    } catch (error) {
      console.error('Error saving service:', error);
      toast({
        title: "Σφάλμα",
        description: "Αποτυχία αποθήκευσης",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε αυτή την υπηρεσία;')) {
      try {
        await specializedServicesApi.delete(id);
        fetchServices();
        toast({
          title: "Επιτυχία",
          description: "Η υπηρεσία διαγράφηκε",
        });
      } catch (error) {
        console.error('Error deleting service:', error);
        toast({
          title: "Σφάλμα",
          description: "Αποτυχία διαγραφής",
          variant: "destructive",
        });
      }
    }
  };

  const handleUpdateRequestStatus = async (id: number, status: string) => {
    try {
      await appointmentRequestsApi.updateStatus(id, status);
      fetchAppointmentRequests();
      toast({
        title: "Επιτυχία",
        description: "Η κατάσταση ενημερώθηκε",
      });
    } catch (error) {
      console.error('Error updating request status:', error);
      toast({
        title: "Σφάλμα",
        description: "Αποτυχία ενημέρωσης",
        variant: "destructive",
      });
    }
  };

  const handleTimeSlotToggle = (slot: string) => {
    setSelectedTimeSlots(prev => 
      prev.includes(slot) 
        ? prev.filter(s => s !== slot)
        : [...prev, slot]
    );
  };

  const timeSlotLabels = {
    morning: 'Πρωί',
    afternoon: 'Απόγευμα',
    evening: 'Βράδυ',
  };

  const statusColors = {
    pending: 'secondary',
    contacted: 'default',
    scheduled: 'success',
    cancelled: 'destructive',
  } as const;

  const statusLabels = {
    pending: 'Εκκρεμεί',
    contacted: 'Επικοινωνήθηκε',
    scheduled: 'Προγραμματίστηκε',
    cancelled: 'Ακυρώθηκε',
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
                <h1 className="text-3xl font-bold text-foreground">Εξειδικευμένες Υπηρεσίες</h1>
                <p className="text-muted-foreground">
                  Διαχείριση υπηρεσιών και αιτημάτων ραντεβού
                </p>
              </div>
              <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Νέα Υπηρεσία
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingService ? 'Επεξεργασία Υπηρεσίας' : 'Νέα Υπηρεσία'}
                    </DialogTitle>
                    <DialogDescription>
                      Συμπληρώστε τα στοιχεία της υπηρεσίας
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div>
                      <Label htmlFor="name">Όνομα</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="π.χ. Personal Training"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Περιγραφή</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Περιγράψτε την υπηρεσία..."
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="duration">Διάρκεια</Label>
                        <Input
                          id="duration"
                          value={formData.duration}
                          onChange={(e) => setFormData({...formData, duration: e.target.value})}
                          placeholder="π.χ. 60 λεπτά"
                        />
                      </div>
                      <div>
                        <Label htmlFor="price">Τιμή</Label>
                        <Input
                          id="price"
                          value={formData.price}
                          onChange={(e) => setFormData({...formData, price: e.target.value})}
                          placeholder="π.χ. 40€"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="icon">Εικονίδιο (emoji)</Label>
                      <Input
                        id="icon"
                        value={formData.icon}
                        onChange={(e) => setFormData({...formData, icon: e.target.value})}
                        placeholder="π.χ. 💪"
                      />
                    </div>
                    <div>
                      <Label>Διαθέσιμες Ώρες</Label>
                      <div className="flex gap-2 mt-2">
                        {Object.entries(timeSlotLabels).map(([value, label]) => (
                          <Button
                            key={value}
                            type="button"
                            variant={selectedTimeSlots.includes(value) ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleTimeSlotToggle(value)}
                          >
                            {label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setOpenDialog(false)}>
                      Ακύρωση
                    </Button>
                    <Button onClick={handleSubmit}>
                      Αποθήκευση
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Tabs defaultValue="services" className="space-y-4">
              <TabsList>
                <TabsTrigger value="services">Υπηρεσίες</TabsTrigger>
                <TabsTrigger value="requests">Αιτήματα Ραντεβού</TabsTrigger>
              </TabsList>

              <TabsContent value="services" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Υπηρεσίες</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Όνομα</TableHead>
                          <TableHead>Περιγραφή</TableHead>
                          <TableHead>Διάρκεια</TableHead>
                          <TableHead>Τιμή</TableHead>
                          <TableHead>Διαθέσιμες Ώρες</TableHead>
                          <TableHead className="text-right">Ενέργειες</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {services.map((service) => (
                          <TableRow key={service.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <span>{service.icon}</span>
                                {service.name}
                              </div>
                            </TableCell>
                            <TableCell>{service.description}</TableCell>
                            <TableCell>{service.duration}</TableCell>
                            <TableCell>{service.price}</TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                {service.preferred_time_slots?.map((slot) => (
                                  <Badge key={slot} variant="secondary">
                                    {timeSlotLabels[slot as keyof typeof timeSlotLabels]}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleOpenDialog(service)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(service.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
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

              <TabsContent value="requests" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Αιτήματα Ραντεβού</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ημερομηνία</TableHead>
                          <TableHead>Όνομα</TableHead>
                          <TableHead>Τηλέφωνο</TableHead>
                          <TableHead>Υπηρεσία</TableHead>
                          <TableHead>Προτιμώμενη Ώρα</TableHead>
                          <TableHead>Σημειώσεις</TableHead>
                          <TableHead>Κατάσταση</TableHead>
                          <TableHead className="text-right">Ενέργειες</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {appointmentRequests.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell>
                              {new Date(request.created_at).toLocaleDateString('el-GR')}
                            </TableCell>
                            <TableCell className="font-medium">{request.name}</TableCell>
                            <TableCell>{request.phone}</TableCell>
                            <TableCell>{request.service?.name || 'N/A'}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {timeSlotLabels[request.preferred_time_slot as keyof typeof timeSlotLabels]}
                              </Badge>
                            </TableCell>
                            <TableCell>{request.notes || '-'}</TableCell>
                            <TableCell>
                              <Badge variant={statusColors[request.status as keyof typeof statusColors]}>
                                {statusLabels[request.status as keyof typeof statusLabels]}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Select
                                value={request.status}
                                onValueChange={(value) => handleUpdateRequestStatus(request.id, value)}
                              >
                                <SelectTrigger className="w-[140px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Εκκρεμεί</SelectItem>
                                  <SelectItem value="contacted">Επικοινωνήθηκε</SelectItem>
                                  <SelectItem value="scheduled">Προγραμματίστηκε</SelectItem>
                                  <SelectItem value="cancelled">Ακυρώθηκε</SelectItem>
                                </SelectContent>
                              </Select>
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