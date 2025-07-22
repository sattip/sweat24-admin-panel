import { useState, useEffect } from "react";
import {
  UserPlus,
  Search,
  Eye,
  Edit,
  Trash2,
  Clock,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";
import { usersApi, packagesApi } from "@/services/apiService";
import type { User, Package } from "@/data/mockData";
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
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { NewUserModal } from "@/components/NewUserModal";



export function UsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  // Load data from API
  useEffect(() => {
    loadData();
  }, [currentPage]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersResponse, packagesResponse] = await Promise.all([
        usersApi.getAll({ page: currentPage }),
        packagesApi.getAll()
      ]);
      
      // Handle paginated response
      if (usersResponse.data) {
        setUsers(usersResponse.data);
        setTotalPages(usersResponse.last_page || 1);
        setTotalUsers(usersResponse.total || 0);
      } else {
        setUsers(usersResponse);
      }
      setPackages(packagesResponse);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast({
        title: "Σφάλμα",
        description: "Αποτυχία φόρτωσης δεδομένων. Παρακαλώ δοκιμάστε ξανά.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUserCreated = async (user: any) => {
    // Refresh the users list
    await loadData();
    setIsNewUserModalOpen(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active": return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">Ενεργός</Badge>;
      case "expired": return <Badge variant="destructive">Έληξε</Badge>;
      case "inactive": return <Badge variant="secondary">Ανενεργός</Badge>;
      case "pending_approval": return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
          <Clock className="h-3 w-3 mr-1" />
          Εκκρεμεί Έγκριση
        </Badge>
      );
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε αυτόν τον χρήστη;')) return;
    
    try {
      await usersApi.delete(userId);
      toast({
        title: "Επιτυχία",
        description: "Ο χρήστης διαγράφηκε επιτυχώς.",
      });
      await loadData();
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Σφάλμα",
        description: "Αποτυχία διαγραφής χρήστη.",
        variant: "destructive"
      });
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <AdminHeader />
          <main className="flex-1 p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Διαχείριση Πελατών</h1>
                <p className="text-muted-foreground">Δημιουργία, επεξεργασία και παρακολούθηση πελατών.</p>
              </div>
              <NewUserModal 
                isOpen={isNewUserModalOpen}
                onOpenChange={setIsNewUserModalOpen}
                onUserCreated={handleUserCreated}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Λίστα Πελατών</CardTitle>
                <div className="relative mt-2">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Αναζήτηση με όνομα ή email..." className="w-full max-w-sm pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ονοματεπώνυμο</TableHead>
                      <TableHead>Επικοινωνία</TableHead>
                      <TableHead>Ενεργό Πακέτο</TableHead>
                      <TableHead className="text-center">Κατάσταση</TableHead>
                      <TableHead className="text-right">Ενέργειες</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={5} className="text-center h-24">Φόρτωση...</TableCell></TableRow>
                    ) : filteredUsers.length > 0 ? filteredUsers.map((user) => {
                      const activePackage = user.packages?.find(p => p.status === 'active');
                      return (
                      <TableRow key={user.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar><AvatarImage src={user.avatar || undefined} /><AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                            <span className="font-medium">{user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>{user.email}</div>
                          <div className="text-muted-foreground text-sm">{user.phone}</div>
                        </TableCell>
                        <TableCell>
                          <div>{activePackage?.name || 'Κανένα'}</div>
                          <div className="text-muted-foreground text-sm">
                            {activePackage ? `Απομένουν: ${isFinite(activePackage.remainingSessions) ? activePackage.remainingSessions : '∞'}` : ''}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{getStatusBadge(user.status)}</TableCell>
                        <TableCell className="text-right">
                          <Link to={`/users/${user.id}`} className={buttonVariants({ variant: "ghost", size: "icon" })} title="Προβολή"><Eye className="h-4 w-4" /></Link>
                          <Link to={`/users/${user.id}/edit`} className={buttonVariants({ variant: "ghost", size: "icon" })} title="Επεξεργασία"><Edit className="h-4 w-4" /></Link>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" title="Διαγραφή" onClick={() => handleDeleteUser(user.id)}><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    )}) : (
                      <TableRow><TableCell colSpan={5} className="text-center h-24">Δεν βρέθηκαν πελάτες.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
                {totalUsers > 0 && (
                  <div className="flex justify-between items-center p-4">
                    <div className="text-sm text-muted-foreground">
                      Εμφάνιση {((currentPage - 1) * 20) + 1} - {Math.min(currentPage * 20, totalUsers)} από {totalUsers} πελάτες
                    </div>
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            href="#" 
                            onClick={(e) => { e.preventDefault(); setCurrentPage(prev => Math.max(1, prev - 1)); }}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>
                        {[...Array(totalPages)].map((_, i) => (
                          <PaginationItem key={i}>
                            <PaginationLink 
                              href="#" 
                              onClick={(e) => { e.preventDefault(); setCurrentPage(i + 1); }}
                              isActive={currentPage === i + 1}
                            >
                              {i + 1}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext 
                            href="#" 
                            onClick={(e) => { e.preventDefault(); setCurrentPage(prev => Math.min(totalPages, prev + 1)); }}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
} 