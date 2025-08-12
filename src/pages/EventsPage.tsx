import { useState, useEffect } from "react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import {
  Edit,
  Trash2,
  Plus,
  Calendar,
  CalendarDays,
  Clock,
  MapPin,
  Users,
  Eye,
} from "lucide-react";
import { eventsApi } from "@/api/modules/events";

interface Event {
  id: number;
  name: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image_url: string;
  type: string;
  details: string[];
  is_active: boolean;
  max_attendees: number | null;
  current_attendees: number;
}

interface EventRSVP {
  id: number;
  event_id: number;
  user_id: number | null;
  guest_name: string | null;
  guest_email: string | null;
  response: string;
  notes: string | null;
  created_at: string;
  event?: Event;
  user?: {
    name: string;
    email: string;
  };
}

export default function EventsPage() {
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [rsvps, setRsvps] = useState<EventRSVP[]>([]);
  const [loading, setLoading] = useState(true);
  const [openEventDialog, setOpenEventDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [selectedEventRsvps, setSelectedEventRsvps] = useState<EventRSVP[]>([]);
  const [openRsvpDialog, setOpenRsvpDialog] = useState(false);
  const [eventFormData, setEventFormData] = useState({
    name: '',
    description: '',
    date: '',
    time: '',
    location: '',
    image_url: '',
    type: 'other',
    details: [] as string[],
    is_active: true,
    max_attendees: 0,
  });
  const [newDetail, setNewDetail] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchEvents(),
        fetchRsvps(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const data = await eventsApi.getEvents();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchRsvps = async () => {
    try {
      const data = await eventsApi.getAllRsvps();
      setRsvps(data);
    } catch (error) {
      console.error('Error fetching RSVPs:', error);
    }
  };

  const handleOpenEventDialog = (event?: Event) => {
    if (event) {
      setEditingEvent(event);
      setEventFormData({
        name: event.name,
        description: event.description,
        date: event.date,
        time: event.time,
        location: event.location,
        image_url: event.image_url,
        type: event.type,
        details: event.details || [],
        is_active: event.is_active,
        max_attendees: event.max_attendees || 0,
      });
    } else {
      setEditingEvent(null);
      setEventFormData({
        name: '',
        description: '',
        date: '',
        time: '',
        location: '',
        image_url: '',
        type: 'other',
        details: [],
        is_active: true,
        max_attendees: 0,
      });
    }
    setOpenEventDialog(true);
  };

  const handleSubmitEvent = async () => {
    try {
      // UI validation to avoid 422
      const requiredMissing = !eventFormData.name?.trim() ||
        !eventFormData.description?.trim() ||
        !eventFormData.date?.trim() ||
        !eventFormData.time?.trim() ||
        !eventFormData.location?.trim() ||
        !eventFormData.type?.trim();
      if (requiredMissing) {
        toast({ title: 'Σφάλμα', description: 'Συμπληρώστε όλα τα απαραίτητα πεδία.', variant: 'destructive' });
        return;
      }
      // date must be today or future
      const today = new Date();
      const onlyDate = new Date(eventFormData.date + 'T00:00:00');
      if (onlyDate < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
        toast({ title: 'Σφάλμα', description: 'Η ημερομηνία πρέπει να είναι σημερινή ή μεταγενέστερη.', variant: 'destructive' });
        return;
      }

      // Build payload exactly as backend validator expects
      const dataToSubmit: any = {
        name: eventFormData.name?.trim(),
        description: eventFormData.description?.trim(),
        date: eventFormData.date,
        time: eventFormData.time,
        location: eventFormData.location?.trim(),
        type: eventFormData.type,
      };
      if (eventFormData.image_url?.trim()) {
        dataToSubmit.image_url = eventFormData.image_url.trim();
      } else {
        dataToSubmit.image_url = null;
      }
      dataToSubmit.details = Array.isArray(eventFormData.details) ? eventFormData.details : [];
      dataToSubmit.max_attendees = eventFormData.max_attendees ? Number(eventFormData.max_attendees) : null;
      // 1) Save (αν αποτύχει, δείξε error και σταμάτα εδώ)
      try {
        if (editingEvent) {
          await eventsApi.updateEvent(editingEvent.id, dataToSubmit);
          toast({ title: 'Επιτυχία', description: 'Η εκδήλωση ενημερώθηκε' });
        } else {
          await eventsApi.createEvent(dataToSubmit);
          toast({ title: 'Επιτυχία', description: 'Η εκδήλωση δημιουργήθηκε' });
        }
        setOpenEventDialog(false);
      } catch (saveError) {
        console.error('Error saving event:', saveError);
        toast({ title: 'Σφάλμα', description: 'Αποτυχία αποθήκευσης', variant: 'destructive' });
        return;
      }

      // 2) Refresh λίστας (αν αποτύχει, απλά log/toast info, χωρίς να αναιρεί το success)
      try {
        await fetchEvents();
      } catch (refreshError) {
        console.warn('Warning: Η εκδήλωση αποθηκεύτηκε, αλλά απέτυχε η ανανέωση λίστας.', refreshError);
        // Προαιρετικό ενημερωτικό toast (όχι destructive)
        toast({ title: 'Ενημέρωση', description: 'Αποθηκεύτηκε, αλλά απέτυχε η ανανέωση της λίστας.', variant: 'default' });
      }
    } catch (error) {
      console.error('Unexpected error in handleSubmitEvent:', error);
      toast({ title: 'Σφάλμα', description: 'Απρόσμενο σφάλμα.', variant: 'destructive' });
    }
  };

  const handleDeleteEvent = async (id: number) => {
    if (window.confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε αυτή την εκδήλωση;')) {
      try {
        await eventsApi.deleteEvent(id);
        fetchEvents();
        toast({
          title: "Επιτυχία",
          description: "Η εκδήλωση διαγράφηκε",
        });
      } catch (error) {
        console.error('Error deleting event:', error);
        toast({
          title: "Σφάλμα",
          description: "Αποτυχία διαγραφής",
          variant: "destructive",
        });
      }
    }
  };

  const handleViewRsvps = (event: Event) => {
    const eventRsvps = rsvps.filter(r => r.event_id === event.id);
    setSelectedEventRsvps(eventRsvps);
    setOpenRsvpDialog(true);
  };

  const handleAddDetail = () => {
    if (newDetail.trim()) {
      setEventFormData({
        ...eventFormData,
        details: [...eventFormData.details, newDetail.trim()],
      });
      setNewDetail('');
    }
  };

  const handleRemoveDetail = (index: number) => {
    setEventFormData({
      ...eventFormData,
      details: eventFormData.details.filter((_, i) => i !== index),
    });
  };

  const eventTypeLabels = {
    social: 'Κοινωνική Εκδήλωση',
    educational: 'Εκπαιδευτικό',
    fitness: 'Fitness',
    other: 'Άλλο',
  };

  const responseColors = {
    yes: 'success',
    no: 'destructive',
    maybe: 'secondary',
  } as const;

  const responseLabels = {
    yes: 'Θα παρευρεθώ',
    no: 'Όχι',
    maybe: 'Ίσως',
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
                <h1 className="text-3xl font-bold text-foreground">Εκδηλώσεις</h1>
                <p className="text-muted-foreground">
                  Διαχείριση εκδηλώσεων και RSVPs
                </p>
              </div>
              <Dialog open={openEventDialog} onOpenChange={setOpenEventDialog}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-primary hover:bg-primary/90 text-white"
                    onClick={() => handleOpenEventDialog()}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Νέα Εκδήλωση
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingEvent ? 'Επεξεργασία Εκδήλωσης' : 'Νέα Εκδήλωση'}
                    </DialogTitle>
                    <DialogDescription>
                      Συμπληρώστε τα στοιχεία της εκδήλωσης
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div>
                      <Label htmlFor="name">Όνομα</Label>
                      <Input
                        id="name"
                        value={eventFormData.name}
                        onChange={(e) => setEventFormData({...eventFormData, name: e.target.value})}
                        placeholder="π.χ. Καλοκαιρινό Πάρτι"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Περιγραφή</Label>
                      <Textarea
                        id="description"
                        value={eventFormData.description}
                        onChange={(e) => setEventFormData({...eventFormData, description: e.target.value})}
                        placeholder="Περιγράψτε την εκδήλωση..."
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="date">Ημερομηνία</Label>
                        <Input
                          id="date"
                          type="date"
                          value={eventFormData.date}
                          onChange={(e) => setEventFormData({...eventFormData, date: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="time">Ώρα</Label>
                        <Input
                          id="time"
                          type="time"
                          value={eventFormData.time}
                          onChange={(e) => setEventFormData({...eventFormData, time: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="location">Τοποθεσία</Label>
                      <Input
                        id="location"
                        value={eventFormData.location}
                        onChange={(e) => setEventFormData({...eventFormData, location: e.target.value})}
                        placeholder="π.χ. Beach Bar 'Ammos'"
                      />
                    </div>
                    <div>
                      <Label htmlFor="image_url">URL Εικόνας</Label>
                      <Input
                        id="image_url"
                        value={eventFormData.image_url}
                        onChange={(e) => setEventFormData({...eventFormData, image_url: e.target.value})}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="type">Τύπος</Label>
                        <Select
                          value={eventFormData.type}
                          onValueChange={(value) => setEventFormData({...eventFormData, type: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(eventTypeLabels).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="max_attendees">Μέγιστος Αριθμός Συμμετεχόντων</Label>
                        <Input
                          id="max_attendees"
                          type="number"
                          value={eventFormData.max_attendees}
                          onChange={(e) => setEventFormData({...eventFormData, max_attendees: parseInt(e.target.value)})}
                          placeholder="0 για απεριόριστο"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Επιπλέον Πληροφορίες</Label>
                      <div className="flex gap-2 mb-2">
                        <Input
                          value={newDetail}
                          onChange={(e) => setNewDetail(e.target.value)}
                          placeholder="Προσθήκη πληροφορίας"
                          onKeyPress={(e) => e.key === 'Enter' && handleAddDetail()}
                        />
                        <Button type="button" onClick={handleAddDetail}>
                          Προσθήκη
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {eventFormData.details.map((detail, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => handleRemoveDetail(index)}
                          >
                            {detail} ✕
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="active"
                        checked={eventFormData.is_active}
                        onCheckedChange={(checked) => setEventFormData({...eventFormData, is_active: checked})}
                      />
                      <Label htmlFor="active">Ενεργή</Label>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setOpenEventDialog(false)}>
                      Ακύρωση
                    </Button>
                    <Button onClick={handleSubmitEvent}>
                      Αποθήκευση
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Tabs defaultValue="events" className="space-y-4">
              <TabsList>
                <TabsTrigger value="events">Εκδηλώσεις</TabsTrigger>
                <TabsTrigger value="rsvps">RSVPs</TabsTrigger>
              </TabsList>

              <TabsContent value="events" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Εκδηλώσεις</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Εικόνα</TableHead>
                          <TableHead>Όνομα</TableHead>
                          <TableHead>Ημερομηνία</TableHead>
                          <TableHead>Ώρα</TableHead>
                          <TableHead>Τοποθεσία</TableHead>
                          <TableHead>Τύπος</TableHead>
                          <TableHead className="text-center">Συμμετέχοντες</TableHead>
                          <TableHead className="text-center">Κατάσταση</TableHead>
                          <TableHead className="text-right">Ενέργειες</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {events.map((event) => (
                          <TableRow key={event.id}>
                            <TableCell>
                              <Avatar className="rounded-md">
                                <AvatarImage src={event.image_url} alt={event.name} />
                                <AvatarFallback>
                                  <CalendarDays className="h-4 w-4" />
                                </AvatarFallback>
                              </Avatar>
                            </TableCell>
                            <TableCell className="font-medium">{event.name}</TableCell>
                            <TableCell>{new Date(event.date).toLocaleDateString('el-GR')}</TableCell>
                            <TableCell>{event.time}</TableCell>
                            <TableCell>{event.location}</TableCell>
                            <TableCell>{eventTypeLabels[event.type as keyof typeof eventTypeLabels]}</TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-2">
                                {event.current_attendees}
                                {event.max_attendees && `/${event.max_attendees}`}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleViewRsvps(event)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant={event.is_active ? "success" : "secondary"}>
                                {event.is_active ? 'Ενεργή' : 'Ανενεργή'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleOpenEventDialog(event)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteEvent(event.id)}
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

              <TabsContent value="rsvps" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Όλα τα RSVPs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ημερομηνία</TableHead>
                          <TableHead>Εκδήλωση</TableHead>
                          <TableHead>Όνομα</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead className="text-center">Απάντηση</TableHead>
                          <TableHead>Σημειώσεις</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rsvps.map((rsvp) => (
                          <TableRow key={rsvp.id}>
                            <TableCell>
                              {new Date(rsvp.created_at).toLocaleDateString('el-GR')}
                            </TableCell>
                            <TableCell>{rsvp.event?.name || 'N/A'}</TableCell>
                            <TableCell>{rsvp.user?.name || rsvp.guest_name || 'N/A'}</TableCell>
                            <TableCell>{rsvp.user?.email || rsvp.guest_email || 'N/A'}</TableCell>
                            <TableCell className="text-center">
                              <Badge variant={responseColors[rsvp.response as keyof typeof responseColors]}>
                                {responseLabels[rsvp.response as keyof typeof responseLabels]}
                              </Badge>
                            </TableCell>
                            <TableCell>{rsvp.notes || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* RSVPs Dialog */}
            <Dialog open={openRsvpDialog} onOpenChange={setOpenRsvpDialog}>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Συμμετέχοντες Εκδήλωσης</DialogTitle>
                </DialogHeader>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Όνομα</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Απάντηση</TableHead>
                      <TableHead>Σημειώσεις</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedEventRsvps.map((rsvp) => (
                      <TableRow key={rsvp.id}>
                        <TableCell>{rsvp.user?.name || rsvp.guest_name || 'N/A'}</TableCell>
                        <TableCell>{rsvp.user?.email || rsvp.guest_email || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant={responseColors[rsvp.response as keyof typeof responseColors]}>
                            {responseLabels[rsvp.response as keyof typeof responseLabels]}
                          </Badge>
                        </TableCell>
                        <TableCell>{rsvp.notes || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </DialogContent>
            </Dialog>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}