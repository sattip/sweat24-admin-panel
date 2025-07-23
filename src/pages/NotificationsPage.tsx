import { useState, useEffect } from "react";
import { Plus, Bell, Filter, Send, Clock, CheckCircle, AlertCircle, Info, Users, Eye, Trash2, Edit } from "lucide-react";
import { NOTIFICATION_TYPES, NOTIFICATION_ICONS, NOTIFICATION_COLORS, NOTIFICATION_EMOJIS, NotificationType } from "@/utils/notificationTypes";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { useToast } from "../hooks/use-toast";
import { apiService } from "../services/apiService";
import { notificationsApi } from "@/api/modules/notifications";
import { NotificationCreateModal } from "../components/NotificationCreateModal";
import { NotificationFiltersModal } from "../components/NotificationFiltersModal";
import { format } from "date-fns";
import { el } from "date-fns/locale";
import { SidebarProvider } from "../components/ui/sidebar";
import { AdminSidebar } from "../components/AdminSidebar";
import { AdminHeader } from "../components/AdminHeader";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  priority: 'low' | 'medium' | 'high';
  channels: string[];
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  created_at: string;
  scheduled_at?: string;
  sent_at?: string;
  total_recipients: number;
  delivered_count: number;
  read_count: number;
  creator?: {
    name: string;
  };
  stats?: {
    delivery_rate: number;
    read_rate: number;
  };
}

interface NotificationStats {
  total_sent: number;
  total_scheduled: number;
  total_draft: number;
  sent_today: number;
  average_read_rate: number;
}

