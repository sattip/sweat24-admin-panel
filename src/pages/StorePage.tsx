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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Package,
  Plus,
  Search,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  Euro,
  BarChart3,
  Edit,
  Trash2,
  Eye,
  Archive,
} from "lucide-react";

// Mock data για προϊόντα
const mockProducts = [
  {
    id: "1",
    name: "Premium Protein Powder",
    category: "supplements",
    price: 59.99,
    cost: 35.00,
    stock: 25,
    minStock: 10,
    status: "active",
    sales: 156,
    revenue: 9359.44,
    description: "High-quality whey protein for optimal muscle recovery",
    image: "https://images.unsplash.com/photo-1582562124811-c09040d0a901",
    supplier: "SupplementCorp",
    sku: "SPP001",
  },
  {
    id: "2",
    name: "Στολή EMS Training",
    category: "ems_gear",
    price: 89.99,
    cost: 45.00,
    stock: 8,
    minStock: 5,
    status: "active",
    sales: 23,
    revenue: 2069.77,
    description: "Professional EMS training vest",
    image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9",
    supplier: "EMSGear Pro",
    sku: "EMS001",
  },
  {
    id: "3",
    name: "Κάλυμμα Pilates Mat",
    category: "pilates_accessories",
    price: 24.99,
    cost: 12.00,
    stock: 3,
    minStock: 15,
    status: "low_stock",
    sales: 89,
    revenue: 2224.11,
    description: "Antibacterial pilates mat cover",
    image: "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1",
    supplier: "PilatesPro",
    sku: "PIL001",
  },
  {
    id: "4",
    name: "Cambridge Meal Replacement",
    category: "cambridge",
    price: 34.99,
    cost: 18.00,
    stock: 45,
    minStock: 20,
    status: "active",
    sales: 78,
    revenue: 2729.22,
    description: "Complete meal replacement shake",
    image: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07",
    supplier: "Cambridge Weight Plan",
    sku: "CWP001",
  },
  {
    id: "5",
    name: "Sweat24 Towel",
    category: "accessories",
    price: 19.99,
    cost: 8.00,
    stock: 0,
    minStock: 25,
    status: "out_of_stock",
    sales: 203,
    revenue: 4059.97,
    description: "High-quality gym towel with Sweat24 branding",
    image: "https://images.unsplash.com/photo-1574680096145-d05b474e2155",
    supplier: "Local Supplier",
    sku: "SW24001",
  },
];

const categories = [
  { value: "supplements", label: "Συμπληρώματα", icon: Package },
  { value: "ems_gear", label: "Στολές EMS", icon: Package },
  { value: "pilates_accessories", label: "Καλύμματα Pilates", icon: Package },
  { value: "cambridge", label: "Cambridge", icon: Package },
  { value: "accessories", label: "Αξεσουάρ", icon: Package },
];

const paymentMethods = [
  { value: "iris", label: "IRIS", color: "bg-blue-100 text-blue-800" },
  { value: "pos", label: "POS", color: "bg-green-100 text-green-800" },
  { value: "cash", label: "Μετρητά", color: "bg-yellow-100 text-yellow-800" },
];

// Mock sales data
const salesData = [
  {
    id: "1",
    productName: "Premium Protein Powder",
    quantity: 2,
    price: 59.99,
    total: 119.98,
    paymentMethod: "pos",
    customerName: "Γιάννης Παπαδόπουλος",
    date: "2024-05-24",
    time: "14:30",
  },
  {
    id: "2",
    productName: "Στολή EMS Training",
    quantity: 1,
    price: 89.99,
    total: 89.99,
    paymentMethod: "iris",
    customerName: "Μαρία Κωνσταντίνου",
    date: "2024-05-24",
    time: "10:15",
  },
  {
    id: "3",
    productName: "Cambridge Meal Replacement",
    quantity: 3,
    price: 34.99,
    total: 104.97,
    paymentMethod: "cash",
    customerName: "Κώστας Δημητρίου",
    date: "2024-05-23",
    time: "16:45",
  },
];

