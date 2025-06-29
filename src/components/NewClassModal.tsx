import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Plus, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { classesApi, instructorsApi } from "../services/api";
import { cn } from "../lib/utils";
import { format } from "date-fns";
import { el } from "date-fns/locale";

interface NewClassModalProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerButton?: boolean;
  onClassCreated?: (classData: any) => void;
}

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

export function NewClassModal({ 
  isOpen, 
  onOpenChange, 
  triggerButton = true,
  onClassCreated 
}: NewClassModalProps) {
  const { toast } = useToast();
  const [instructors, setInstructors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
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

  // Fetch instructors on component mount
  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        setIsLoading(true);
        const response = await instructorsApi.getAll();
        setInstructors(response.data || response || []);
      } catch (error) {
        console.error('Error fetching instructors:', error);
        toast({
          title: "Σφάλμα",
          description: "Αποτυχία φόρτωσης προπονητών.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isOpen) {
      fetchInstructors();
    }
  }, [isOpen, toast]);

  const handleCreateClass = async () => {
    if (!formData.name || !formData.type || !formData.instructor || !formData.time || !formData.location) {
      toast({
        title: "Σφάλμα",
        description: "Παρακαλώ συμπληρώστε όλα τα υποχρεωτικά πεδία.",
        variant: "destructive"
      });
      return;
    }

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

      toast({
        title: "Επιτυχία!",
        description: `Το μάθημα ${formData.name} δημιουργήθηκε με επιτυχία.`,
      });

      if (onClassCreated) {
        onClassCreated(newClass);
      }

      resetForm();
      if (onOpenChange) {
        onOpenChange(false);
      }
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

  const content = (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-blue-600" />
          Δημιουργία Νέου Μαθήματος
        </DialogTitle>
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
                {isLoading ? (
                  <div className="p-2 text-center">
                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                  </div>
                ) : (
                  instructors.map((instructor) => (
                    <SelectItem key={instructor.id} value={instructor.id}>
                      {instructor.name}
                    </SelectItem>
                  ))
                )}
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
              onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value) || 60})}
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
            onChange={(e) => setFormData({...formData, maxParticipants: parseInt(e.target.value) || 12})}
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
        <Button variant="outline" onClick={() => onOpenChange && onOpenChange(false)}>
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
  );

  if (triggerButton) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Νέο Μάθημα
          </Button>
        </DialogTrigger>
        {content}
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {content}
    </Dialog>
  );
} 