export function NotificationsPage() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  useEffect(() => {
    fetchNotifications();
    fetchStats();
  }, [statusFilter]);

  const fetchNotifications = async () => {
    try {
      const params: any = {};
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }
      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await apiService.get("/notifications", { params });
      setNotifications(response.data.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast({
        title: "Σφάλμα",
        description: "Αποτυχία φόρτωσης ειδοποιήσεων",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await notificationsApi.getStatistics();
      setStats(response);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleSendNotification = async (notification: Notification) => {
    try {
      await apiService.post(`/notifications/${notification.id}/send`);
      toast({
        title: "Επιτυχία",
        description: "Η ειδοποίηση στάλθηκε επιτυχώς",
      });
      fetchNotifications();
      fetchStats();
    } catch (error) {
      toast({
        title: "Σφάλμα",
        description: "Αποτυχία αποστολής ειδοποίησης",
        variant: "destructive",
      });
    }
  };

  const handleDeleteNotification = async (id: number) => {
    if (!window.confirm("Είστε σίγουροι ότι θέλετε να διαγράψετε αυτή την ειδοποίηση;")) {
      return;
    }

    try {
      await apiService.delete(`/notifications/${id}`);
      toast({
        title: "Επιτυχία",
        description: "Η ειδοποίηση διαγράφηκε",
      });
      fetchNotifications();
    } catch (error) {
      toast({
        title: "Σφάλμα",
        description: "Αποτυχία διαγραφής ειδοποίησης",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Πρόχειρο</Badge>;
      case 'scheduled':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Προγραμματισμένο</Badge>;
      case 'sent':
        return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Απεσταλμένο</Badge>;
      case 'failed':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Αποτυχία</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const typedType = type as NotificationType;
    const IconComponent = NOTIFICATION_ICONS[typedType];
    const colorClass = NOTIFICATION_COLORS[typedType];
    const label = NOTIFICATION_TYPES[typedType];
    
    if (IconComponent && colorClass && label) {
      return (
        <Badge variant="outline" className={colorClass}>
          <IconComponent className="h-3 w-3 mr-1" />
          {label}
        </Badge>
      );
    }
    
    return <Badge variant="outline">{type}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'low':
        return <Badge variant="secondary">Χαμηλή</Badge>;
      case 'medium':
        return <Badge variant="outline">Μεσαία</Badge>;
      case 'high':
        return <Badge variant="destructive">Υψηλή</Badge>;
      default:
        return <Badge>{priority}</Badge>;
    }
  };

  const filteredNotifications = notifications.filter(notification =>
    notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notification.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <AdminHeader />
          <main className="flex-1 p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Διαχείριση Ειδοποιήσεων</h1>
                <p className="text-muted-foreground">Δημιουργήστε και διαχειριστείτε στοχευμένες ειδοποιήσεις</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowFiltersModal(true)}>
                  <Filter className="h-4 w-4 mr-2" />
                  Φίλτρα
                </Button>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Νέα Ειδοποίηση
                </Button>
              </div>
            </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Απεσταλμένες</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_sent}</div>
              <p className="text-xs text-muted-foreground">Συνολικά</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Προγραμματισμένες</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_scheduled}</div>
              <p className="text-xs text-muted-foreground">Σε αναμονή</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Πρόχειρα</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_draft}</div>
              <p className="text-xs text-muted-foreground">Μη ολοκληρωμένα</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Σήμερα</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.sent_today}</div>
              <p className="text-xs text-muted-foreground">Απεστάλησαν</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Μ.Ο. Ανάγνωσης</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.average_read_rate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Ποσοστό</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex gap-2">
        <Input
          placeholder="Αναζήτηση ειδοποιήσεων..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Tabs */}
      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList>
          <TabsTrigger value="all">Όλες</TabsTrigger>
          <TabsTrigger value="draft">Πρόχειρα</TabsTrigger>
          <TabsTrigger value="scheduled">Προγραμματισμένες</TabsTrigger>
          <TabsTrigger value="sent">Απεσταλμένες</TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter} className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Τίτλος</TableHead>
                    <TableHead>Τύπος</TableHead>
                    <TableHead>Προτεραιότητα</TableHead>
                    <TableHead>Κανάλια</TableHead>
                    <TableHead>Κατάσταση</TableHead>
                    <TableHead>Παραλήπτες</TableHead>
                    <TableHead>Απόδοση</TableHead>
                    <TableHead>Ημερομηνία</TableHead>
                    <TableHead className="text-right">Ενέργειες</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        Φόρτωση...
                      </TableCell>
                    </TableRow>
                  ) : filteredNotifications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        Δεν βρέθηκαν ειδοποιήσεις
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredNotifications.map((notification) => (
                      <TableRow key={notification.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{notification.title}</div>
                            <div className="text-sm text-muted-foreground truncate max-w-xs">
                              {notification.message}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getTypeBadge(notification.type)}</TableCell>
                        <TableCell>{getPriorityBadge(notification.priority)}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {notification.channels.map((channel) => (
                              <Badge key={channel} variant="outline" className="text-xs">
                                {channel === 'in_app' && '📱'}
                                {channel === 'email' && '📧'}
                                {channel === 'sms' && '📲'}
                                {channel}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(notification.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            {notification.total_recipients}
                          </div>
                        </TableCell>
                        <TableCell>
                          {notification.status === 'sent' && notification.stats ? (
                            <div className="text-sm">
                              <div>📨 {notification.stats.delivery_rate}%</div>
                              <div>👁️ {notification.stats.read_rate}%</div>
                            </div>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {notification.sent_at ? (
                              <div>
                                <div>Στάλθηκε</div>
                                <div className="text-muted-foreground">
                                  {format(new Date(notification.sent_at), 'dd/MM HH:mm', { locale: el })}
                                </div>
                              </div>
                            ) : notification.scheduled_at ? (
                              <div>
                                <div>Προγραμματισμένη</div>
                                <div className="text-muted-foreground">
                                  {format(new Date(notification.scheduled_at), 'dd/MM HH:mm', { locale: el })}
                                </div>
                              </div>
                            ) : (
                              <div className="text-muted-foreground">
                                {format(new Date(notification.created_at), 'dd/MM HH:mm', { locale: el })}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedNotification(notification)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {notification.status === 'draft' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSendNotification(notification)}
                                >
                                  <Send className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            {(notification.status === 'draft' || notification.status === 'scheduled') && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteNotification(notification.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

            {/* Modals */}
            {showCreateModal && (
              <NotificationCreateModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={() => {
                  fetchNotifications();
                  fetchStats();
                }}
              />
            )}

            {showFiltersModal && (
              <NotificationFiltersModal
                isOpen={showFiltersModal}
                onClose={() => setShowFiltersModal(false)}
              />
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}