export function StorePage() {
  const [products, setProducts] = useState(mockProducts);
  const [sales, setSales] = useState(salesData);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    cost: "",
    stock: "",
    minStock: "",
    description: "",
    supplier: "",
    sku: "",
  });

  const filteredProducts = products.filter((product) => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || product.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status: string, stock: number, minStock: number) => {
    if (status === "out_of_stock" || stock === 0) {
      return <Badge variant="destructive">Εξαντλήθηκε</Badge>;
    }
    if (status === "low_stock" || stock <= minStock) {
      return <Badge variant="outline" className="bg-orange-100 text-orange-800">Χαμηλό Στοκ</Badge>;
    }
    if (status === "active") {
      return <Badge variant="default" className="bg-green-100 text-green-800">Διαθέσιμο</Badge>;
    }
    return <Badge variant="secondary">Ανενεργό</Badge>;
  };

  const getCategoryLabel = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat?.label || category;
  };

  const getPaymentMethodBadge = (method: string) => {
    const pm = paymentMethods.find(p => p.value === method);
    return pm ? (
      <Badge className={pm.color}>{pm.label}</Badge>
    ) : (
      <Badge variant="outline">{method}</Badge>
    );
  };

  const handleCreateProduct = () => {
    const newProduct = {
      id: Date.now().toString(),
      name: formData.name,
      category: formData.category,
      price: parseFloat(formData.price),
      cost: parseFloat(formData.cost),
      stock: parseInt(formData.stock),
      minStock: parseInt(formData.minStock),
      status: parseInt(formData.stock) > parseInt(formData.minStock) ? "active" : "low_stock",
      sales: 0,
      revenue: 0,
      description: formData.description,
      image: null,
      supplier: formData.supplier,
      sku: formData.sku,
    };

    setProducts([...products, newProduct]);
    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      price: "",
      cost: "",
      stock: "",
      minStock: "",
      description: "",
      supplier: "",
      sku: "",
    });
  };

  const totalRevenue = products.reduce((sum, p) => sum + p.revenue, 0);
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.stock <= p.minStock).length;
  const outOfStockProducts = products.filter(p => p.stock === 0).length;

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
                <h1 className="text-3xl font-bold text-foreground">Διαχείριση Καταστήματος</h1>
                <p className="text-muted-foreground">
                  Διαχείριση προϊόντων, αποθέματος και πωλήσεων
                </p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Νέο Προϊόν
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Προσθήκη Νέου Προϊόντος</DialogTitle>
                    <DialogDescription>
                      Εισάγετε τα στοιχεία του νέου προϊόντος
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Όνομα Προϊόντος *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          placeholder="Εισάγετε το όνομα"
                        />
                      </div>
                      <div>
                        <Label htmlFor="sku">SKU *</Label>
                        <Input
                          id="sku"
                          value={formData.sku}
                          onChange={(e) => setFormData({...formData, sku: e.target.value})}
                          placeholder="π.χ. SPP001"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="category">Κατηγορία *</Label>
                        <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Επιλέξτε κατηγορία" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.value} value={cat.value}>
                                {cat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="supplier">Προμηθευτής</Label>
                        <Input
                          id="supplier"
                          value={formData.supplier}
                          onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                          placeholder="Όνομα προμηθευτή"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price">Τιμή Πώλησης (€) *</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData({...formData, price: e.target.value})}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cost">Κόστος (€) *</Label>
                        <Input
                          id="cost"
                          type="number"
                          step="0.01"
                          value={formData.cost}
                          onChange={(e) => setFormData({...formData, cost: e.target.value})}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="stock">Τρέχον Στοκ *</Label>
                        <Input
                          id="stock"
                          type="number"
                          value={formData.stock}
                          onChange={(e) => setFormData({...formData, stock: e.target.value})}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="minStock">Ελάχιστο Στοκ *</Label>
                        <Input
                          id="minStock"
                          type="number"
                          value={formData.minStock}
                          onChange={(e) => setFormData({...formData, minStock: e.target.value})}
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="description">Περιγραφή</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Περιγραφή του προϊόντος..."
                        rows={3}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Ακύρωση
                    </Button>
                    <Button onClick={handleCreateProduct}>
                      Προσθήκη Προϊόντος
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Συνολικά Έσοδα</CardTitle>
                  <Euro className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">€{totalRevenue.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">
                    από πωλήσεις προϊόντων
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Συνολικά Προϊόντα</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalProducts}</div>
                  <p className="text-xs text-muted-foreground">
                    ενεργά προϊόντα
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Χαμηλό Στοκ</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{lowStockProducts}</div>
                  <p className="text-xs text-muted-foreground">
                    προϊόντα χρειάζονται ανεφοδιασμό
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Εξαντλημένα</CardTitle>
                  <Archive className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{outOfStockProducts}</div>
                  <p className="text-xs text-muted-foreground">
                    προϊόντα εκτός αποθέματος
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Φίλτρα Αναζήτησης</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Αναζήτηση προϊόντος ή SKU..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Κατηγορία" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Όλες οι κατηγορίες</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Κατάσταση" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Όλες οι καταστάσεις</SelectItem>
                      <SelectItem value="active">Διαθέσιμα</SelectItem>
                      <SelectItem value="low_stock">Χαμηλό Στοκ</SelectItem>
                      <SelectItem value="out_of_stock">Εξαντλημένα</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    Εξαγωγή Αναφοράς
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Main Content Tabs */}
            <Tabs defaultValue="products" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="products">Προϊόντα</TabsTrigger>
                <TabsTrigger value="sales">Πωλήσεις</TabsTrigger>
              </TabsList>

              {/* Products Tab */}
              <TabsContent value="products" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Κατάλογος Προϊόντων</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Προϊόν</TableHead>
                          <TableHead>Κατηγορία</TableHead>
                          <TableHead>SKU</TableHead>
                          <TableHead>Τιμή</TableHead>
                          <TableHead>Στοκ</TableHead>
                          <TableHead>Κατάσταση</TableHead>
                          <TableHead>Πωλήσεις</TableHead>
                          <TableHead>Ενέργειες</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProducts.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center">
                                  <Package className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div>
                                  <div className="font-medium">{product.name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {product.supplier}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{getCategoryLabel(product.category)}</Badge>
                            </TableCell>
                            <TableCell>
                              <code className="text-sm bg-muted px-2 py-1 rounded">
                                {product.sku}
                              </code>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div className="font-medium">€{product.price}</div>
                                <div className="text-muted-foreground">
                                  Κόστος: €{product.cost}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div className={`font-medium ${product.stock <= product.minStock ? 'text-red-600' : ''}`}>
                                  {product.stock} τεμ.
                                </div>
                                <div className="text-muted-foreground">
                                  Min: {product.minStock}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(product.status, product.stock, product.minStock)}
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div className="font-medium">{product.sales} τεμ.</div>
                                <div className="text-muted-foreground">
                                  €{product.revenue.toFixed(2)}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button size="sm" variant="ghost">
                                  <Eye className="h-4 w-4" />
                                </Button>
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
              </TabsContent>

              {/* Sales Tab */}
              <TabsContent value="sales" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Πρόσφατες Πωλήσεις</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Προϊόν</TableHead>
                          <TableHead>Πελάτης</TableHead>
                          <TableHead>Ποσότητα</TableHead>
                          <TableHead>Μέθοδος Πληρωμής</TableHead>
                          <TableHead>Σύνολο</TableHead>
                          <TableHead>Ημερομηνία</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sales.map((sale) => (
                          <TableRow key={sale.id}>
                            <TableCell className="font-medium">{sale.productName}</TableCell>
                            <TableCell>{sale.customerName}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{sale.quantity}x</Badge>
                            </TableCell>
                            <TableCell>
                              {getPaymentMethodBadge(sale.paymentMethod)}
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">€{sale.total.toFixed(2)}</div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>{sale.date}</div>
                                <div className="text-muted-foreground">{sale.time}</div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
} 