import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminHeader } from "@/components/AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  AlertCircle,
  User,
  MapPin,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { el } from "date-fns/locale";

// Mock data για κρατήσεις
const mockBookings = [
  {
    id: "1",
    customerName: "Γιάννης Παπαδόπουλος",
    customerEmail: "giannis@email.com",
    className: "HIIT Blast",
    instructor: "Άλεξ Ροδρίγκεζ",
    date: "2024-05-24",
    time: "09:00",
    status: "confirmed",
    type: "group",
    attended: null,
    bookingTime: "2024-05-23T14:30:00",
    location: "Main Floor",
    avatar: null,
  },
  {
    id: "2",
    customerName: "Μαρία Κωνσταντίνου",
    customerEmail: "maria@email.com",
    className: "Yoga Flow",
    instructor: "Εμιλι Τσεν",
    date: "2024-05-24",
    time: "18:00",
    status: "confirmed",
    type: "group",
    attended: true,
    bookingTime: "2024-05-22T10:15:00",
    location: "Studio A",
    avatar: null,
  },
  {
    id: "3",
    customerName: "Κώστας Δημητρίου",
    customerEmail: "kostas@email.com",
    className: "Personal Training",
    instructor: "Τζέιμς Τέιλορ",
    date: "2024-05-23",
    time: "16:00",
    status: "cancelled",
    type: "personal",
    attended: false,
    bookingTime: "2024-05-20T09:45:00",
    location: "Weight Room",
    avatar: null,
    cancellationReason: "Ακύρωση εντός 6 ωρών - χρεώθηκε",
  },
  {
    id: "4",
    customerName: "Άννα Γεωργίου",
    customerEmail: "anna@email.com",
    className: "Pilates",
    instructor: "Εμιλι Τσεν",
    date: "2024-05-24",
    time: "10:00",
    status: "waitlist",
    type: "group",
    attended: null,
    bookingTime: "2024-05-24T08:30:00",
    location: "Studio B",
    avatar: null,
  },
];

const attendanceData = [
  {
    id: "1",
    customerName: "Γιάννης Παπαδόπουλος",
    sessionsThisMonth: 12,
    totalSessions: 45,
    lastVisit: "2024-05-23",
    favoriteClass: "HIIT Blast",
    attendanceRate: 85,
  },
  {
    id: "2",
    customerName: "Μαρία Κωνσταντίνου",
    sessionsThisMonth: 8,
    totalSessions: 32,
    lastVisit: "2024-05-24",
    favoriteClass: "Yoga Flow",
    attendanceRate: 92,
  },
  {
    id: "3",
    customerName: "Κώστας Δημητρίου",
    sessionsThisMonth: 5,
    totalSessions: 28,
    lastVisit: "2024-05-20",
    favoriteClass: "Strength Training",
    attendanceRate: 68,
  },
];

