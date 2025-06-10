import { useState } from "react";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { el } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Users,
  Edit,
  Trash2,
  MapPin,
  User,
} from "lucide-react";

// Mock data για μαθήματα
const mockClasses = [
  {
    id: "1",
    name: "HIIT Blast",
    type: "group",
    instructor: "Άλεξ Ροδρίγκεζ",
    date: "2024-05-24",
    time: "09:00",
    duration: 45,
    maxParticipants: 12,
    currentParticipants: 8,
    location: "Main Floor",
    description: "Υψηλή ένταση καρδιοαγγειακής προπόνησης",
    status: "active",
  },
  {
    id: "2",
    name: "Yoga Flow",
    type: "group",
    instructor: "Εμιλι Τσεν",
    date: "2024-05-24",
    time: "18:00",
    duration: 60,
    maxParticipants: 15,
    currentParticipants: 12,
    location: "Studio A",
    description: "Ρελακσάρισμα και ευελιξία",
    status: "active",
  },
  {
    id: "3",
    name: "Personal Training",
    type: "personal",
    instructor: "Τζέιμς Τέιλορ",
    date: "2024-05-24",
    time: "16:00",
    duration: 60,
    maxParticipants: 1,
    currentParticipants: 1,
    location: "Weight Room",
    description: "Εξατομικευμένη προπόνηση δύναμης",
    status: "booked",
  },
];

const instructors = [
  { id: "1", name: "Άλεξ Ροδρίγκεζ", specialties: ["HIIT", "Strength"] },
  { id: "2", name: "Εμιλι Τσεν", specialties: ["Yoga", "Pilates"] },
  { id: "3", name: "Τζέιμς Τέιλορ", specialties: ["Personal Training", "Powerlifting"] },
  { id: "4", name: "Σάρα Τζόνσον", specialties: ["Group Fitness", "Cardio"] },
  { id: "5", name: "Μάρκους Ουίλιαμς", specialties: ["CrossFit", "Olympic Lifting"] },
];

const classTypes = [
  { value: "group", label: "Ομαδικό Μάθημα" },
  { value: "personal", label: "Personal Training" },
  { value: "ems", label: "EMS Training" },
  { value: "pilates", label: "Pilates" },
];

const timeSlots = [
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
  "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00", "21:00", "22:00"
];

