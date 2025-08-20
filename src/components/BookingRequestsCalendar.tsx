import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar, Clock, User } from 'lucide-react';
import { format, addDays, subDays, startOfDay, parseISO } from 'date-fns';
import { el } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { bookingRequestsApi } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';

interface BookingRequest {
  id: number;
  customer_name: string;
  customer_email: string;
  trainer_id: number;
  trainer_name: string;
  type: 'ems' | 'pt';
  preferred_date: string;
  preferred_time: string;
  start_time: string;
  end_time: string;
  status: string;
  notes?: string;
}

interface Trainer {
  id: number;
  name: string;
}

interface BookingRequestsCalendarProps {
  trainers: Trainer[];
  onRequestClick?: (request: BookingRequest) => void;
}

const BookingRequestsCalendar: React.FC<BookingRequestsCalendarProps> = ({ 
  trainers, 
  onRequestClick 
}) => {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Generate 7 days for tab navigation
  const days = Array.from({ length: 7 }, (_, i) => addDays(startOfDay(new Date()), i));
  
  // Time slots from 07:00 to 22:00
  const timeSlots = Array.from({ length: 16 }, (_, i) => {
    const hour = i + 7;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  // Add "Unassigned" trainer for requests without trainer
  const allTrainers = [
    { id: 0, name: 'Χωρίς Προπονητή' },
    ...trainers
  ];

  // Fetch calendar data
  const fetchCalendarData = async (date: Date) => {
    setLoading(true);
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      const response = await bookingRequestsApi.getCalendar(formattedDate);
      
      // Handle response format
      let data = [];
      if (Array.isArray(response)) {
        data = response;
      } else if (response?.data && Array.isArray(response.data)) {
        data = response.data;
      }
      
      setCalendarData(data);
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

  // Fetch data when date changes
  useEffect(() => {
    fetchCalendarData(currentDate);
  }, [currentDate]);

  // Get color based on request type (same logic as MatrixViewCalendar)
  const getRequestColor = (request: BookingRequest) => {
    if (request.type === 'pt') {
      return 'bg-pink-300 hover:bg-pink-400 border-pink-400';
    } else if (request.type === 'ems') {
      return 'bg-purple-300 hover:bg-purple-400 border-purple-400';
    }
    // Default color for other types
    return 'bg-blue-300 hover:bg-blue-400 border-blue-400';
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate position and height for a request
  const getRequestPosition = (request: BookingRequest) => {
    const startTime = request.start_time || request.preferred_time;
    const endTime = request.end_time;
    
    if (!startTime) return null;
    
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const startMinutes = (startHour - 7) * 60 + startMinute;
    
    // Default duration of 1 hour if no end time
    let duration = 60;
    if (endTime) {
      const [endHour, endMinute] = endTime.split(':').map(Number);
      const endMinutes = (endHour - 7) * 60 + endMinute;
      duration = endMinutes - startMinutes;
    }
    
    // Each hour is 60px height
    const top = (startMinutes / 60) * 60;
    const height = (duration / 60) * 60;
    
    return { top, height: Math.max(height, 30) }; // Minimum height of 30px
  };

  // Get requests for a specific trainer
  const getTrainerRequests = (trainerId: number) => {
    return calendarData.filter(request => {
      const requestTrainerId = request.trainer_id || 0;
      return requestTrainerId === trainerId;
    });
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
            <Calendar className="h-5 w-5" />
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
            <div className="min-w-[200px] text-center font-medium">
              {format(currentDate, 'EEEE, dd MMMM yyyy', { locale: el })}
            </div>
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
        <div className="flex gap-1 mt-4 overflow-x-auto pb-2">
          {days.map((day) => {
            const isSelected = format(day, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd');
            const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
            
            return (
              <Button
                key={day.toISOString()}
                variant={isSelected ? 'default' : 'outline'}
                size="sm"
                className={cn(
                  'min-w-[100px]',
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
                </div>
              </Button>
            );
          })}
        </div>
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
                {allTrainers.map((trainer) => (
                  <div
                    key={trainer.id}
                    className="flex-1 min-w-[150px] p-2 border-r text-center"
                  >
                    <div className="font-medium text-sm">{trainer.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {getTrainerRequests(trainer.id).length} αιτήματα
                    </div>
                  </div>
                ))}
              </div>

              {/* Time slots grid */}
              <div className="relative">
                {timeSlots.map((timeSlot, index) => (
                  <div key={timeSlot} className="flex border-b h-[60px]">
                    <div className="w-20 flex-shrink-0 p-2 border-r text-sm text-muted-foreground">
                      {timeSlot}
                    </div>
                    {allTrainers.map((trainer) => (
                      <div
                        key={`${trainer.id}-${timeSlot}`}
                        className="flex-1 min-w-[150px] border-r relative"
                      />
                    ))}
                  </div>
                ))}

                {/* Overlay requests on the grid */}
                {allTrainers.map((trainer, trainerIndex) => {
                  const requests = getTrainerRequests(trainer.id);
                  
                  return (
                    <div
                      key={`requests-${trainer.id}`}
                      className="absolute"
                      style={{
                        left: `${80 + trainerIndex * 150}px`,
                        width: '150px',
                        top: 0,
                        height: '100%',
                      }}
                    >
                      {requests.map((request) => {
                        const position = getRequestPosition(request);
                        if (!position) return null;

                        return (
                          <div
                            key={request.id}
                            className={cn(
                              'absolute p-2 rounded-md border cursor-pointer transition-all',
                              'shadow-sm hover:shadow-md hover:z-10',
                              getRequestColor(request)
                            )}
                            style={{
                              top: `${position.top}px`,
                              height: `${position.height}px`,
                              left: '4px',
                              right: '4px',
                            }}
                            onClick={() => onRequestClick?.(request)}
                          >
                            <div className="flex flex-col h-full overflow-hidden">
                              <div className="text-xs font-semibold truncate">
                                {request.customer_name}
                              </div>
                              <div className="text-xs text-gray-700 flex items-center gap-1 mt-1">
                                <Clock className="h-3 w-3" />
                                {request.preferred_time}
                              </div>
                              {position.height > 40 && (
                                <Badge 
                                  className={cn(
                                    'text-xs mt-auto',
                                    getStatusColor(request.status)
                                  )}
                                >
                                  {request.status === 'pending' ? 'Αναμονή' :
                                   request.status === 'confirmed' ? 'Επιβεβαιωμένο' :
                                   request.status === 'rejected' ? 'Απορρίφθηκε' : 
                                   request.status}
                                </Badge>
                              )}
                            </div>
                          </div>
                        );
                      })}
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
};

export default BookingRequestsCalendar;