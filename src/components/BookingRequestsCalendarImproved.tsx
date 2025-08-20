import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, User } from 'lucide-react';
import { format, addDays, subDays, startOfDay, parseISO, isSameDay } from 'date-fns';
import { el } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { appointmentRequestsApi, AppointmentRequest } from '@/api/modules/specializedServices';
import { useToast } from '@/components/ui/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

// Use the AppointmentRequest interface from the specialized services API
type BookingRequest = AppointmentRequest & {
  trainer_id?: number;
  trainer_name?: string;
  service_name?: string;
  service_id?: number;
  type?: 'ems' | 'pt' | string;
  preferred_date?: string;
  preferred_time?: string;
  start_time?: string;
  end_time?: string;
  user?: {
    name: string;
  };
};

interface Trainer {
  id: number;
  name: string;
}

interface Service {
  id: number;
  name: string;
  slug?: string;
  color?: string;
}

interface BookingRequestsCalendarImprovedProps {
  trainers: Trainer[];
  services?: Service[];
  onRequestClick?: (request: BookingRequest) => void;
  refreshTrigger?: number; // Add this to trigger refreshes from parent
}

export interface BookingRequestsCalendarRef {
  refresh: () => void;
}

// Predefined color palette for services (20 colors)
const SERVICE_COLORS = [
  { bg: 'bg-pink-300', hover: 'hover:bg-pink-400', border: 'border-pink-400', text: 'text-pink-900' },
  { bg: 'bg-purple-300', hover: 'hover:bg-purple-400', border: 'border-purple-400', text: 'text-purple-900' },
  { bg: 'bg-indigo-300', hover: 'hover:bg-indigo-400', border: 'border-indigo-400', text: 'text-indigo-900' },
  { bg: 'bg-blue-300', hover: 'hover:bg-blue-400', border: 'border-blue-400', text: 'text-blue-900' },
  { bg: 'bg-cyan-300', hover: 'hover:bg-cyan-400', border: 'border-cyan-400', text: 'text-cyan-900' },
  { bg: 'bg-teal-300', hover: 'hover:bg-teal-400', border: 'border-teal-400', text: 'text-teal-900' },
  { bg: 'bg-emerald-300', hover: 'hover:bg-emerald-400', border: 'border-emerald-400', text: 'text-emerald-900' },
  { bg: 'bg-green-300', hover: 'hover:bg-green-400', border: 'border-green-400', text: 'text-green-900' },
  { bg: 'bg-lime-300', hover: 'hover:bg-lime-400', border: 'border-lime-400', text: 'text-lime-900' },
  { bg: 'bg-yellow-300', hover: 'hover:bg-yellow-400', border: 'border-yellow-400', text: 'text-yellow-900' },
  { bg: 'bg-amber-300', hover: 'hover:bg-amber-400', border: 'border-amber-400', text: 'text-amber-900' },
  { bg: 'bg-orange-300', hover: 'hover:bg-orange-400', border: 'border-orange-400', text: 'text-orange-900' },
  { bg: 'bg-red-300', hover: 'hover:bg-red-400', border: 'border-red-400', text: 'text-red-900' },
  { bg: 'bg-rose-300', hover: 'hover:bg-rose-400', border: 'border-rose-400', text: 'text-rose-900' },
  { bg: 'bg-fuchsia-300', hover: 'hover:bg-fuchsia-400', border: 'border-fuchsia-400', text: 'text-fuchsia-900' },
  { bg: 'bg-violet-300', hover: 'hover:bg-violet-400', border: 'border-violet-400', text: 'text-violet-900' },
  { bg: 'bg-slate-300', hover: 'hover:bg-slate-400', border: 'border-slate-400', text: 'text-slate-900' },
  { bg: 'bg-gray-300', hover: 'hover:bg-gray-400', border: 'border-gray-400', text: 'text-gray-900' },
  { bg: 'bg-zinc-300', hover: 'hover:bg-zinc-400', border: 'border-zinc-400', text: 'text-zinc-900' },
  { bg: 'bg-stone-300', hover: 'hover:bg-stone-400', border: 'border-stone-400', text: 'text-stone-900' },
];