export function ClassesPage() {
  const [classes, setClasses] = useState(mockClasses);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    instructor: "",
    date: new Date(),
    time: "",
    duration: 60,
    maxParticipants: 12,
    location: "",
    description: "",
  });

  const todaysClasses = classes.filter(
    cls => cls.date === format(new Date(), "yyyy-MM-dd")
  );

  const selectedDateClasses = classes.filter(
    cls => cls.date === format(selectedDate, "yyyy-MM-dd")
  );

  const handleCreateClass = () => {
    const newClass = {
      id: Date.now().toString(),
      name: formData.name,
      type: formData.type,
      instructor: formData.instructor,
      date: format(formData.date, "yyyy-MM-dd"),
      time: formData.time,
      duration: formData.duration,
      maxParticipants: formData.maxParticipants,
      currentParticipants: 0,
      location: formData.location,
      description: formData.description,
      status: "active",
    };

    setClasses([...classes, newClass]);
    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "",
      instructor: "",
      date: new Date(),
      time: "",
      duration: 60,
      maxParticipants: 12,
      location: "",
      description: "",
    });
  };

  const getStatusBadge = (status: string, current: number, max: number) => {
    if (status === "cancelled") {
      return <Badge variant="destructive">Ακυρώθηκε</Badge>;
    }
    if (current >= max) {
      return <Badge variant="secondary">Πλήρες</Badge>;
    }
    if (current === 0) {
      return <Badge variant="outline">Διαθέσιμο</Badge>;
    }
    return <Badge variant="default" className="bg-green-100 text-green-800">Ενεργό</Badge>;
  };

  const getTypeLabel = (type: string) => {
    const typeObj = classTypes.find(t => t.value === type);
    return typeObj?.label || type;
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
                <h1 className="text-3xl font-bold text-foreground">Διαχείριση Μαθημάτων</h1>
                <p className="text-muted-foreground">
                  Δημιουργία προγραμμάτων, ωραρίων και διαχείριση slots
                </p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Νέο Μάθημα
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Δημιουργία Νέου Μαθήματος</DialogTitle>
                    <DialogDescription>
                      Δημιουργήστε ένα νέο slot για μάθημα ή προπόνηση
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Όνομα Μαθήματος *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          placeholder="π.χ. HIIT Blast"
                        />
                      </div>
                      <div>
                        <Label htmlFor="type">Τύπος *</Label>
                        <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Επιλέξτε τύπο" />
                          </SelectTrigger>
                          <SelectContent>
                            {classTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="instructor">Προπονητής *</Label>
                        <Select value={formData.instructor} onValueChange={(value) => setFormData({...formData, instructor: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Επιλέξτε προπονητή" />
                          </SelectTrigger>
                          <SelectContent>
                            {instructors.map((instructor) => (
                              <SelectItem key={instructor.id} value={instructor.name}>
                                {instructor.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="location">Χώρος *</Label>
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => setFormData({...formData, location: e.target.value})}
                          placeholder="π.χ. Main Floor, Studio A"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Ημερομηνία *</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !formData.date && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.date ? format(formData.date, "dd/MM/yyyy", { locale: el }) : "Επιλέξτε ημερομηνία"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={formData.date}
                              onSelect={(date) => date && setFormData({...formData, date})}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div>
                        <Label htmlFor="time">Ώρα *</Label>
                        <Select value={formData.time} onValueChange={(value) => setFormData({...formData, time: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Ώρα" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeSlots.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="duration">Διάρκεια (λεπτά)</Label>
                        <Input
                          id="duration"
                          type="number"
                          value={formData.duration}
                          onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                          placeholder="60"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="maxParticipants">Μέγιστοι Συμμετέχοντες</Label>
                      <Input
                        id="maxParticipants"
                        type="number"
                        value={formData.maxParticipants}
                        onChange={(e) => setFormData({...formData, maxParticipants: parseInt(e.target.value)})}
                        placeholder="12"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Περιγραφή</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Περιγραφή του μαθήματος..."
                        rows={3}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Ακύρωση
                    </Button>
                    <Button onClick={handleCreateClass}>
                      Δημιουργία Μαθήματος
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Σημερινά Μαθήματα</CardTitle>
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{todaysClasses.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {todaysClasses.filter(c => c.status === 'active').length} ενεργά
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Συνολικοί Συμμετέχοντες</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {todaysClasses.reduce((sum, cls) => sum + cls.currentParticipants, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    από {todaysClasses.reduce((sum, cls) => sum + cls.maxParticipants, 0)} διαθέσιμες θέσεις
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ενεργοί Προπονητές</CardTitle>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{instructors.length}</div>
                  <p className="text-xs text-muted-foreground">
                    διαθέσιμοι σήμερα
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Πληρότητα</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {todaysClasses.length > 0 ? 
                      Math.round((todaysClasses.reduce((sum, cls) => sum + cls.currentParticipants, 0) / 
                      todaysClasses.reduce((sum, cls) => sum + cls.maxParticipants, 0)) * 100) : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    μέσος όρος πληρότητας
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Daily Schedule */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Today's Classes */}
              <Card>
                <CardHeader>
                  <CardTitle>Σημερινό Πρόγραμμα</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {todaysClasses.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        Δεν υπάρχουν μαθήματα για σήμερα
                      </p>
                    ) : (
                      todaysClasses.map((cls) => (
                        <div key={cls.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="space-y-1">
                            <div className="font-medium">{cls.name}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {cls.time} ({cls.duration}')
                              </span>
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {cls.instructor}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {cls.location}
                              </span>
                            </div>
                          </div>
                          <div className="text-right space-y-1">
                            {getStatusBadge(cls.status, cls.currentParticipants, cls.maxParticipants)}
                            <div className="text-sm text-muted-foreground">
                              {cls.currentParticipants}/{cls.maxParticipants}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Calendar View */}
              <Card>
                <CardHeader>
                  <CardTitle>Επιλογή Ημερομηνίας</CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className="rounded-md border"
                  />
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">
                      Μαθήματα για {format(selectedDate, "dd/MM/yyyy", { locale: el })}
                    </h4>
                    <div className="space-y-2">
                      {selectedDateClasses.length === 0 ? (
                        <p className="text-muted-foreground text-sm">
                          Δεν υπάρχουν μαθήματα για αυτή την ημερομηνία
                        </p>
                      ) : (
                        selectedDateClasses.map((cls) => (
                          <div key={cls.id} className="text-sm p-2 bg-muted rounded">
                            <div className="font-medium">{cls.name}</div>
                            <div className="text-muted-foreground">
                              {cls.time} - {cls.instructor}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* All Classes Table */}
            <Card>
              <CardHeader>
                <CardTitle>Όλα τα Μαθήματα</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Μάθημα</TableHead>
                      <TableHead>Τύπος</TableHead>
                      <TableHead>Προπονητής</TableHead>
                      <TableHead>Ημερομηνία & Ώρα</TableHead>
                      <TableHead>Χώρος</TableHead>
                      <TableHead>Συμμετέχοντες</TableHead>
                      <TableHead>Κατάσταση</TableHead>
                      <TableHead>Ενέργειες</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classes.map((cls) => (
                      <TableRow key={cls.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{cls.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {cls.duration} λεπτά
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{getTypeLabel(cls.type)}</Badge>
                        </TableCell>
                        <TableCell>{cls.instructor}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{cls.date}</div>
                            <div className="text-muted-foreground">{cls.time}</div>
                          </div>
                        </TableCell>
                        <TableCell>{cls.location}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {cls.currentParticipants}/{cls.maxParticipants}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(cls.status, cls.currentParticipants, cls.maxParticipants)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="ghost">
                              <Edit className="h-4 w-4" />
                            </Button>
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
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
} 