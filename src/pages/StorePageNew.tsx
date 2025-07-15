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
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { API_ENDPOINTS, apiRequest, getApiUrl } from "@/config/api";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number | string;
  original_price?: number | string;
  stock_quantity?: number;
  description?: string;
  image_url?: string;
  is_active: boolean;
}

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  status: string;
  total: number | string;
  created_at: string;
  items: OrderItem[];
}

interface OrderItem {
  id: number;
  product_name: string;
  price: number | string;
  quantity: number;
  subtotal: number | string;
}

const categories = [
  { value: "supplements", label: "Συμπληρώματα" },
  { value: "apparel", label: "Ρούχα" },
  { value: "accessories", label: "Αξεσουάρ" },
  { value: "equipment", label: "Εξοπλισμός" },
];

const orderStatuses = [
  { value: "pending", label: "Εκκρεμής", color: "bg-yellow-100 text-yellow-800" },
  { value: "processing", label: "Σε επεξεργασία", color: "bg-blue-100 text-blue-800" },
  { value: "ready_for_pickup", label: "Έτοιμη για παραλαβή", color: "bg-green-100 text-green-800" },
  { value: "completed", label: "Ολοκληρωμένη", color: "bg-gray-100 text-gray-800" },
  { value: "cancelled", label: "Ακυρωμένη", color: "bg-red-100 text-red-800" },
];

