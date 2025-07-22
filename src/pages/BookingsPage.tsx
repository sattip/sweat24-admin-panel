import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminHeader } from "@/components/AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  Users,
  Search,
  CheckCircle,
  XCircle,
  ArrowRightLeft,
  Plus,
  X,
  Loader2,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { el } from "date-fns/locale";
import { useToast } from "@/components/ui/use-toast";
import { bookingsApi, usersApi, classesApi, instructorsApi, bookingRequestsApi } from "@/services/api";
import type { Booking, User as UserType, Class, Instructor } from "@/data/mockData";
import { notifyGracefulCancellation } from "@/utils/notifications";

type DialogType = 'transfer' | 'new' | null;

// Helper functions for date/time formatting
const formatBookingDate = (dateStr: string) => {
  if (!dateStr) return '';
  
  // Handle ISO format with T
  if (dateStr.includes('T')) {
    const date = parseISO(dateStr);
    return format(date, 'dd/MM/yyyy', { locale: el });
  }
  
  // Handle simple date format
  try {
    const date = new Date(dateStr);
    return format(date, 'dd/MM/yyyy', { locale: el });
  } catch {
    return dateStr;
  }
};

const formatBookingTime = (timeStr: string) => {
  if (!timeStr) return '';
  
  // Handle ISO format with T
  if (timeStr.includes('T')) {
    const date = parseISO(timeStr);
    return format(date, 'HH:mm');
  }
  
  // Handle simple time format
  if (timeStr.includes(':')) {
    return timeStr.substring(0, 5); // Get HH:mm from HH:mm:ss
  }
  
  return timeStr;
};

