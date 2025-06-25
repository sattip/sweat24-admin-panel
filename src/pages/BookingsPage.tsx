import { useState } from "react";
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
} from "lucide-react";
import { format } from "date-fns";
import { el } from "date-fns/locale";
import { useToast } from "@/components/ui/use-toast";
import { mockBookingsData, mockUsersData, mockClassesData, mockInstructorsData } from "@/data/mockData";
import type { Booking, User as UserType, Class, Instructor } from "@/data/mockData";
import { notifyGracefulCancellation } from "@/utils/notifications";

type DialogType = 'transfer' | 'new' | null;

export function BookingsPage() {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>(mockBookingsData);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState("today");
  
  const [openDialog, setOpenDialog] = useState<DialogType>(null);
  
  // State for transfer
  const [transferTargetUser, setTransferTargetUser] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // State for new booking
  const [newBookingData, setNewBookingData] = useState({
    userId: '',
    className: '',
    instructor: '',
    date: '',
    time: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setNewBookingData(prev => ({...prev, [field]: value}));
  };

  const handleClassChange = (classId: string) => {
    const selectedClass = mockClassesData.find(c => c.id === classId);
    if (!selectedClass) return;

    setNewBookingData(prev => ({
      ...prev,
      className: selectedClass.name,
      // Automatically set instructor from the selected class
      instructor: selectedClass.instructor,
    }));
  };

  const handleCreateBooking = () => {
    const { userId, className, date, time } = newBookingData;
    const user = mockUsersData.find(u => u.id === userId);

    if (!user || !className || !date || !time) {
        toast({ title: "Σφάλμα", description: "Παρακαλώ συμπληρώστε όλα τα απαραίτητα πεδία.", variant: "destructive"});
        return;
    }

    const newBooking: Booking = {
        id: `booking_${Date.now()}`,
        userId: user.id,
        customerName: user.name,
        customerEmail: user.email,
        className: className,
        instructor: newBookingData.instructor || "Δεν ορίστηκε",
        date: date,
        time: time,
        status: 'confirmed',
        type: className.toLowerCase().includes('personal') ? 'personal' : 'group',
        attended: null,
        bookingTime: new Date().toISOString(),
        location: "Main Floor",
        avatar: user.avatar,
    };

    setBookings(prev => [newBooking, ...prev]);
    toast({ title: "Επιτυχής Δημιουργία", description: `Η κράτηση για τον/την ${user.name} δημιουργήθηκε.`});
    
    setNewBookingData({ userId: '', className: '', instructor: '', date: '', time: '' });
    setOpenDialog(null);
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch = 
      booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    
    const today = new Date();
    today.setHours(0,0,0,0);
    const bookingDate = new Date(booking.date);
    bookingDate.setHours(0,0,0,0);
    
    const matchesDate = selectedDate === "all" || 
      (selectedDate === "today" && bookingDate.getTime() === today.getTime()) ||
      (selectedDate === "upcoming" && bookingDate > today);
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed": return <Badge variant="default" className="bg-green-100 text-green-800">Επιβεβαιωμένη</Badge>;
      case "pending": return <Badge variant="secondary">Εκκρεμής</Badge>;
      case "cancelled": return <Badge variant="destructive">Ακυρώθηκε</Badge>;
      case "waitlist": return <Badge variant="outline" className="bg-orange-100 text-orange-800">Λίστα Αναμονής</Badge>;
      case "completed": return <Badge variant="default" className="bg-blue-100 text-blue-800">Ολοκληρώθηκε</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getAttendanceBadge = (attended: boolean | null) => {
    if (attended === null) return <Badge variant="outline">Εκκρεμής</Badge>;
    if (attended) return <Badge variant="default" className="bg-green-100 text-green-800">Παρών</Badge>;
    return <Badge variant="destructive">Απών</Badge>;
  };

  const markAttendance = (bookingId: string, attended: boolean) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    if (attended) {
        const user = mockUsersData.find(u => u.id === booking.userId);
        if (!user) {
            toast({ title: "Σφάλμα", description: "Δεν βρέθηκε ο χρήστης για αυτή την κράτηση.", variant: "destructive" });
            return;
        }
        const activePackage = user.packages.find(p => p.status === 'active' && p.remainingSessions > 0);
        if (activePackage) {
            activePackage.remainingSessions--;
            user.activityLog.push({ date: format(new Date(), "yyyy-MM-dd"), action: `Check-in: ${booking.className}` });
            setBookings(prevBookings => prevBookings.map(b => b.id === bookingId ? { ...b, attended: true, status: 'completed' } : b));
            toast({ title: "Επιτυχές Check-in", description: `1 συνεδρία αφαιρέθηκε. Απομένουν ${activePackage.remainingSessions}.` });
        } else {
            toast({ title: "Αποτυχία Check-in", description: "Δεν βρέθηκε ενεργό πακέτο.", variant: "destructive" });
            return;
        }
    } else {
        setBookings(prevBookings => prevBookings.map(b => b.id === bookingId ? { ...b, attended: false } : b));
        toast({ title: "Καταγραφή Απουσίας", description: "Ο πελάτης σημειώθηκε ως απών.", variant: "destructive" });
    }
  };

  const handleTransfer = () => {
    if (!selectedBooking || !transferTargetUser) return;
    const fromUser = mockUsersData.find(u => u.id === selectedBooking.userId);
    const toUser = mockUsersData.find(u => u.id === transferTargetUser);
    if (!fromUser || !toUser) {
        toast({ title: "Σφάλμα", description: "Δεν βρέθηκε ο χρήστης.", variant: "destructive" });
        return;
    }
    setBookings(prevBookings => prevBookings.map(b => b.id === selectedBooking.id ? { ...b, userId: toUser.id, customerName: toUser.name, customerEmail: toUser.email, avatar: toUser.avatar } : b));
    fromUser.activityLog.push({ date: format(new Date(), "yyyy-MM-dd"), action: `Μεταφορά κράτησης '${selectedBooking.className}' στον χρήστη ${toUser.name}` });
    toUser.activityLog.push({ date: format(new Date(), "yyyy-MM-dd"), action: `Λήψη κράτησης '${selectedBooking.className}' από τον χρήστη ${fromUser.name}` });
    toast({ title: "Επιτυχής Μεταφορά", description: `Η κράτηση μεταφέρθηκε στον ${toUser.name}.` });
    setOpenDialog(null);
    setSelectedBooking(null);
    setTransferTargetUser(null);
  };

  const handleCancelBooking = (booking: Booking, reason: string = "Ακύρωση από προπονητή") => {
    setBookings(prevBookings => prevBookings.map(b => 
      b.id === booking.id ? { ...b, status: 'cancelled', cancellationReason: reason } : b
    ));

    // Στέλνουμε ειδοποίηση στον ιδιοκτήτη για χαριστική ακύρωση
    notifyGracefulCancellation(
      booking.instructor,
      booking.customerName,
      booking.id,
      booking.className
    );

    toast({ 
      title: "Κράτηση Ακυρώθηκε", 
      description: `Η κράτηση ακυρώθηκε και ο ιδιοκτήτης ενημερώθηκε.`,
      variant: "default"
    });
  };

  const todaysBookings = bookings.filter(b => b.date === format(new Date(), "yyyy-MM-dd"));
  const upcomingBookings = bookings.filter(b => new Date(b.date) > new Date());
  const waitlistBookings = bookings.filter(b => b.status === "waitlist");

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <AdminHeader />
          <Dialog open={openDialog !== null} onOpenChange={() => setOpenDialog(null)}>
            <main className="flex-1 p-6 space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Κρατήσεις & Check-in</h1>
                  <p className="text-muted-foreground">Διαχείριση κρατήσεων και καταγραφή παρουσίας πελατών.</p>
                </div>
                <Button onClick={() => setOpenDialog('new')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Νέα Κράτηση
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Σημερινές Κρατήσεις</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{todaysBookings.length}</div>
                    <p className="text-xs text-muted-foreground">
                      {todaysBookings.filter(b => b.status === 'confirmed').length} επιβεβαιωμένες
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Επερχόμενες</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{upcomingBookings.length}</div>
                    <p className="text-xs text-muted-foreground">
                      στις επόμενες 7 ημέρες
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Σε Λίστα Αναμονής</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{waitlistBookings.length}</div>
                     <p className="text-xs text-muted-foreground">
                      αναμένουν για μια θέση
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Λίστα Κρατήσεων</CardTitle>
                        <div className="flex items-center gap-2">
                            <div className="relative w-64">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    placeholder="Αναζήτηση πελάτη, μαθήματος..." 
                                    className="pl-8"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Select value={selectedDate} onValueChange={setSelectedDate}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Επιλογή Ημερομηνίας" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Όλες</SelectItem>
                                    <SelectItem value="today">Σήμερα</SelectItem>
                                    <SelectItem value="upcoming">Επερχόμενες</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Κατάσταση" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Όλες</SelectItem>
                                    <SelectItem value="confirmed">Επιβεβαιωμένες</SelectItem>
                                    <SelectItem value="pending">Εκκρεμείς</SelectItem>
                                    <SelectItem value="cancelled">Ακυρωμένες</SelectItem>
                                    <SelectItem value="waitlist">Λίστα Αναμονής</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Πελάτης</TableHead>
                          <TableHead>Μάθημα/Υπηρεσία</TableHead>
                          <TableHead>Ημερομηνία & Ώρα</TableHead>
                          <TableHead>Κατάσταση</TableHead>
                          <TableHead className="text-center">Παρουσία</TableHead>
                          <TableHead className="text-right">Ενέργειες</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredBookings.map((booking) => (
                          <TableRow key={booking.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={booking.avatar ?? undefined} />
                                  <AvatarFallback>{booking.customerName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{booking.customerName}</div>
                                  <div className="text-sm text-muted-foreground">{booking.customerEmail}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>{booking.className}</div>
                              <div className="text-sm text-muted-foreground">{booking.instructor}</div>
                            </TableCell>
                            <TableCell>{format(new Date(booking.date), "dd/MM/yyyy")} στις {booking.time}</TableCell>
                            <TableCell>{getStatusBadge(booking.status)}</TableCell>
                            <TableCell className="text-center">{getAttendanceBadge(booking.attended)}</TableCell>
                            <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button variant="outline" size="icon" onClick={() => markAttendance(booking.id, true)} disabled={booking.attended !== null || booking.status === 'cancelled'} title="Check-in">
                                      <CheckCircle className="h-4 w-4 text-green-600"/>
                                  </Button>
                                  <Button variant="outline" size="icon" onClick={() => markAttendance(booking.id, false)} disabled={booking.attended !== null || booking.status === 'cancelled'} title="Απών">
                                      <XCircle className="h-4 w-4 text-red-600"/>
                                  </Button>
                                  <Button variant="outline" size="icon" onClick={() => { setSelectedBooking(booking); setOpenDialog('transfer'); }} disabled={booking.status === 'cancelled'} title="Μεταφορά">
                                      <ArrowRightLeft className="h-4 w-4"/>
                                  </Button>
                                  <Button variant="outline" size="icon" onClick={() => handleCancelBooking(booking)} disabled={booking.status === 'cancelled'} title="Ακύρωση">
                                      <X className="h-4 w-4 text-red-600"/>
                                  </Button>
                                </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
              </Card>

              <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
                {openDialog === 'new' && (
                  <>
                    <DialogHeader><DialogTitle>Νέα Κράτηση</DialogTitle><DialogDescription>Προσθέστε έναν πελάτη σε ένα μάθημα ή ραντεβού.</DialogDescription></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Select onValueChange={(value) => handleInputChange('userId', value)}><SelectTrigger><SelectValue placeholder="Επιλογή Πελάτη" /></SelectTrigger><SelectContent>{mockUsersData.map(user => (<SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>))}</SelectContent></Select>
                        
                        <Select onValueChange={handleClassChange}>
                          <SelectTrigger><SelectValue placeholder="Επιλογή Μαθήματος" /></SelectTrigger>
                          <SelectContent>
                            {mockClassesData.map(c => (
                              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select onValueChange={(value) => handleInputChange('instructor', value)} value={newBookingData.instructor}>
                          <SelectTrigger><SelectValue placeholder="Επιλογή Προπονητή" /></SelectTrigger>
                          <SelectContent>
                            {mockInstructorsData.map(instructor => (
                              <SelectItem key={instructor.id} value={instructor.name}>{instructor.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <Input type="date" value={newBookingData.date} onChange={(e) => handleInputChange('date', e.target.value)} />
                          <Input type="time" value={newBookingData.time} onChange={(e) => handleInputChange('time', e.target.value)} />
                        </div>
                    </div>
                    <Button onClick={handleCreateBooking}>Δημιουργία Κράτησης</Button>
                  </>
                )}
                {openDialog === 'transfer' && (
                  <>
                    <DialogHeader><DialogTitle>Μεταφορά Κράτησης</DialogTitle><DialogDescription>Επιλέξτε σε ποιον πελάτη θα μεταφερθεί η κράτηση για το μάθημα "{selectedBooking?.className}".</DialogDescription></DialogHeader>
                    <div className="py-4">
                        <Select onValueChange={setTransferTargetUser}><SelectTrigger><SelectValue placeholder="Επιλογή Πελάτη..." /></SelectTrigger><SelectContent>{mockUsersData.filter(user => user.id !== selectedBooking?.userId).map(user => (<SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>))}</SelectContent></Select>
                    </div>
                    <Button onClick={handleTransfer} disabled={!transferTargetUser}>Επιβεβαίωση Μεταφοράς</Button>
                  </>
                )}
              </DialogContent>
            </main>
          </Dialog>
        </div>
      </div>
    </SidebarProvider>
  );
} 