export function StorePageNew() {
  const [activeTab, setActiveTab] = useState("inventory");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    original_price: "",
    stock_quantity: "",
    description: "",
    image_url: "",
  });

  useEffect(() => {
    fetchProducts();
    if (activeTab === "orders") {
      fetchOrders();
    }
  }, [activeTab]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/admin/store/products');
      
      // Check if data is an array directly or wrapped in a response object
      const productsData = Array.isArray(data) ? data : (data.data || []);
      setProducts(productsData);
    } catch (error) {
      toast.error('Σφάλμα κατά τη φόρτωση προϊόντων');
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/orders');
      
      // Check if data is an array directly or wrapped in a response object
      const ordersData = Array.isArray(data) ? data : (data.data || []);
      setOrders(ordersData);
    } catch (error) {
      toast.error('Σφάλμα κατά τη φόρτωση παραγγελιών');
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      original_price: product.original_price?.toString() || "",
      stock_quantity: product.stock_quantity?.toString() || "",
      description: product.description || "",
      image_url: product.image_url || "",
    });
    setImagePreview(product.image_url || "");
    setIsDialogOpen(true);
  };

  const handleDelete = async (productId: number) => {
    if (!confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε αυτό το προϊόν;')) return;

    try {
      await apiRequest(`/admin/store/products/${productId}`, {
        method: 'DELETE',
      });
      toast.success('Το προϊόν διαγράφηκε επιτυχώς');
      
      // Force refresh of products list
      setTimeout(() => {
        fetchProducts();
      }, 100);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Σφάλμα κατά τη διαγραφή');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Use the image URL from the form
      let imageUrl = formData.image_url || editingProduct?.image_url || "https://images.unsplash.com/photo-1582562124811-c09040d0a901";

      const productData = {
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        stock_quantity: formData.stock_quantity ? parseInt(formData.stock_quantity) : null,
        description: formData.description,
        image_url: imageUrl || "https://images.unsplash.com/photo-1582562124811-c09040d0a901",
        is_active: true,
      };
      if (editingProduct) {
        await apiRequest(`/admin/store/products/${editingProduct.id}`, {
          method: 'PUT',
          body: JSON.stringify(productData),
        });
        toast.success('Το προϊόν ενημερώθηκε επιτυχώς');
      } else {
        await apiRequest('/admin/store/products', {
          method: 'POST',
          body: JSON.stringify(productData),
        });
        toast.success('Το προϊόν δημιουργήθηκε επιτυχώς');
      }
      
      setIsDialogOpen(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Σφάλμα κατά την αποθήκευση: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleOrderStatusUpdate = async (orderId: number, newStatus: string) => {
    try {
      await apiRequest(`/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      
      toast.success('Η κατάσταση της παραγγελίας ενημερώθηκε');
      fetchOrders();
    } catch (error) {
      toast.error('Σφάλμα κατά την ενημέρωση της κατάστασης');
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      price: "",
      original_price: "",
      stock_quantity: "",
      description: "",
      image_url: "",
    });
    setEditingProduct(null);
    setImageFile(null);
    setImagePreview("");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getStatusBadge = (product: Product) => {
    if (!product.is_active) {
      return <Badge variant="secondary">Ανενεργό</Badge>;
    }
    if (product.stock_quantity === 0) {
      return <Badge variant="destructive">Εξαντλήθηκε</Badge>;
    }
    if (product.stock_quantity && product.stock_quantity < 10) {
      return <Badge variant="outline" className="border-orange-500 text-orange-500">
        Χαμηλό απόθεμα
      </Badge>;
    }
    return <Badge variant="default">Διαθέσιμο</Badge>;
  };

  const getOrderStatusBadge = (status: string) => {
    const statusConfig = orderStatuses.find(s => s.value === status);
    return (
      <Badge className={statusConfig?.color || "bg-gray-100 text-gray-800"}>
        {statusConfig?.label || status}
      </Badge>
    );
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <AdminSidebar />
        <main className="flex-1 overflow-auto">
          <AdminHeader />
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold">Κατάστημα</h1>
              <p className="text-gray-600">Διαχείριση προϊόντων και παραγγελιών</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="inventory">Απογραφή</TabsTrigger>
                <TabsTrigger value="products">Προϊόντα</TabsTrigger>
                <TabsTrigger value="orders">Παραγγελίες</TabsTrigger>
              </TabsList>

              <TabsContent value="products" className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Αναζήτηση προϊόντων..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-80"
                      />
                    </div>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Κατηγορία" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Όλες οι κατηγορίες</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => resetForm()}>
                        <Plus className="h-4 w-4 mr-2" />
                        Νέο Προϊόν
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>
                          {editingProduct ? 'Επεξεργασία Προϊόντος' : 'Νέο Προϊόν'}
                        </DialogTitle>
                        <DialogDescription>
                          Συμπληρώστε τα στοιχεία του προϊόντος
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="name">Όνομα Προϊόντος</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="category">Κατηγορία</Label>
                          <Select
                            value={formData.category}
                            onValueChange={(value) => setFormData({ ...formData, category: value })}
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Επιλέξτε κατηγορία" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category.value} value={category.value}>
                                  {category.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="price">Τιμή (€)</Label>
                            <Input
                              id="price"
                              type="number"
                              step="0.01"
                              value={formData.price}
                              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="original_price">Κόστος (€)</Label>
                            <Input
                              id="original_price"
                              type="number"
                              step="0.01"
                              value={formData.original_price}
                              onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="stock_quantity">Απόθεμα</Label>
                          <Input
                            id="stock_quantity"
                            type="number"
                            value={formData.stock_quantity}
                            onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="description">Περιγραφή</Label>
                          <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="image_url">URL Φωτογραφίας</Label>
                          <Input
                            id="image_url"
                            type="url"
                            placeholder="https://example.com/image.jpg"
                            value={formData.image_url}
                            onChange={(e) => {
                              setFormData({ ...formData, image_url: e.target.value });
                              setImagePreview(e.target.value);
                            }}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Προσθέστε URL εικόνας (π.χ. από Unsplash, Imgur, κλπ.)
                          </p>
                          {(imagePreview || formData.image_url) && (
                            <div className="mt-2">
                              <img
                                src={imagePreview || formData.image_url}
                                alt="Preview"
                                className="w-32 h-32 object-cover rounded-md"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "https://via.placeholder.com/150?text=No+Image";
                                }}
                              />
                            </div>
                          )}
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Ακύρωση
                          </Button>
                          <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {editingProduct ? 'Ενημέρωση' : 'Δημιουργία'}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                {loading && !products.length ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <Card>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Εικόνα</TableHead>
                          <TableHead>Προϊόν</TableHead>
                          <TableHead>Κατηγορία</TableHead>
                          <TableHead>Τιμή</TableHead>
                          <TableHead>Απόθεμα</TableHead>
                          <TableHead>Κατάσταση</TableHead>
                          <TableHead>Ενέργειες</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProducts.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell>
                              <img
                                src={product.image_url || "https://via.placeholder.com/50"}
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "https://via.placeholder.com/50";
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{product.name}</div>
                              {product.description && (
                                <div className="text-sm text-gray-500 max-w-xs truncate">
                                  {product.description}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {categories.find(c => c.value === product.category)?.label || product.category}
                              </Badge>
                            </TableCell>
                            <TableCell>€{Number(product.price).toFixed(2)}</TableCell>
                            <TableCell>{product.stock_quantity || '-'}</TableCell>
                            <TableCell>{getStatusBadge(product)}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEdit(product)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDelete(product.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="orders" className="space-y-4">
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <Card>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Αρ. Παραγγελίας</TableHead>
                          <TableHead>Πελάτης</TableHead>
                          <TableHead>Προϊόντα</TableHead>
                          <TableHead>Σύνολο</TableHead>
                          <TableHead>Κατάσταση</TableHead>
                          <TableHead>Ημερομηνία</TableHead>
                          <TableHead>Ενέργειες</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">{order.order_number}</TableCell>
                            <TableCell>
                              <div>{order.customer_name}</div>
                              <div className="text-sm text-gray-500">{order.customer_email}</div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {order.items.map((item, idx) => (
                                  <div key={idx}>
                                    {item.quantity}x {item.product_name}
                                  </div>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>€{Number(order.total).toFixed(2)}</TableCell>
                            <TableCell>{getOrderStatusBadge(order.status)}</TableCell>
                            <TableCell>
                              {new Date(order.created_at).toLocaleDateString('el-GR')}
                            </TableCell>
                            <TableCell>
                              <Select
                                value={order.status}
                                onValueChange={(value) => handleOrderStatusUpdate(order.id, value)}
                                disabled={order.status === 'completed' || order.status === 'cancelled'}
                              >
                                <SelectTrigger className="w-40">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {orderStatuses.map((status) => (
                                    <SelectItem key={status.value} value={status.value}>
                                      {status.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="inventory" className="space-y-4">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Συνολικά Προϊόντα</p>
                          <p className="text-2xl font-bold">{products.length}</p>
                        </div>
                        <Package className="h-10 w-10 text-primary opacity-20" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Συνολική Αξία</p>
                          <p className="text-2xl font-bold">
                            €{products.reduce((sum, p) => sum + (Number(p.price) * (p.stock_quantity || 0)), 0).toFixed(2)}
                          </p>
                        </div>
                        <Euro className="h-10 w-10 text-green-500 opacity-20" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Χαμηλό Απόθεμα</p>
                          <p className="text-2xl font-bold">
                            {products.filter(p => p.stock_quantity && p.stock_quantity < 10).length}
                          </p>
                        </div>
                        <AlertTriangle className="h-10 w-10 text-orange-500 opacity-20" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Εξαντλήθηκαν</p>
                          <p className="text-2xl font-bold">
                            {products.filter(p => p.stock_quantity === 0).length}
                          </p>
                        </div>
                        <Archive className="h-10 w-10 text-red-500 opacity-20" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Inventory Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>Διαχείριση Αποθέματος</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Προϊόν</TableHead>
                          <TableHead>SKU</TableHead>
                          <TableHead>Κατηγορία</TableHead>
                          <TableHead>Τρέχον Απόθεμα</TableHead>
                          <TableHead>Ελάχιστο Απόθεμα</TableHead>
                          <TableHead>Αξία Αποθέματος</TableHead>
                          <TableHead>Κατάσταση</TableHead>
                          <TableHead>Ενέργειες</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {products.map((product) => {
                          const stockValue = Number(product.price) * (product.stock_quantity || 0);
                          const needsRestock = product.stock_quantity && product.stock_quantity < 10;
                          const outOfStock = product.stock_quantity === 0;
                          
                          return (
                            <TableRow key={product.id}>
                              <TableCell>
                                <div className="font-medium">{product.name}</div>
                              </TableCell>
                              <TableCell className="text-gray-600">
                                {product.slug?.toUpperCase() || '-'}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {categories.find(c => c.value === product.category)?.label || product.category}
                                </Badge>
                              </TableCell>
                              <TableCell className={outOfStock ? 'text-red-600 font-medium' : ''}>
                                {product.stock_quantity || 0}
                              </TableCell>
                              <TableCell>10</TableCell>
                              <TableCell>€{stockValue.toFixed(2)}</TableCell>
                              <TableCell>
                                {outOfStock ? (
                                  <Badge variant="destructive">Εξαντλήθηκε</Badge>
                                ) : needsRestock ? (
                                  <Badge variant="outline" className="bg-orange-100 text-orange-800">
                                    Χαμηλό Απόθεμα
                                  </Badge>
                                ) : (
                                  <Badge variant="default" className="bg-green-100 text-green-800">
                                    Διαθέσιμο
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEdit(product)}
                                >
                                  Ενημέρωση Αποθέματος
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}