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
  Loader2,
} from "lucide-react";
import { mockClassesData, mockInstructorsData } from "@/data/mockData";
import type { Class, Instructor } from "@/data/mockData";
import { classesApi, instructorsApi } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

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
  const [classes, setClasses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
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
  const { toast } = useToast();

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [classesResponse, instructorsResponse] = await Promise.all([
          classesApi.getAll(),
          instructorsApi.getAll()
        ]);
        
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

  const todaysClasses = classes.filter(
    cls => cls.date === format(new Date(), "yyyy-MM-dd")
  );

  const selectedDateClasses = classes.filter(
    cls => cls.date === format(selectedDate, "yyyy-MM-dd")
  );

  const handleCreateClass = async () => {
    try {
      setIsCreating(true);
      
      const newClassData = {
        name: formData.name,
        type: formData.type,
        instructor_id: formData.instructor,
        date: format(formData.date, "yyyy-MM-dd"),
        time: formData.time,
        duration: formData.duration,
        max_participants: formData.maxParticipants,
        location: formData.location,
        description: formData.description,
      };

      const response = await classesApi.create(newClassData);
      const newClass = response.data || response;
      
      setClasses([...classes, newClass]);
      setIsDialogOpen(false);

      toast({
        title: "Επιτυχία!",
        description: `Το μάθημα ${formData.name} δημιουργήθηκε με επιτυχία.`,
      });

      // Reset form
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
    } catch (error) {
      console.error('Error creating class:', error);
      toast({
        title: "Σφάλμα",
        description: "Αποτυχία δημιουργίας μαθήματος. Παρακαλώ δοκιμάστε ξανά.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
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
                              <SelectItem key={instructor.id} value={instructor.id}>
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
                    <Button onClick={handleCreateClass} disabled={isCreating}>
                      {isCreating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Δημιουργία...
                        </>
                      ) : (
                        "Δημιουργία Μαθήματος"
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
                  <CardTitle className="text-sm font-medium">Σημερινά Μαθήματα</CardTitle>
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Φόρτωση...</span>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{todaysClasses.length}</div>
                      <p className="text-xs text-muted-foreground">
                        {todaysClasses.filter(c => c.status === 'active').length} ενεργά
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Συνολικοί Συμμετέχοντες</CardTitle>
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
                        {todaysClasses.reduce((sum, cls) => sum + (cls.current_participants || cls.currentParticipants || 0), 0)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        από {todaysClasses.reduce((sum, cls) => sum + (cls.max_participants || cls.maxParticipants || 0), 0)} διαθέσιμες θέσεις
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ενεργοί Προπονητές</CardTitle>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Φόρτωση...</span>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{instructors.length}</div>
                      <p className="text-xs text-muted-foreground">
                        διαθέσιμοι σήμερα
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Πληρότητα</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
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
                        {todaysClasses.length > 0 ? 
                          Math.round((todaysClasses.reduce((sum, cls) => sum + (cls.current_participants || cls.currentParticipants || 0), 0) / 
                          todaysClasses.reduce((sum, cls) => sum + (cls.max_participants || cls.maxParticipants || 1), 0)) * 100) : 0}%
                      </div>
                      <p className="text-xs text-muted-foreground">
                        μέσος όρος πληρότητας
                      </p>
                    </>
                  )}
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
                                {cls.instructor?.name || cls.instructor || 'N/A'}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {cls.location}
                              </span>
                            </div>
                          </div>
                          <div className="text-right space-y-1">
                            {getStatusBadge(cls.status, cls.current_participants || cls.currentParticipants || 0, cls.max_participants || cls.maxParticipants || 0)}
                            <div className="text-sm text-muted-foreground">
                              {cls.current_participants || cls.currentParticipants || 0}/{cls.max_participants || cls.maxParticipants || 0}
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
                              {cls.time} - {cls.instructor?.name || cls.instructor || 'N/A'}
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
                        <TableCell>
                          {cls.instructor?.name || cls.instructor || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{cls.date}</div>
                            <div className="text-muted-foreground">{cls.time}</div>
                          </div>
                        </TableCell>
                        <TableCell>{cls.location}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {cls.current_participants || cls.currentParticipants || 0}/{cls.max_participants || cls.maxParticipants || 0}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(cls.status, cls.current_participants || cls.currentParticipants || 0, cls.max_participants || cls.maxParticipants || 0)}
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