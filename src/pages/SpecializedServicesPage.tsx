import React, { useState, useEffect } from "react";
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
  Eye,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  Check,
  AlertTriangle,
  Wifi,
  WifiOff
} from "lucide-react";
import { 
  specializedServicesApi, 
  appointmentRequestsApi, 
  AppointmentRequest, 
  ConfirmRequestData, 
  RejectRequestData, 
  CompleteRequestData,
  BookingRequestFilters 
} from "@/api/modules/specializedServices";
import { useAuth } from '@/contexts/AuthContext';

// Διαγνωστική συνάρτηση για έλεγχο authentication
const AuthDiagnostics: React.FC = () => {
  const { user, token, isAuthenticated } = useAuth();
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  
  useEffect(() => {
    // Έλεγχος connectivity με το backend
    const checkBackend = async () => {
      try {
        const response = await fetch('https://sweat93laravel.obs.com.gr/api/v1/health', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          }
        });
        setBackendStatus(response.ok ? 'online' : 'offline');
      } catch (error) {
        setBackendStatus('offline');
      }
    };
    
    checkBackend();
  }, []);
  
  console.log('🔍 AUTH DIAGNOSTICS:', {
    user,
    token: token ? `${token.substring(0, 10)}...` : 'NO TOKEN',
    isAuthenticated,
    backendStatus,
    localStorage: localStorage.getItem('auth-token') ? 'HAS TOKEN' : 'NO TOKEN'
  });
  
  return (
    <Card className="mb-4 border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          Διαγνωστικά Authentication
        </CardTitle>
      </CardHeader>
      <CardContent className="text-xs space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-medium">Κατάσταση:</span>
          <Badge variant={isAuthenticated ? "default" : "destructive"}>
            {isAuthenticated ? "✅ Συνδεδεμένος" : "❌ Μη συνδεδεμένος"}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium">User:</span>
          <span>{user?.email || "Κανένας"}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium">Token:</span>
          <span>{token ? "✅ Υπάρχει" : "❌ Λείπει"}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium">Backend:</span>
          <div className="flex items-center gap-1">
            {backendStatus === 'checking' && <span>Έλεγχος...</span>}
            {backendStatus === 'online' && (
              <>
                <Wifi className="h-3 w-3 text-green-600" />
                <span className="text-green-600">Online</span>
              </>
            )}
            {backendStatus === 'offline' && (
              <>
                <WifiOff className="h-3 w-3 text-red-600" />
                <span className="text-red-600">Offline</span>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

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

export default function SpecializedServicesPage() {
  const { toast } = useToast();
  const [services, setServices] = useState<SpecializedService[]>([]);
  const [appointmentRequests, setAppointmentRequests] = useState<AppointmentRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<AppointmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [openCompleteDialog, setOpenCompleteDialog] = useState(false);
  const [editingService, setEditingService] = useState<SpecializedService | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<AppointmentRequest | null>(null);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  
  // Filter states
  const [filters, setFilters] = useState<BookingRequestFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  
  const [confirmData, setConfirmData] = useState<ConfirmRequestData>({
    confirmed_date: '',
    confirmed_time: '',
    instructor_id: undefined,
    admin_notes: '',
  });
  const [rejectData, setRejectData] = useState<RejectRequestData>({
    rejection_reason: '',
    admin_notes: '',
  });
  const [completeData, setCompleteData] = useState<CompleteRequestData>({
    admin_notes: '',
  });
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

  useEffect(() => {
    applyFilters();
  }, [appointmentRequests, filters, searchTerm]);

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
      const response = await appointmentRequestsApi.getAll(filters);
      
      // Handle paginated response - check if it's a direct array or paginated response
      let requestsData: AppointmentRequest[] = [];
      if (Array.isArray(response)) {
        requestsData = response;
      } else if (response && typeof response === 'object' && 'data' in response) {
        requestsData = (response as any).data || [];
      }
      
      setAppointmentRequests(requestsData);
    } catch (error) {
      console.error('Error fetching appointment requests:', error);
      toast({
        title: "Σφάλμα",
        description: "Αποτυχία φόρτωσης αιτημάτων",
        variant: "destructive",
      });
    }
  };

  const applyFilters = () => {
    let filtered = [...appointmentRequests];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(request => 
        (request.client_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (request.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (request.customer_email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (request.email?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(request => request.status === filters.status);
    }

    // Apply service_type filter
    if (filters.service_type) {
      filtered = filtered.filter(request => request.service_type === filters.service_type);
    }

    // Apply date range filter
    if (filters.date_from) {
      filtered = filtered.filter(request => 
        new Date(request.created_at) >= new Date(filters.date_from!)
      );
    }

    if (filters.date_to) {
      filtered = filtered.filter(request => 
        new Date(request.created_at) <= new Date(filters.date_to!)
      );
    }

    setFilteredRequests(filtered);
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

  const handleViewRequest = (request: AppointmentRequest) => {
    setSelectedRequest(request);
    setOpenViewDialog(true);
  };

  const handleConfirmRequest = (request: AppointmentRequest) => {
    setSelectedRequest(request);
    setConfirmData({
      confirmed_date: request.preferred_dates?.[0] || '',
      confirmed_time: request.preferred_times?.[0] || '',
      instructor_id: undefined,
      admin_notes: '',
    });
    setOpenConfirmDialog(true);
  };

  const handleRejectRequest = (request: AppointmentRequest) => {
    setSelectedRequest(request);
    setRejectData({
      rejection_reason: '',
      admin_notes: '',
    });
    setOpenRejectDialog(true);
  };

  const handleCompleteRequest = (request: AppointmentRequest) => {
    setSelectedRequest(request);
    setCompleteData({
      admin_notes: '',
    });
    setOpenCompleteDialog(true);
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

  const handleConfirmSubmit = async () => {
    if (!selectedRequest) return;

    try {
      await appointmentRequestsApi.confirm(selectedRequest.id, confirmData);
      toast({
        title: "Επιτυχία",
        description: "Το αίτημα επιβεβαιώθηκε επιτυχώς",
      });
      fetchAppointmentRequests();
      setOpenConfirmDialog(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error confirming request:', error);
      toast({
        title: "Σφάλμα",
        description: "Αποτυχία επιβεβαίωσης αιτήματος",
        variant: "destructive",
      });
    }
  };

  const handleRejectSubmit = async () => {
    if (!selectedRequest) return;

    try {
      await appointmentRequestsApi.reject(selectedRequest.id, rejectData);
      toast({
        title: "Επιτυχία",
        description: "Το αίτημα απορρίφθηκε",
      });
      fetchAppointmentRequests();
      setOpenRejectDialog(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: "Σφάλμα",
        description: "Αποτυχία απόρριψης αιτήματος",
        variant: "destructive",
      });
    }
  };

  const handleCompleteSubmit = async () => {
    if (!selectedRequest) return;

    try {
      await appointmentRequestsApi.complete(selectedRequest.id, completeData);
      toast({
        title: "Επιτυχία",
        description: "Το ραντεβού μαρκαρίστηκε ως ολοκληρωμένο",
      });
      fetchAppointmentRequests();
      setOpenCompleteDialog(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error completing request:', error);
      toast({
        title: "Σφάλμα",
        description: "Αποτυχία ολοκλήρωσης αιτήματος",
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Εκκρεμεί</Badge>;
      case 'confirmed':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Επιβεβαιωμένο</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Ολοκληρωμένο</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Απορρίφθηκε</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatPreferredTimes = (request: AppointmentRequest) => {
    const dates = request.preferred_dates || [];
    const times = request.preferred_times || [];
    
    if (dates.length === 0 && times.length === 0) {
      return request.preferred_time_slot || '-';
    }

    return (
      <div className="text-sm">
        {dates.map((date: string, idx: number) => (
          <div key={idx} className="font-medium">
            📅 {new Date(date).toLocaleDateString('el-GR')}
          </div>
        ))}
        {times.length > 0 && (
          <div className="text-muted-foreground mt-1">
            🕐 {times.join(' - ')}
          </div>
        )}
      </div>
    );
  };

  const handleFilterChange = (key: keyof BookingRequestFilters, value: string) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
    // Refetch data with new filters
    fetchAppointmentRequests();
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
    fetchAppointmentRequests();
  };

  console.log('SpecializedServicesPage loaded with version: TEST 1 - If you see this, the updated file is loaded');

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
                  <Button className="bg-primary hover:bg-primary/90 text-white" onClick={() => handleOpenDialog()}>
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

            <Tabs defaultValue="services" className="space-y-4" onValueChange={(value) => {
              if (value === 'requests') {
                fetchAppointmentRequests();
              }
            }}>
              <TabsList>
                <TabsTrigger value="services">Υπηρεσίες</TabsTrigger>
                <TabsTrigger value="requests">Αιτήματα Ραντεβού 1</TabsTrigger>
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
                {/* Filters Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Filter className="h-5 w-5" />
                      Φίλτρα Αναζήτησης
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      <div>
                        <Label>Αναζήτηση</Label>
                        <div className="relative">
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Όνομα, email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Κατάσταση</Label>
                        <Select value={filters.status || ''} onValueChange={(value) => handleFilterChange('status', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Όλες" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Όλες</SelectItem>
                            <SelectItem value="pending">Εκκρεμεί</SelectItem>
                            <SelectItem value="confirmed">Επιβεβαιωμένο</SelectItem>
                            <SelectItem value="completed">Ολοκληρωμένο</SelectItem>
                            <SelectItem value="rejected">Απορρίφθηκε</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Τύπος Υπηρεσίας</Label>
                        <Select value={filters.service_type || ''} onValueChange={(value) => handleFilterChange('service_type', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Όλες" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Όλες</SelectItem>
                            <SelectItem value="ems">EMS</SelectItem>
                            <SelectItem value="personal">Personal Training</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Από Ημερομηνία</Label>
                        <Input
                          type="date"
                          value={filters.date_from || ''}
                          onChange={(e) => handleFilterChange('date_from', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Έως Ημερομηνία</Label>
                        <Input
                          type="date"
                          value={filters.date_to || ''}
                          onChange={(e) => handleFilterChange('date_to', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end mt-4">
                      <Button variant="outline" onClick={clearFilters}>
                        Καθαρισμός Φίλτρων
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Requests Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Αιτήματα Ραντεβού ({filteredRequests.length} συνολικά)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ημερομηνία</TableHead>
                          <TableHead>Όνομα Πελάτη</TableHead>
                          <TableHead>Επικοινωνία</TableHead>
                          <TableHead>Τύπος Υπηρεσίας</TableHead>
                          <TableHead>Προτιμώμενες Ημ/Ώρες</TableHead>
                          <TableHead>Κατάσταση</TableHead>
                          <TableHead className="text-right">Ενέργειες</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRequests.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                              {appointmentRequests.length === 0 ? "Δεν υπάρχουν αιτήματα ραντεβού" : "Δεν βρέθηκαν αιτήματα με τα επιλεγμένα φίλτρα"}
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredRequests.map((request) => (
                            <TableRow key={request.id}>
                              <TableCell>
                                {new Date(request.created_at).toLocaleDateString('el-GR')}
                              </TableCell>
                              <TableCell className="font-medium">
                                <div>{request.client_name || request.customer_name || 'N/A'}</div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  {(request.customer_email || request.email) && (
                                    <div>📧 {request.customer_email || request.email}</div>
                                  )}
                                  {(request.customer_phone || request.phone) && (
                                    <div>📞 {request.customer_phone || request.phone}</div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className={request.service_type === 'ems' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}>
                                  {request.service_type?.toUpperCase() || 'EMS'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {formatPreferredTimes(request)}
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(request.status)}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleViewRequest(request)}
                                    title="Προβολή λεπτομερειών"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  {request.status === 'pending' && (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-green-600 hover:text-green-700"
                                        onClick={() => handleConfirmRequest(request)}
                                        title="Οριστικοποίηση ραντεβού"
                                      >
                                        <CheckCircle className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-600 hover:text-red-700"
                                        onClick={() => handleRejectRequest(request)}
                                        title="Απόρριψη αιτήματος"
                                      >
                                        <XCircle className="h-4 w-4" />
                                      </Button>
                                    </>
                                  )}
                                  {request.status === 'confirmed' && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-blue-600 hover:text-blue-700"
                                      onClick={() => handleCompleteRequest(request)}
                                      title="Μαρκάρισμα ως ολοκληρωμένο"
                                    >
                                      <Check className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* View Request Details Dialog */}
            <Dialog open={openViewDialog} onOpenChange={setOpenViewDialog}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Λεπτομέρειες Αιτήματος</DialogTitle>
                </DialogHeader>
                {selectedRequest && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Όνομα Πελάτη</Label>
                        <p className="text-sm font-medium">{selectedRequest.client_name || selectedRequest.customer_name}</p>
                      </div>
                      <div>
                        <Label>Email</Label>
                        <p className="text-sm">{selectedRequest.customer_email || selectedRequest.email}</p>
                      </div>
                      <div>
                        <Label>Τηλέφωνο</Label>
                        <p className="text-sm">{selectedRequest.customer_phone || selectedRequest.phone}</p>
                      </div>
                      <div>
                        <Label>Τύπος Υπηρεσίας</Label>
                        <p className="text-sm font-medium">{selectedRequest.service_type?.toUpperCase()}</p>
                      </div>
                      <div>
                        <Label>Κατάσταση</Label>
                        <p className="text-sm">{getStatusBadge(selectedRequest.status)}</p>
                      </div>
                      <div>
                        <Label>Ημερομηνία Υποβολής</Label>
                        <p className="text-sm">{new Date(selectedRequest.created_at).toLocaleString('el-GR')}</p>
                      </div>
                    </div>
                    
                    <div>
                      <Label>Προτιμώμενες Ημερομηνίες</Label>
                      <div className="mt-1">
                        {selectedRequest.preferred_dates?.map((date: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="mr-1 mb-1">
                            {new Date(date).toLocaleDateString('el-GR')}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Προτιμώμενες Ώρες</Label>
                      <div className="mt-1">
                        {selectedRequest.preferred_times?.map((time: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="mr-1 mb-1">
                            {time}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {selectedRequest.message && (
                      <div>
                        <Label>Μήνυμα Πελάτη</Label>
                        <p className="text-sm mt-1 p-2 bg-muted rounded">{selectedRequest.message}</p>
                      </div>
                    )}

                    {selectedRequest.confirmed_date && selectedRequest.confirmed_time && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Επιβεβαιωμένη Ημερομηνία</Label>
                          <p className="text-sm font-medium">{new Date(selectedRequest.confirmed_date).toLocaleDateString('el-GR')}</p>
                        </div>
                        <div>
                          <Label>Επιβεβαιωμένη Ώρα</Label>
                          <p className="text-sm font-medium">{selectedRequest.confirmed_time}</p>
                        </div>
                      </div>
                    )}

                    {selectedRequest.admin_notes && (
                      <div>
                        <Label>Σημειώσεις Admin</Label>
                        <p className="text-sm mt-1 p-2 bg-blue-50 text-blue-800 rounded">{selectedRequest.admin_notes}</p>
                      </div>
                    )}

                    {selectedRequest.rejection_reason && (
                      <div>
                        <Label>Λόγος Απόρριψης</Label>
                        <p className="text-sm mt-1 p-2 bg-red-50 text-red-800 rounded">{selectedRequest.rejection_reason}</p>
                      </div>
                    )}
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* Confirm Request Dialog */}
            <Dialog open={openConfirmDialog} onOpenChange={setOpenConfirmDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Οριστικοποίηση Ραντεβού</DialogTitle>
                  <DialogDescription>
                    Επιλέξτε την τελική ημερομηνία και ώρα για το ραντεβού
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="confirmed_date">Τελική Ημερομηνία *</Label>
                    <Input
                      id="confirmed_date"
                      type="date"
                      value={confirmData.confirmed_date}
                      onChange={(e) => setConfirmData({...confirmData, confirmed_date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmed_time">Τελική Ώρα *</Label>
                    <Input
                      id="confirmed_time"
                      type="time"
                      value={confirmData.confirmed_time}
                      onChange={(e) => setConfirmData({...confirmData, confirmed_time: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="instructor_id">Προπονητής (προαιρετικό)</Label>
                    <Input
                      id="instructor_id"
                      type="number"
                      placeholder="ID προπονητή"
                      value={confirmData.instructor_id || ''}
                      onChange={(e) => setConfirmData({...confirmData, instructor_id: e.target.value ? parseInt(e.target.value) : undefined})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirm_notes">Σημειώσεις Admin (προαιρετικό)</Label>
                    <Textarea
                      id="confirm_notes"
                      value={confirmData.admin_notes}
                      onChange={(e) => setConfirmData({...confirmData, admin_notes: e.target.value})}
                      placeholder="Επιπλέον πληροφορίες για το ραντεβού..."
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setOpenConfirmDialog(false)}>
                    Ακύρωση
                  </Button>
                  <Button 
                    onClick={handleConfirmSubmit}
                    disabled={!confirmData.confirmed_date || !confirmData.confirmed_time}
                  >
                    Οριστικοποίηση
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Reject Request Dialog */}
            <Dialog open={openRejectDialog} onOpenChange={setOpenRejectDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Απόρριψη Αιτήματος</DialogTitle>
                  <DialogDescription>
                    Παρακαλώ εξηγήστε τον λόγο απόρριψης του αιτήματος
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="rejection_reason">Λόγος Απόρριψης *</Label>
                    <Select 
                      value={rejectData.rejection_reason} 
                      onValueChange={(value) => setRejectData({...rejectData, rejection_reason: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Επιλέξτε λόγο" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no_availability">Μη διαθεσιμότητα</SelectItem>
                        <SelectItem value="incomplete_info">Ελλιπή στοιχεία</SelectItem>
                        <SelectItem value="technical_issues">Τεχνικά προβλήματα</SelectItem>
                        <SelectItem value="client_cancelled">Ακύρωση από πελάτη</SelectItem>
                        <SelectItem value="other">Άλλος λόγος</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="reject_notes">Επιπλέον Σημειώσεις</Label>
                    <Textarea
                      id="reject_notes"
                      value={rejectData.admin_notes}
                      onChange={(e) => setRejectData({...rejectData, admin_notes: e.target.value})}
                      placeholder="Περισσότερες λεπτομέρειες για την απόρριψη..."
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setOpenRejectDialog(false)}>
                    Ακύρωση
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={handleRejectSubmit}
                    disabled={!rejectData.rejection_reason}
                  >
                    Απόρριψη
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Complete Request Dialog */}
            <Dialog open={openCompleteDialog} onOpenChange={setOpenCompleteDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ολοκλήρωση Ραντεβού</DialogTitle>
                  <DialogDescription>
                    Μαρκάρισμα του ραντεβού ως ολοκληρωμένο
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="complete_notes">Σημειώσεις Ολοκλήρωσης (προαιρετικό)</Label>
                    <Textarea
                      id="complete_notes"
                      value={completeData.admin_notes}
                      onChange={(e) => setCompleteData({...completeData, admin_notes: e.target.value})}
                      placeholder="Σημειώσεις για την ολοκλήρωση του ραντεβού..."
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setOpenCompleteDialog(false)}>
                    Ακύρωση
                  </Button>
                  <Button onClick={handleCompleteSubmit}>
                    Ολοκλήρωση
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}