const BookingRequestsCalendarImproved = forwardRef<BookingRequestsCalendarRef, BookingRequestsCalendarImprovedProps>(({ 
  trainers, 
  services = [],
  onRequestClick,
  refreshTrigger = 0
}, ref) => {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [serviceColorMap, setServiceColorMap] = useState<Map<number | string, typeof SERVICE_COLORS[0]>>(new Map());
  
  // Expose refresh method through ref
  useImperativeHandle(ref, () => ({
    refresh: () => fetchCalendarData(currentDate)
  }));
  
  // Generate 7 days for tab navigation starting from current selected date
  const days = Array.from({ length: 7 }, (_, i) => addDays(startOfDay(currentDate), i - 3)); // Show 3 days before and 3 after
  
  // Initialize service color mapping
  useEffect(() => {
    const colorMap = new Map<number | string, typeof SERVICE_COLORS[0]>();
    
    // Map existing services to colors
    services.forEach((service, index) => {
      colorMap.set(service.id, SERVICE_COLORS[index % SERVICE_COLORS.length]);
      if (service.slug) {
        colorMap.set(service.slug, SERVICE_COLORS[index % SERVICE_COLORS.length]);
      }
      colorMap.set(service.name.toLowerCase(), SERVICE_COLORS[index % SERVICE_COLORS.length]);
    });
    
    // Add default mappings for common types
    colorMap.set('ems', SERVICE_COLORS[1]); // Purple
    colorMap.set('pt', SERVICE_COLORS[0]); // Pink
    colorMap.set('personal', SERVICE_COLORS[0]); // Pink
    
    setServiceColorMap(colorMap);
  }, [services]);

  // Fetch calendar data
  const fetchCalendarData = async (date: Date) => {
    setLoading(true);
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      // Fetch all appointment requests
      const response = await appointmentRequestsApi.getAll();
      
      // Handle response format
      let allRequests: AppointmentRequest[] = [];
      if (Array.isArray(response)) {
        allRequests = response;
      } else if (response?.data && Array.isArray(response.data)) {
        allRequests = response.data;
      }
      
      // Filter for appointments that match the selected date
      const relevantRequests = allRequests.filter(request => {
        // Only show confirmed and completed appointments in calendar
        if (!['confirmed', 'completed'].includes(request.status)) return false;
        
        // Check if the confirmed date matches the selected date
        if (request.confirmed_date) {
          const confirmedDate = format(new Date(request.confirmed_date), 'yyyy-MM-dd');
          return confirmedDate === formattedDate;
        }
        
        return false;
      });
      
      // Transform appointment requests to calendar format
      const calendarData: BookingRequest[] = relevantRequests.map(request => ({
        ...request,
        trainer_id: request.instructor_id,
        trainer_name: trainers.find(t => t.id === request.instructor_id)?.name || 'Unknown',
        service_name: request.service_type?.toUpperCase() || 'EMS',
        type: request.service_type as 'ems' | 'pt',
        preferred_time: request.confirmed_time || '09:00',
        start_time: request.confirmed_time || '09:00',
        end_time: undefined, // Will be calculated if needed
        preferred_date: request.confirmed_date || '',
      }));
      
      console.log(`📅 Calendar data for ${formattedDate}:`, {
        totalRequests: allRequests.length,
        relevantRequests: relevantRequests.length,
        calendarData: calendarData.length,
        requests: calendarData.map(req => ({
          id: req.id,
          customer: req.customer_name || req.client_name,
          time: req.confirmed_time,
          trainer: req.trainer_name,
          status: req.status
        }))
      });
      
      setCalendarData(calendarData);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
      toast({
        title: 'Σφάλμα',
        description: 'Δεν ήταν δυνατή η φόρτωση του ημερολογίου',
        variant: 'destructive',
      });
      setCalendarData([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when date, trainers, or refreshTrigger change
  useEffect(() => {
    if (trainers.length > 0) {
      fetchCalendarData(currentDate);
    }
  }, [currentDate, trainers, refreshTrigger]);

  // Get color based on service and status
  const getRequestColor = (request: BookingRequest) => {
    // Try to find color by service_id, service_name, type, or service_type
    let color = serviceColorMap.get(request.service_id || '') ||
                serviceColorMap.get(request.service_name?.toLowerCase() || '') ||
                serviceColorMap.get(request.type) ||
                serviceColorMap.get(request.service_type || '') ||
                SERVICE_COLORS[0]; // Default to first color
    
    // Modify colors based on status
    if (request.status === 'completed') {
      // Use a more subdued/muted version for completed appointments
      color = {
        ...color,
        bg: color.bg.replace('300', '200'), // Lighter background
        hover: color.hover.replace('400', '300'),
        border: color.border.replace('400', '300')
      };
    }
    
    return `${color.bg} ${color.hover} ${color.border}`;
  };

  // Get text color for request
  const getRequestTextColor = (request: BookingRequest) => {
    const color = serviceColorMap.get(request.service_id || '') ||
                  serviceColorMap.get(request.service_name?.toLowerCase() || '') ||
                  serviceColorMap.get(request.type) ||
                  serviceColorMap.get(request.service_type || '') ||
                  SERVICE_COLORS[0];
    
    return color.text;
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get all unique time slots for a specific trainer
  const getTrainerTimeSlots = (trainerId: number) => {
    const trainerRequests = calendarData.filter(req => req.trainer_id === trainerId);
    const timeSlots = new Set<string>();
    
    trainerRequests.forEach(request => {
      const startTime = request.confirmed_time || request.start_time || request.preferred_time;
      if (startTime) {
        // Extract just hour:minute
        const [hour, minute] = startTime.split(':').slice(0, 2);
        timeSlots.add(`${hour}:${minute}`);
      }
    });
    
    // If trainer has no bookings, return empty array (will show "Χωρίς ραντεβού")
    if (timeSlots.size === 0) {
      return [];
    }
    
    // Convert to array and sort
    return Array.from(timeSlots).sort();
  };


  // Get customer name from various possible fields
  const getCustomerName = (request: BookingRequest) => {
    return request.customer_name || 
           request.client_name || 
           request.user?.name || 
           'Άγνωστος πελάτης';
  };

  // Navigate between dates
  const navigateDate = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentDate(subDays(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, 1));
    }
  };

  return (
    <Card className="w-full mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Ημερολόγιο Αιτημάτων
          </CardTitle>
          
          {/* Date Navigation */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateDate('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            {/* Date Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "min-w-[240px] justify-start text-left font-normal",
                    !currentDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(currentDate, 'EEEE, dd MMMM yyyy', { locale: el })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <Calendar
                  mode="single"
                  selected={currentDate}
                  onSelect={(date) => date && setCurrentDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateDate('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Day Tabs */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {days.map((day) => {
            const isSelected = format(day, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd');
            const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
            
            return (
              <Button
                key={day.toISOString()}
                variant={isSelected ? 'default' : 'outline'}
                size="sm"
                className={cn(
                  'min-w-[120px] h-auto py-2',
                  isToday && !isSelected && 'border-primary',
                  isSelected && 'bg-primary text-primary-foreground'
                )}
                onClick={() => setCurrentDate(day)}
              >
                <div className="flex flex-col items-center">
                  <span className="text-xs">
                    {format(day, 'EEE', { locale: el })}
                  </span>
                  <span className="text-lg font-bold">
                    {format(day, 'dd')}
                  </span>
                  <span className="text-xs">
                    {format(day, 'MMM', { locale: el })}
                  </span>
                </div>
              </Button>
            );
          })}
        </div>

        {/* Service Color Legend */}
        {services.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 p-3 bg-muted rounded-lg">
            <span className="text-sm font-medium mr-2">Υπηρεσίες:</span>
            {services.map((service) => {
              const color = serviceColorMap.get(service.id) || SERVICE_COLORS[0];
              return (
                <div key={service.id} className="flex items-center gap-1">
                  <div className={cn('w-4 h-4 rounded', color.bg)} />
                  <span className="text-sm">{service.name}</span>
                </div>
              );
            })}
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Φόρτωση...</div>
          </div>
        ) : (
          <ScrollArea className="w-full">
            <div className="min-w-[800px]">
              {/* Header with trainer names */}
              <div className="flex border-b sticky top-0 bg-background z-10">
                <div className="w-20 flex-shrink-0 p-2 border-r">
                  <span className="text-sm font-medium">Ώρα</span>
                </div>
                {trainers.map((trainer) => {
                  const trainerRequests = calendarData.filter(req => req.trainer_id === trainer.id);
                  return (
                    <div
                      key={trainer.id}
                      className="flex-1 min-w-[200px] p-2 border-r text-center"
                    >
                      <div className="font-medium text-sm">{trainer.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {trainerRequests.length} αιτήματα
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Time slots grid - Each trainer has their own timeslots */}
              <div className="flex">
                <div className="w-20 flex-shrink-0" />
                {trainers.map((trainer) => {
                  const trainerSlots = getTrainerTimeSlots(trainer.id);
                  const trainerRequests = calendarData.filter(req => req.trainer_id === trainer.id);
                  
                  return (
                    <div key={trainer.id} className="flex-1 min-w-[200px] border-r">
                      {trainerSlots.length === 0 ? (
                        // No bookings for this trainer
                        <div className="p-4 text-center text-muted-foreground text-sm">
                          Χωρίς ραντεβού
                        </div>
                      ) : (
                        // Show trainer's specific timeslots
                        trainerSlots.map((timeSlot) => {
                          const requests = trainerRequests.filter(request => {
                            const startTime = request.confirmed_time || request.start_time || request.preferred_time;
                            if (!startTime) return false;
                            const [hour, minute] = startTime.split(':').slice(0, 2);
                            return `${hour}:${minute}` === timeSlot;
                          });
                          
                          return (
                            <div key={`${trainer.id}-${timeSlot}`} className="border-b min-h-[60px] p-1">
                              <div className="text-xs text-muted-foreground mb-1">{timeSlot}</div>
                              {requests.map((request) => (
                                <div
                                  key={request.id}
                                  className={cn(
                                    'p-2 rounded-md border cursor-pointer transition-all mb-1',
                                    'shadow-sm hover:shadow-md hover:z-10',
                                    getRequestColor(request)
                                  )}
                                  onClick={() => onRequestClick?.(request)}
                                >
                                  <div className="flex flex-col gap-1 overflow-hidden">
                                    <div className={cn('text-xs font-semibold truncate', getRequestTextColor(request))}>
                                      {getCustomerName(request)}
                                    </div>
                                    <div className={cn('text-xs flex items-center gap-1', getRequestTextColor(request))}>
                                      <Clock className="h-3 w-3" />
                                      {request.confirmed_time || request.preferred_time || request.start_time}
                                      {request.end_time && ` - ${request.end_time}`}
                                    </div>
                                    {request.service_name && (
                                      <div className={cn('text-xs truncate', getRequestTextColor(request))}>
                                        {request.service_name}
                                      </div>
                                    )}
                                    <Badge 
                                      className={cn(
                                        'text-xs mt-auto',
                                        getStatusColor(request.status)
                                      )}
                                    >
                                      {request.status === 'pending' ? 'Αναμονή' :
                                       request.status === 'confirmed' ? 'Επιβεβαιωμένο' :
                                       request.status === 'completed' ? 'Ολοκληρωμένο' :
                                       request.status === 'rejected' ? 'Απορρίφθηκε' : 
                                       request.status}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        })
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
});

BookingRequestsCalendarImproved.displayName = 'BookingRequestsCalendarImproved';

export default BookingRequestsCalendarImproved;