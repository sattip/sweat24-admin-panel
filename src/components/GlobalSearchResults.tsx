import { useMemo } from 'react';
import { format } from 'date-fns';
import { el } from 'date-fns/locale';
import { 
  User, 
  Calendar, 
  Clock, 
  UserCheck, 
  ChevronRight,
  Search,
  Loader2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { SearchResult, SearchState } from '@/hooks/useGlobalSearch';

interface GlobalSearchResultsProps {
  searchState: SearchState;
  onSelectResult: (result: SearchResult) => void;
  onClose: () => void;
}

export function GlobalSearchResults({ 
  searchState, 
  onSelectResult,
  onClose 
}: GlobalSearchResultsProps) {
  const { isLoading, results, error, query } = searchState;

  const hasResults = useMemo(() => {
    return results.users.length > 0 || 
           results.classes.length > 0 || 
           results.bookings.length > 0;
  }, [results]);

  if (!query.trim()) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden">
      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="p-4 text-center text-sm text-destructive">
          {error}
        </div>
      ) : !hasResults ? (
        <div className="p-8 text-center">
          <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Δεν βρέθηκαν αποτελέσματα για "{query}"
          </p>
        </div>
      ) : (
        <ScrollArea className="max-h-[400px]">
          <div className="p-2">
            {/* Users Section */}
            {results.users.length > 0 && (
              <div className="mb-4">
                <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Πελάτες ({results.users.length})
                </div>
                {results.users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => onSelectResult(user)}
                    className="w-full px-3 py-2 flex items-center gap-3 hover:bg-accent rounded-md transition-colors group"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm">{user.name}</div>
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                    </div>
                    <Badge variant={user.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                      {user.status === 'active' ? 'Ενεργός' : 'Ανενεργός'}
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            )}

            {/* Classes Section */}
            {results.classes.length > 0 && (
              <div className="mb-4">
                <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Μαθήματα ({results.classes.length})
                </div>
                {results.classes.map((classItem) => (
                  <button
                    key={classItem.id}
                    onClick={() => onSelectResult(classItem)}
                    className="w-full px-3 py-2 flex items-center gap-3 hover:bg-accent rounded-md transition-colors group"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm">{classItem.title}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {format(new Date(classItem.date), 'dd MMM yyyy', { locale: el })} - {classItem.time}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {classItem.instructor}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            )}

            {/* Bookings Section */}
            {results.bookings.length > 0 && (
              <div>
                <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Κρατήσεις ({results.bookings.length})
                </div>
                {results.bookings.map((booking) => (
                  <button
                    key={booking.id}
                    onClick={() => onSelectResult(booking)}
                    className="w-full px-3 py-2 flex items-center gap-3 hover:bg-accent rounded-md transition-colors group"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <UserCheck className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm">
                        {booking.userName} - {booking.className}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(booking.date), 'dd MMM yyyy', { locale: el })} στις {booking.time}
                      </div>
                    </div>
                    <Badge 
                      variant={
                        booking.status === 'confirmed' ? 'default' : 
                        booking.status === 'cancelled' ? 'destructive' : 
                        'secondary'
                      } 
                      className="text-xs"
                    >
                      {booking.status === 'confirmed' ? 'Επιβεβαιωμένη' : 
                       booking.status === 'cancelled' ? 'Ακυρωμένη' : 
                       'Αναμονή'}
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}