export function BookingsPage() {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [instructors, setInstructors] = useState<any[]>([]);
  const [bookingRequests, setBookingRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState("all");
  
  const [openDialog, setOpenDialog] = useState<DialogType>(null);
  const [confirmDialog, setConfirmDialog] = useState<{open: boolean; request: any | null}>({open: false, request: null});
  const [rejectDialog, setRejectDialog] = useState<{open: boolean; request: any | null}>({open: false, request: null});
  
  // State for transfer
  const [transferTargetUser, setTransferTargetUser] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  // State for new booking
  const [newBookingData, setNewBookingData] = useState({
    userId: '',
    customer_name: '',
    customer_email: '',
    className: '',
    instructor: '',
    date: '',
    time: '',
    type: 'group'
  });

  // State for confirmation
  const [confirmData, setConfirmData] = useState({
    date: '',
    time: '',
    instructor_id: ''
  });

  // State for rejection
  const [rejectReason, setRejectReason] = useState('');

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        console.log('🔄 BookingsPage: Starting data fetch...');
        
        // Debug: Test booking requests API separately
        try {
          console.log('🔍 TESTING booking requests API...');
          const testResult = await bookingRequestsApi.getAll();
          console.log('✅ Booking requests test SUCCESS:', testResult);
        } catch (testError) {
          console.error('❌ Booking requests test FAILED:', testError);
          // Show error in UI
          toast({
            title: "Σφάλμα Αιτημάτων Ραντεβού",
            description: `API Error: ${testError instanceof Error ? testError.message : 'Unknown error'}`,
            variant: "destructive",
          });
        }
        
        const [bookingsResponse, usersResponse, classesResponse, instructorsResponse, bookingRequestsResponse] = await Promise.all([
          bookingsApi.getAll(),
          usersApi.getAll(),
          classesApi.getAll(),
          instructorsApi.getAll(),
          bookingRequestsApi.getAll().catch(error => {
            console.error('❌ Booking requests API error:', error);
            toast({
              title: "Σφάλμα Αιτημάτων Ραντεβού", 
              description: `Δεν ήταν δυνατή η φόρτωση των αιτημάτων: ${error instanceof Error ? error.message : 'Unknown error'}`,
              variant: "destructive",
            });
            return { data: [] }; // Return empty array to prevent crash
          })
        ]);
        
        console.log('📥 BookingsPage: Raw API responses:', {
          bookingsResponse,
          usersResponse,
          classesResponse,
          instructorsResponse,
          bookingRequestsResponse
        });
        
        // Handle both wrapped and unwrapped responses
        const bookingsData = Array.isArray(bookingsResponse) ? bookingsResponse : (bookingsResponse.data || []);
        const usersData = Array.isArray(usersResponse) ? usersResponse : (usersResponse.data || []);
        const classesData = Array.isArray(classesResponse) ? classesResponse : (classesResponse.data || []);
        const instructorsData = Array.isArray(instructorsResponse) ? instructorsResponse : (instructorsResponse.data || []);
        // Handle paginated response from Laravel
        let bookingRequestsData = [];
        if (Array.isArray(bookingRequestsResponse)) {
          bookingRequestsData = bookingRequestsResponse;
        } else if (bookingRequestsResponse && Array.isArray(bookingRequestsResponse.data)) {
          bookingRequestsData = bookingRequestsResponse.data;
        }
            
        console.log('🔍 Booking Requests Raw Response:', bookingRequestsResponse);
        console.log('📊 Booking Requests Processed Data:', bookingRequestsData);
        
        console.log('✅ BookingsPage: Processed data:', {
          bookingsCount: bookingsData.length,
          bookingsData,
          usersCount: usersData.length,
          classesCount: classesData.length,
          instructorsCount: instructorsData.length,
          bookingRequestsCount: bookingRequestsData.length
        });
        
        setBookings(bookingsData);
        setUsers(usersData);
        setClasses(classesData);
        setInstructors(instructorsData);
        setBookingRequests(bookingRequestsData);
        
        // Force debug output that won't be minified
        if (bookingRequestsData.length > 0) {
          (window as any).__DEBUG_BOOKING_REQUESTS = bookingRequestsData;
          console.warn('✅ BOOKING REQUESTS LOADED:', bookingRequestsData.length, 'items');
          alert(`✅ LOADED ${bookingRequestsData.length} BOOKING REQUESTS!`);
        } else {
          console.warn('⚠️ NO BOOKING REQUESTS FOUND - checking response...');
          console.warn('Raw response:', bookingRequestsResponse);
          alert('⚠️ NO BOOKING REQUESTS FOUND!');
        }
      } catch (error) {
        console.error('❌ BookingsPage: Error fetching data:', error);
        toast({
          title: "Σφάλμα",
          description: "Αποτυχία φόρτωσης δεδομένων. Παρακαλώ δοκιμάστε ξανά.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);

  const handleInputChange = (field: string, value: string) => {
    setNewBookingData(prev => ({...prev, [field]: value}));
  };

  const handleUserChange = (userId: string) => {
    const selectedUser = users.find(u => u.id === userId);
    if (selectedUser) {
      setNewBookingData(prev => ({
        ...prev,
        userId: userId,
        customer_name: selectedUser.name,
        customer_email: selectedUser.email,
      }));
    }
  };

  const handleClassChange = (classId: string) => {
    const selectedClass = classes.find(c => c.id === classId);
    if (!selectedClass) return;

    setNewBookingData(prev => ({
      ...prev,
      className: selectedClass.name,
      instructor: selectedClass.instructor?.name || selectedClass.instructor,
    }));
  };

  const handleCreateBooking = async () => {
    try {
      setIsCreating(true);
      const { userId, customer_name, customer_email, className, instructor, date, time, type } = newBookingData;

      if (!customer_name || !customer_email || !className || !date || !time) {
        toast({ 
          title: "Σφάλμα", 
          description: "Παρακαλώ συμπληρώστε όλα τα απαραίτητα πεδία.", 
          variant: "destructive"
        });
        return;
      }

      const bookingData = {
        user_id: userId || null,
        customer_name,
        customer_email,
        class_name: className,
        instructor,
        date,
        time,
        type,
        location: 'Main Floor'
      };

      const response = await bookingsApi.create(bookingData);
      const newBooking = response.data || response;
      
      setBookings([...bookings, newBooking]);
      setOpenDialog(null);

      toast({
        title: "Επιτυχία!",
        description: `Η κράτηση για ${customer_name} δημιουργήθηκε με επιτυχία.`,
      });

      // Reset form
      setNewBookingData({
        userId: '',
        customer_name: '',
        customer_email: '',
        className: '',
        instructor: '',
        date: '',
        time: '',
        type: 'group'
      });
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Σφάλμα",
        description: "Αποτυχία δημιουργίας κράτησης. Παρακαλώ δοκιμάστε ξανά.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleCheckIn = async (bookingId: string) => {
    try {
      const response = await bookingsApi.checkIn(bookingId);
      const updatedBooking = response.data || response;
      
      setBookings(bookings.map(booking => 
        booking.id === bookingId ? updatedBooking : booking
      ));

      toast({
        title: "Επιτυχία!",
        description: "Ο πελάτης καταγράφηκε ως παρών.",
      });
    } catch (error) {
      console.error('Error checking in booking:', error);
      toast({
        title: "Σφάλμα",
        description: "Αποτυχία καταγραφής παρουσίας.",
        variant: "destructive",
      });
    }
  };

  const handleCancelBooking = async (bookingId: string, reason: string = '') => {
    try {
      const response = await bookingsApi.update(bookingId, {
        status: 'cancelled',
        cancellation_reason: reason
      });
      const updatedBooking = response.data || response;
      
      setBookings(bookings.map(booking => 
        booking.id === bookingId ? updatedBooking : booking
      ));

      toast({
        title: "Επιτυχία!",
        description: "Η κράτηση ακυρώθηκε.",
      });

      // Notify about graceful cancellation
      notifyGracefulCancellation();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast({
        title: "Σφάλμα",
        description: "Αποτυχία ακύρωσης κράτησης.",
        variant: "destructive",
      });
    }
  };

  const handleConfirmRequest = async () => {
    if (!confirmDialog.request || !confirmData.date || !confirmData.time) {
      toast({
        title: "Σφάλμα",
        description: "Παρακαλώ συμπληρώστε ημερομηνία και ώρα.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await bookingRequestsApi.confirm(confirmDialog.request.id, confirmData);
      
      // Update the request in the list
      setBookingRequests(bookingRequests.map(req => 
        req.id === confirmDialog.request.id ? {...req, status: 'confirmed'} : req
      ));

      // Refresh bookings list to show the new booking
      const bookingsResponse = await bookingsApi.getAll();
      const bookingsData = Array.isArray(bookingsResponse) ? bookingsResponse : (bookingsResponse.data || []);
      setBookings(bookingsData);

      toast({
        title: "Επιτυχία!",
        description: response.message || "Το ραντεβού οριστικοποιήθηκε επιτυχώς.",
      });

      setConfirmDialog({open: false, request: null});
      setConfirmData({date: '', time: '', instructor_id: ''});
    } catch (error) {
      console.error('Error confirming request:', error);
      toast({
        title: "Σφάλμα",
        description: "Αποτυχία οριστικοποίησης ραντεβού.",
        variant: "destructive",
      });
    }
  };

  const handleRejectRequest = async () => {
    if (!rejectDialog.request || !rejectReason) {
      toast({
        title: "Σφάλμα",
        description: "Παρακαλώ εισάγετε λόγο απόρριψης.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await bookingRequestsApi.reject(rejectDialog.request.id, { reason: rejectReason });
      
      // Update the request in the list
      setBookingRequests(bookingRequests.map(req => 
        req.id === rejectDialog.request.id ? {...req, status: 'rejected', rejection_reason: rejectReason} : req
      ));

      toast({
        title: "Επιτυχία!",
        description: response.message || "Το αίτημα απορρίφθηκε.",
      });

      setRejectDialog({open: false, request: null});
      setRejectReason('');
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: "Σφάλμα",
        description: "Αποτυχία απόρριψης αιτήματος.",
        variant: "destructive",
      });
    }
  };

  // Filter bookings based on search term, status, and date
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = searchTerm === "" || 
      booking.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.class_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.instructor?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    
    let matchesDate = true;
    if (selectedDate === "today") {
      matchesDate = booking.date === format(new Date(), "yyyy-MM-dd");
    } else if (selectedDate === "tomorrow") {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      matchesDate = booking.date === format(tomorrow, "yyyy-MM-dd");
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge variant="default" className="bg-green-100 text-green-800">Επιβεβαιωμένη</Badge>;
      case "pending":
        return <Badge variant="secondary">Εκκρεμεί</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Ακυρωμένη</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Ολοκληρωμένη</Badge>;
      case "waitlist":
        return <Badge variant="outline">Λίστα Αναμονής</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "group":
        return <Badge variant="outline">Ομαδικό</Badge>;
      case "personal":
        return <Badge variant="default">Personal Training</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  // Stats calculations
  const todayBookings = bookings.filter(booking => 
    booking.date === format(new Date(), "yyyy-MM-dd")
  );
  const confirmedBookings = todayBookings.filter(booking => booking.status === "confirmed");
  const completedBookings = todayBookings.filter(booking => booking.status === "completed");
  const cancelledBookings = todayBookings.filter(booking => booking.status === "cancelled");

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
                <h1 className="text-3xl font-bold text-foreground">Κρατήσεις</h1>
                <p className="text-muted-foreground">
                  Διαχείριση κρατήσεων και προγραμματισμού μαθημάτων
                </p>
              </div>
              <Dialog open={openDialog === 'new'} onOpenChange={(open) => setOpenDialog(open ? 'new' : null)}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Νέα Κράτηση
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Νέα Κράτηση</DialogTitle>
                    <DialogDescription>
                      Δημιουργήστε μια νέα κράτηση για πελάτη
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div>
                      <label className="text-sm font-medium">Πελάτης (προαιρετικό)</label>
                      <Select value={newBookingData.userId} onValueChange={handleUserChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Επιλέξτε πελάτη" />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name} ({user.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Όνομα *</label>
                      <Input
                        value={newBookingData.customer_name}
                        onChange={(e) => handleInputChange('customer_name', e.target.value)}
                        placeholder="Όνομα πελάτη"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email *</label>
                      <Input
                        type="email"
                        value={newBookingData.customer_email}
                        onChange={(e) => handleInputChange('customer_email', e.target.value)}
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Μάθημα *</label>
                      <Select value={newBookingData.className} onValueChange={(value) => {
                        const selectedClass = classes.find(c => c.name === value);
                        if (selectedClass) {
                          handleInputChange('className', value);
                          handleInputChange('instructor', selectedClass.instructor?.name || selectedClass.instructor);
                        }
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Επιλέξτε μάθημα" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes.map((cls) => (
                            <SelectItem key={cls.id} value={cls.name}>
                              {cls.name} - {cls.instructor?.name || cls.instructor}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Ημερομηνία *</label>
                      <Input
                        type="date"
                        value={newBookingData.date}
                        onChange={(e) => handleInputChange('date', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Ώρα *</label>
                      <Input
                        type="time"
                        value={newBookingData.time}
                        onChange={(e) => handleInputChange('time', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Τύπος *</label>
                      <Select value={newBookingData.type} onValueChange={(value) => handleInputChange('type', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Επιλέξτε τύπο" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="group">Ομαδικό Μάθημα</SelectItem>
                          <SelectItem value="personal">Personal Training</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setOpenDialog(null)}>
                      Ακύρωση
                    </Button>
                    <Button onClick={handleCreateBooking} disabled={isCreating}>
                      {isCreating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Δημιουργία...
                        </>
                      ) : (
                        "Δημιουργία"
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Σημερινές Κρατήσεις</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Φόρτωση...</span>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{todayBookings.length}</div>
                      <p className="text-xs text-muted-foreground">
                        {confirmedBookings.length} επιβεβαιωμένες
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ολοκληρωμένες</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Φόρτωση...</span>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{completedBookings.length}</div>
                      <p className="text-xs text-muted-foreground">
                        σήμερα
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ακυρωμένες</CardTitle>
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Φόρτωση...</span>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{cancelledBookings.length}</div>
                      <p className="text-xs text-muted-foreground">
                        σήμερα
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ποσοστό Παρουσίας</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Φόρτωση...</span>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">
                        {todayBookings.length > 0 ? 
                          Math.round((completedBookings.length / todayBookings.length) * 100) : 0}%
                      </div>
                      <p className="text-xs text-muted-foreground">
                        σήμερα
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Αναζήτηση κρατήσεων..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Κατάσταση" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Όλες οι καταστάσεις</SelectItem>
                  <SelectItem value="confirmed">Επιβεβαιωμένες</SelectItem>
                  <SelectItem value="pending">Εκκρεμείς</SelectItem>
                  <SelectItem value="completed">Ολοκληρωμένες</SelectItem>
                  <SelectItem value="cancelled">Ακυρωμένες</SelectItem>
                  <SelectItem value="waitlist">Λίστα Αναμονής</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedDate} onValueChange={setSelectedDate}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Ημερομηνία" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Όλες οι ημερομηνίες</SelectItem>
                  <SelectItem value="today">Σήμερα</SelectItem>
                  <SelectItem value="tomorrow">Αύριο</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bookings Table */}
            <Tabs defaultValue="bookings" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="bookings">Κρατήσεις</TabsTrigger>
                <TabsTrigger value="requests">Αιτήματα Ραντεβού</TabsTrigger>
              </TabsList>
              
              <TabsContent value="bookings">
                <Card>
                  <CardHeader>
                    <CardTitle>Λίστα Κρατήσεων</CardTitle>
                    <CardDescription>
                      Διαχειριστείτε όλες τις κρατήσεις και το πρόγραμμα των πελατών
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Πελάτης</TableHead>
                          <TableHead>Μάθημα</TableHead>
                          <TableHead>Προπονητής</TableHead>
                          <TableHead>Ημερομηνία & Ώρα</TableHead>
                          <TableHead>Τύπος</TableHead>
                          <TableHead>Κατάσταση</TableHead>
                          <TableHead>Ενέργειες</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredBookings.map((booking) => (
                          <TableRow key={booking.id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={booking.avatar} />
                                  <AvatarFallback>
                                    {booking.customer_name?.slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{booking.customer_name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {booking.customer_email}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{booking.class_name}</div>
                              <div className="text-sm text-muted-foreground">{booking.location}</div>
                            </TableCell>
                            <TableCell>{booking.instructor}</TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>{formatBookingDate(booking.date)}</div>
                                <div className="text-muted-foreground">{formatBookingTime(booking.time)}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {getTypeBadge(booking.type)}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(booking.status)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {booking.status === 'confirmed' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleCheckIn(booking.id)}
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                )}
                                {(booking.status === 'confirmed' || booking.status === 'pending') && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleCancelBooking(booking.id)}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {filteredBookings.length === 0 && !isLoading && (
                      <div className="text-center py-4 text-muted-foreground">
                        Δεν βρέθηκαν κρατήσεις με τα τρέχοντα φίλτρα
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="requests">
                <Card>
                  <CardHeader>
                    <CardTitle>Αιτήματα Ραντεβού EMS/Personal</CardTitle>
                    <CardDescription>
                      Διαχειριστείτε τα αιτήματα για EMS και Personal Training
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Πελάτης</TableHead>
                          <TableHead>Τύπος</TableHead>
                          <TableHead>Προτιμώμενες Ημερομηνίες</TableHead>
                          <TableHead>Μήνυμα</TableHead>
                          <TableHead>Κατάσταση</TableHead>
                          <TableHead>Ημ/νία Αιτήματος</TableHead>
                          <TableHead>Ενέργειες</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bookingRequests.length === 0 && !isLoading ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                              <div className="flex flex-col items-center gap-2">
                                <span className="text-lg font-medium">Δεν υπάρχουν αιτήματα ραντεβού</span>
                                <span className="text-sm">Τα αιτήματα θα εμφανιστούν εδώ όταν υποβληθούν από τους πελάτες</span>
                                <button onClick={() => {
                                  console.warn('🔄 Manual refresh triggered');
                                  window.location.reload();
                                }} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                                  Ανανέωση
                                </button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          bookingRequests.map((request) => (
                            <TableRow key={request.id}>
                              <TableCell>
                                <div className="flex items-center space-x-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback>
                                      {request.customer_name?.slice(0, 2).toUpperCase() || 'XX'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">{request.customer_name}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {request.customer_email}
                                    </div>
                                    {request.customer_phone && (
                                      <div className="text-sm text-muted-foreground">
                                        {request.customer_phone}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {request.type === 'ems' ? (
                                  <Badge variant="outline" className="bg-purple-100 text-purple-800">EMS</Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-blue-100 text-blue-800">Personal</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  {request.preferred_dates?.map((date: string, idx: number) => (
                                    <div key={idx} className="font-medium">{formatBookingDate(date)}</div>
                                  ))}
                                  {request.preferred_times?.length > 0 && (
                                    <div className="text-muted-foreground mt-1">
                                      {request.preferred_times.length === 1 ? 
                                        request.preferred_times[0] :
                                        request.preferred_times.length === 2 ?
                                        `${request.preferred_times[0]} - ${request.preferred_times[1]}` :
                                        request.preferred_times.join(', ')
                                      }
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm max-w-xs truncate" title={request.message}>
                                  {request.message || '-'}
                                </div>
                              </TableCell>
                              <TableCell>
                                {request.status === 'pending' && (
                                  <Badge variant="secondary">Εκκρεμεί</Badge>
                                )}
                                {request.status === 'confirmed' && (
                                  <Badge variant="default" className="bg-green-100 text-green-800">Επιβεβαιωμένο</Badge>
                                )}
                                {request.status === 'rejected' && (
                                  <Badge variant="destructive">Απορρίφθηκε</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  {formatBookingDate(request.created_at)}
                                </div>
                              </TableCell>
                              <TableCell>
                                {request.status === 'pending' && (
                                  <div className="flex items-center space-x-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-green-600 hover:text-green-700"
                                      onClick={() => {
                                        setConfirmDialog({open: true, request});
                                        setConfirmData({
                                          date: request.preferred_dates?.[0] || '',
                                          time: request.preferred_times?.[0] || '',
                                          instructor_id: ''
                                        });
                                      }}
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-red-600 hover:text-red-700"
                                      onClick={() => setRejectDialog({open: true, request})}
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}
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
          </main>
        </div>
      </div>

      {/* Confirm Request Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => !open && setConfirmDialog({open: false, request: null})}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Οριστικοποίηση Ραντεβού</DialogTitle>
            <DialogDescription>
              Επιλέξτε ημερομηνία και ώρα για το ραντεβού {confirmDialog.request?.type === 'ems' ? 'EMS' : 'Personal Training'}
            </DialogDescription>
          </DialogHeader>
          {confirmDialog.request && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Στοιχεία Πελάτη</h4>
                <p className="text-sm"><strong>Όνομα:</strong> {confirmDialog.request.customer_name}</p>
                <p className="text-sm"><strong>Email:</strong> {confirmDialog.request.customer_email}</p>
                {confirmDialog.request.customer_phone && (
                  <p className="text-sm"><strong>Τηλέφωνο:</strong> {confirmDialog.request.customer_phone}</p>
                )}
                {confirmDialog.request.message && (
                  <p className="text-sm mt-2"><strong>Μήνυμα:</strong> {confirmDialog.request.message}</p>
                )}
              </div>
              
              <div>
                <label className="text-sm font-medium">Ημερομηνία *</label>
                <Input
                  type="date"
                  value={confirmData.date}
                  onChange={(e) => setConfirmData({...confirmData, date: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Ώρα *</label>
                <Input
                  type="time"
                  value={confirmData.time}
                  onChange={(e) => setConfirmData({...confirmData, time: e.target.value})}
                />
              </div>
              
              {confirmDialog.request.type === 'personal' && (
                <div>
                  <label className="text-sm font-medium">Προπονητής (προαιρετικό)</label>
                  <Select value={confirmData.instructor_id} onValueChange={(value) => setConfirmData({...confirmData, instructor_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Επιλέξτε προπονητή" />
                    </SelectTrigger>
                    <SelectContent>
                      {instructors.map((instructor) => (
                        <SelectItem key={instructor.id} value={instructor.id}>
                          {instructor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setConfirmDialog({open: false, request: null})}>
              Ακύρωση
            </Button>
            <Button onClick={handleConfirmRequest} className="bg-green-600 hover:bg-green-700">
              Οριστικοποίηση
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Request Dialog */}
      <Dialog open={rejectDialog.open} onOpenChange={(open) => !open && setRejectDialog({open: false, request: null})}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Απόρριψη Αιτήματος</DialogTitle>
            <DialogDescription>
              Εισάγετε τον λόγο απόρριψης του αιτήματος
            </DialogDescription>
          </DialogHeader>
          {rejectDialog.request && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Στοιχεία Αιτήματος</h4>
                <p className="text-sm"><strong>Πελάτης:</strong> {rejectDialog.request.customer_name}</p>
                <p className="text-sm"><strong>Τύπος:</strong> {rejectDialog.request.type === 'ems' ? 'EMS' : 'Personal Training'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium">Λόγος Απόρριψης *</label>
                <textarea
                  className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Εισάγετε τον λόγο απόρριψης..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setRejectDialog({open: false, request: null})}>
              Ακύρωση
            </Button>
            <Button onClick={handleRejectRequest} variant="destructive">
              Απόρριψη
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}