export function BookingsPage() {
  const [bookings, setBookings] = useState(mockBookings);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState("today");

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch = 
      booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    
    const matchesDate = selectedDate === "all" || 
      (selectedDate === "today" && booking.date === format(new Date(), "yyyy-MM-dd")) ||
      (selectedDate === "upcoming" && new Date(booking.date) > new Date());
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge variant="default" className="bg-green-100 text-green-800">Επιβεβαιωμένη</Badge>;
      case "pending":
        return <Badge variant="secondary">Εκκρεμής</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Ακυρώθηκε</Badge>;
      case "waitlist":
        return <Badge variant="outline" className="bg-orange-100 text-orange-800">Λίστα Αναμονής</Badge>;
      case "completed":
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Ολοκληρώθηκε</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getAttendanceBadge = (attended: boolean | null) => {
    if (attended === null) return <Badge variant="outline">Εκκρεμής</Badge>;
    if (attended) return <Badge variant="default" className="bg-green-100 text-green-800">Παρών</Badge>;
    return <Badge variant="destructive">Απών</Badge>;
  };

  const markAttendance = (bookingId: string, attended: boolean) => {
    setBookings(bookings.map(booking => {
      if (booking.id === bookingId) {
        return {
          ...booking,
          attended,
          status: attended ? "completed" : "confirmed"
        };
      }
      return booking;
    }));
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
          <main className="flex-1 p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Κρατήσεις & Παρουσίες</h1>
                <p className="text-muted-foreground">
                  Διαχείριση κρατήσεων, παρουσιών και λίστας αναμονής
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
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
                    επόμενες ημέρες
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Λίστα Αναμονής</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{waitlistBookings.length}</div>
                  <p className="text-xs text-muted-foreground">
                    αναμένουν διαθεσιμότητα
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ποσοστό Παρουσιών</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">87%</div>
                  <p className="text-xs text-muted-foreground">
                    μέσος όρος μηνός
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Φίλτρα Αναζήτησης</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Αναζήτηση πελάτη, μαθήματος..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Κατάσταση" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Όλες</SelectItem>
                      <SelectItem value="confirmed">Επιβεβαιωμένες</SelectItem>
                      <SelectItem value="pending">Εκκρεμείς</SelectItem>
                      <SelectItem value="cancelled">Ακυρωμένες</SelectItem>
                      <SelectItem value="waitlist">Λίστα Αναμονής</SelectItem>
                      <SelectItem value="completed">Ολοκληρωμένες</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedDate} onValueChange={setSelectedDate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Χρονικό διάστημα" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Όλες</SelectItem>
                      <SelectItem value="today">Σήμερα</SelectItem>
                      <SelectItem value="upcoming">Επερχόμενες</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    Εξαγωγή Δεδομένων
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Main Content Tabs */}
            <Tabs defaultValue="bookings" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="bookings">Κρατήσεις</TabsTrigger>
                <TabsTrigger value="attendance">Παρουσίες</TabsTrigger>
              </TabsList>

              {/* Bookings Tab */}
              <TabsContent value="bookings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Λίστα Κρατήσεων</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Πελάτης</TableHead>
                          <TableHead>Μάθημα</TableHead>
                          <TableHead>Προπονητής</TableHead>
                          <TableHead>Ημερομηνία & Ώρα</TableHead>
                          <TableHead>Κατάσταση</TableHead>
                          <TableHead>Παρουσία</TableHead>
                          <TableHead>Ενέργειες</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredBookings.map((booking) => (
                          <TableRow key={booking.id}>
                            <TableCell className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarImage src={booking.avatar} />
                                <AvatarFallback>
                                  {booking.customerName.split(" ").map(n => n[0]).join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{booking.customerName}</div>
                                <div className="text-sm text-muted-foreground">
                                  {booking.customerEmail}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{booking.className}</div>
                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {booking.location}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {booking.instructor}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>{booking.date}</div>
                                <div className="text-muted-foreground">{booking.time}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(booking.status)}
                              {booking.cancellationReason && (
                                <div className="text-xs text-red-600 mt-1">
                                  {booking.cancellationReason}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              {booking.status === "confirmed" || booking.status === "completed" ? (
                                <div className="space-y-1">
                                  {getAttendanceBadge(booking.attended)}
                                  {booking.attended === null && (
                                    <div className="flex space-x-1">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-6 text-xs bg-green-50 hover:bg-green-100"
                                        onClick={() => markAttendance(booking.id, true)}
                                      >
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Παρών
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-6 text-xs bg-red-50 hover:bg-red-100"
                                        onClick={() => markAttendance(booking.id, false)}
                                      >
                                        <XCircle className="h-3 w-3 mr-1" />
                                        Απών
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-sm">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button size="sm" variant="ghost">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                {booking.status === "waitlist" && (
                                  <Button size="sm" variant="ghost" className="text-green-600">
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button size="sm" variant="ghost">
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

              {/* Attendance Tab */}
              <TabsContent value="attendance" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Στατιστικά Παρουσιών</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Πελάτης</TableHead>
                          <TableHead>Συνεδρίες Μήνα</TableHead>
                          <TableHead>Συνολικές Συνεδρίες</TableHead>
                          <TableHead>Τελευταία Επίσκεψη</TableHead>
                          <TableHead>Αγαπημένο Μάθημα</TableHead>
                          <TableHead>Ποσοστό Παρουσιών</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {attendanceData.map((data) => (
                          <TableRow key={data.id}>
                            <TableCell className="font-medium">{data.customerName}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{data.sessionsThisMonth}</Badge>
                            </TableCell>
                            <TableCell>{data.totalSessions}</TableCell>
                            <TableCell>{data.lastVisit}</TableCell>
                            <TableCell>{data.favoriteClass}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <div className="text-sm font-medium">{data.attendanceRate}%</div>
                                <div className="w-16 h-2 bg-muted rounded">
                                  <div 
                                    className={`h-full rounded ${
                                      data.attendanceRate >= 80 ? 'bg-green-500' :
                                      data.attendanceRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${data.attendanceRate}%` }}
                                  />
                                </div>
                              </div>
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