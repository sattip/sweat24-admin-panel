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
  DialogFooter,
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
import MatrixViewCalendar from "@/components/MatrixViewCalendar";
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
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
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
        
        const classesData = classesResponse.data || classesResponse || [];
        const instructorsData = instructorsResponse.data || instructorsResponse || [];
        
        console.log('ClassesPage - Raw classes data:', classesData);
        console.log('ClassesPage - Raw instructors data:', instructorsData);
        
        setClasses(classesData);
        setInstructors(instructorsData);
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

  const handleEditClass = (cls: any) => {
    setEditingClass(cls);
    setFormData({
      name: cls.name || cls.class_type || "",
      type: cls.type || "group",
      instructor: cls.instructor || cls.trainer_id || "",
      date: new Date(cls.date),
      time: cls.time || cls.start_time || "",
      duration: cls.duration || 60,
      maxParticipants: cls.max_participants || cls.maxParticipants || 12,
      location: cls.location || "Studio 1",
      description: cls.description || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClass = async (classId: number) => {
    try {
      await classesApi.delete(classId.toString());
      setClasses(classes.filter(c => c.id !== classId));
      toast({
        title: "Επιτυχία!",
        description: "Το μάθημα διαγράφηκε με επιτυχία.",
      });
    } catch (error) {
      console.error('Error deleting class:', error);
      toast({
        title: "Σφάλμα",
        description: "Αποτυχία διαγραφής μαθήματος.",
        variant: "destructive",
      });
    }
  };

  const handleCreateClass = async () => {
    try {
      setIsCreating(true);
      
      const newClassData = {
        name: formData.name,
        type: formData.type,
        instructor: formData.instructor, // Changed from instructor_id to instructor
        date: format(formData.date, "yyyy-MM-dd"),
        time: formData.time,
        duration: formData.duration,
        max_participants: formData.maxParticipants,
        location: formData.location,
        description: formData.description,
      };
      
      console.log('Creating class with data:', newClassData);

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
    } catch (error: any) {
      console.error('Error creating class:', error);
      // Check if we have validation errors
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        const errorMessages = Object.entries(validationErrors)
          .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
          .join('\n');
        toast({
          title: "Σφάλμα επικύρωσης",
          description: errorMessages,
          variant: "destructive",
        });
      } else if (error.response?.data?.message) {
        toast({
          title: "Σφάλμα",
          description: error.response.data.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Σφάλμα",
          description: "Αποτυχία δημιουργίας μαθήματος. Παρακαλώ δοκιμάστε ξανά.",
          variant: "destructive",
        });
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateClass = async () => {
    try {
      setIsCreating(true);
      
      const updateData = {
        name: formData.name,
        type: formData.type,
        instructor: formData.instructor, // Changed from instructor_id to instructor
        date: format(formData.date, "yyyy-MM-dd"),
        time: formData.time,
        duration: formData.duration,
        max_participants: formData.maxParticipants,
        location: formData.location,
        description: formData.description,
      };

      const response = await classesApi.update(editingClass.id.toString(), updateData);
      const updatedClass = response.data || response;
      
      setClasses(classes.map(c => c.id === editingClass.id ? updatedClass : c));
      setIsEditDialogOpen(false);
      setEditingClass(null);

      toast({
        title: "Επιτυχία!",
        description: `Το μάθημα ${formData.name} ενημερώθηκε με επιτυχία.`,
      });

      resetForm();
    } catch (error: any) {
      console.error('Error updating class:', error);
      // Check if we have validation errors
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        const errorMessages = Object.entries(validationErrors)
          .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
          .join('\n');
        toast({
          title: "Σφάλμα επικύρωσης",
          description: errorMessages,
          variant: "destructive",
        });
      } else if (error.response?.data?.message) {
        toast({
          title: "Σφάλμα",
          description: error.response.data.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Σφάλμα",
          description: "Αποτυχία ενημέρωσης μαθήματος. Παρακαλώ δοκιμάστε ξανά.",
          variant: "destructive",
        });
      }
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

              {/* Edit Class Dialog */}
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Επεξεργασία Μαθήματος</DialogTitle>
                    <DialogDescription>
                      Ενημερώστε τις πληροφορίες του μαθήματος
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-name">Όνομα Μαθήματος</Label>
                        <Input
                          id="edit-name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="π.χ. Yoga Flow"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-type">Τύπος</Label>
                        <Select
                          value={formData.type}
                          onValueChange={(value) => setFormData({ ...formData, type: value })}
                        >
                          <SelectTrigger id="edit-type">
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
                      <div className="space-y-2">
                        <Label htmlFor="edit-instructor">Προπονητής</Label>
                        <Select
                          value={formData.instructor}
                          onValueChange={(value) => setFormData({ ...formData, instructor: value })}
                        >
                          <SelectTrigger id="edit-instructor">
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
                      <div className="space-y-2">
                        <Label htmlFor="edit-date">Ημερομηνία</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              id="edit-date"
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !formData.date && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.date ? format(formData.date, "PPP", { locale: el }) : "Επιλέξτε ημερομηνία"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={formData.date}
                              onSelect={(date) => date && setFormData({ ...formData, date })}
                              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-time">Ώρα</Label>
                        <Select
                          value={formData.time}
                          onValueChange={(value) => setFormData({ ...formData, time: value })}
                        >
                          <SelectTrigger id="edit-time">
                            <SelectValue placeholder="Επιλέξτε ώρα" />
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
                      <div className="space-y-2">
                        <Label htmlFor="edit-duration">Διάρκεια (λεπτά)</Label>
                        <Input
                          id="edit-duration"
                          type="number"
                          value={formData.duration}
                          onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                          min="15"
                          max="120"
                          step="15"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-maxParticipants">Μέγ. Συμμετέχοντες</Label>
                        <Input
                          id="edit-maxParticipants"
                          type="number"
                          value={formData.maxParticipants}
                          onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })}
                          min="1"
                          max="50"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-location">Τοποθεσία</Label>
                      <Select
                        value={formData.location}
                        onValueChange={(value) => setFormData({ ...formData, location: value })}
                      >
                        <SelectTrigger id="edit-location">
                          <SelectValue placeholder="Επιλέξτε τοποθεσία" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Studio 1">Studio 1</SelectItem>
                          <SelectItem value="Studio 2">Studio 2</SelectItem>
                          <SelectItem value="Outdoor">Εξωτερικός Χώρος</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-description">Περιγραφή</Label>
                      <Textarea
                        id="edit-description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Προαιρετική περιγραφή του μαθήματος..."
                        rows={3}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => {
                      setIsEditDialogOpen(false);
                      setEditingClass(null);
                      resetForm();
                    }}>
                      Ακύρωση
                    </Button>
                    <Button onClick={handleUpdateClass} disabled={isCreating}>
                      {isCreating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Ενημέρωση...
                        </>
                      ) : (
                        "Ενημέρωση Μαθήματος"
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

            {/* Matrix View Calendar */}
            <MatrixViewCalendar 
              sessions={classes.map(cls => ({
                id: cls.id,
                trainer_id: typeof cls.instructor === 'string' ? parseInt(cls.instructor) : cls.instructor,
                trainer_name: cls.trainer_name || instructors.find(i => i.id === cls.instructor)?.name || '',
                class_type: cls.class_type || cls.name || cls.type, // Use class_type from API, fallback to name or type
                type: cls.type, // Add the type field
                start_time: cls.start_time || cls.time,
                end_time: cls.end_time || cls.time, // API now provides this
                date: cls.date ? format(cls.date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
                participants: cls.current_participants || cls.currentParticipants,
                max_participants: cls.max_participants || cls.maxParticipants
              }))}
              trainers={instructors.map(i => ({ id: parseInt(i.id), name: i.name }))}
              onSessionClick={(session) => {
                setSelectedSession(session);
                setSessionDialogOpen(true);
              }}
            />

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
                              <div>{cls.current_participants || cls.currentParticipants || 0}/{cls.max_participants || cls.maxParticipants || 0}</div>
                              {(cls.waitlist_count || 0) > 0 && (
                                <div className="text-orange-600 text-xs">🕐 {cls.waitlist_count} αναμονή</div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
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
                            <div className="font-medium">
                              {cls.current_participants || cls.currentParticipants || 0}/{cls.max_participants || cls.maxParticipants || 0}
                            </div>
                            {(cls.waitlist_count || 0) > 0 && (
                              <div className="text-orange-600 text-xs mt-1">
                                🕐 {cls.waitlist_count} σε αναμονή
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(cls.status, cls.current_participants || cls.currentParticipants || 0, cls.max_participants || cls.maxParticipants || 0)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleEditClass(cls)}
                              title="Επεξεργασία"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleDeleteClass(cls.id)}
                              title="Διαγραφή"
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
          </main>
        </div>
      </div>

      <Dialog open={sessionDialogOpen} onOpenChange={setSessionDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedSession?.class_type}</DialogTitle>
          </DialogHeader>
          {selectedSession && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Προπονητής</Label>
                  <p className="font-medium">{selectedSession.trainer_name}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Ημερομηνία</Label>
                  <p className="font-medium">
                    {format(new Date(selectedSession.date), 'EEEE, dd MMMM', { locale: el })}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Ώρα</Label>
                  <p className="font-medium">
                    {selectedSession.start_time} - {selectedSession.end_time}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Συμμετέχοντες</Label>
                  <p className="font-medium">
                    {selectedSession.current_participants || 0}/{selectedSession.max_participants || '∞'}
                  </p>
                  {(selectedSession.waitlist_count || 0) > 0 && (
                    <p className="text-sm text-orange-600 mt-1">
                      🕐 {selectedSession.waitlist_count} χρήστες σε αναμονή
                    </p>
                  )}
                </div>
              </div>
              {selectedSession.location && (
                <div>
                  <Label className="text-sm text-muted-foreground">Τοποθεσία</Label>
                  <p className="font-medium">{selectedSession.location}</p>
                </div>
              )}
              {selectedSession.description && (
                <div>
                  <Label className="text-sm text-muted-foreground">Περιγραφή</Label>
                  <p className="text-sm">{selectedSession.description}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSessionDialogOpen(false)}>
              Κλείσιμο
            </Button>
            <Button
              onClick={() => {
                setSessionDialogOpen(false);
                handleEditClass(selectedSession);
              }}
            >
              Επεξεργασία
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}