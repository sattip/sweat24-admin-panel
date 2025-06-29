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
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { el } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { bookingsApi, usersApi, classesApi, instructorsApi } from "@/services/api";
import type { Booking, User as UserType, Class, Instructor } from "@/data/mockData";
import { notifyGracefulCancellation } from "@/utils/notifications";

type DialogType = 'transfer' | 'new' | null;

export function BookingsPage() {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [instructors, setInstructors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState("today");
  
  const [openDialog, setOpenDialog] = useState<DialogType>(null);
  
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
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [bookingsResponse, usersResponse, classesResponse, instructorsResponse] = await Promise.all([
          bookingsApi.getAll(),
          usersApi.getAll(),
          classesApi.getAll(),
          instructorsApi.getAll()
        ]);
        
        setBookings(bookingsResponse.data || bookingsResponse || []);
        setUsers(usersResponse.data || usersResponse || []);
        setClasses(classesResponse.data || classesResponse || []);
        setInstructors(instructorsResponse.data || instructorsResponse || []);
      } catch (error) {
        console.error('Error fetching data:', error);
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

  const handleDeleteBooking = async (bookingId: string) => {
    try {
      setIsDeleting(bookingId);
      
      await bookingsApi.delete(bookingId);
      setBookings(bookings.filter(booking => booking.id !== bookingId));

      toast({
        title: "Επιτυχία!",
        description: "Η κράτηση διαγράφηκε οριστικά.",
      });
    } catch (error) {
      console.error('Error deleting booking:', error);
      toast({
        title: "Σφάλμα",
        description: "Αποτυχία διαγραφής κράτησης.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  // Filter bookings based on search term, status, and date
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = searchTerm === "" || 
      (booking.customer_name || booking.customerName)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking.class_name || booking.className)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
        return <Badge variant="default">Personal</Badge>;
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
                                {(booking.customer_name || booking.customerName)?.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{booking.customer_name || booking.customerName}</div>
                              <div className="text-sm text-muted-foreground">
                                {booking.customer_email || booking.customerEmail}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{booking.class_name || booking.className}</div>
                          <div className="text-sm text-muted-foreground">{booking.location}</div>
                        </TableCell>
                        <TableCell>{booking.instructor}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{booking.date}</div>
                            <div className="text-muted-foreground">{booking.time}</div>
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
                            {booking.status === 'cancelled' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteBooking(booking.id)}
                                disabled={isDeleting === booking.id}
                              >
                                {isDeleting === booking.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
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
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}