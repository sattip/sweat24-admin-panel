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
  Building2,
  Tag,
  QrCode,
} from "lucide-react";
import { partnersApi } from "@/api/modules/partners";

interface PartnerBusiness {
  id: number;
  name: string;
  description: string;
  logo_url: string;
  address: string;
  phone: string;
  is_active: boolean;
  offers?: PartnerOffer[];
}

interface PartnerOffer {
  id: number;
  partner_business_id: number;
  title: string;
  description: string;
  discount_percentage: number;
  promo_code: string;
  valid_from: string;
  valid_until: string;
  usage_limit: number;
  used_count: number;
  is_active: boolean;
}

interface OfferRedemption {
  id: number;
  partner_offer_id: number;
  user_id: number;
  redemption_code: string;
  redeemed_at: string;
  used_at: string | null;
  verification_code: string;
  user?: {
    name: string;
    email: string;
  };
  offer?: PartnerOffer;
}

export default function PartnersPage() {
  const { toast } = useToast();
  const [partners, setPartners] = useState<PartnerBusiness[]>([]);
  const [offers, setOffers] = useState<PartnerOffer[]>([]);
  const [redemptions, setRedemptions] = useState<OfferRedemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [openPartnerDialog, setOpenPartnerDialog] = useState(false);
  const [openOfferDialog, setOpenOfferDialog] = useState(false);
  const [editingPartner, setEditingPartner] = useState<PartnerBusiness | null>(null);
  const [editingOffer, setEditingOffer] = useState<PartnerOffer | null>(null);
  const [partnerFormData, setPartnerFormData] = useState({
    name: '',
    description: '',
    logo_url: '',
    address: '',
    phone: '',
    is_active: true,
  });
  const [offerFormData, setOfferFormData] = useState({
    partner_business_id: 0,
    title: '',
    description: '',
    discount_percentage: 0,
    promo_code: '',
    valid_from: '',
    valid_until: '',
    usage_limit: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchPartners(),
        fetchOffers(),
        fetchRedemptions(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPartners = async () => {
    try {
      const data = await partnersApi.getPartners();
      setPartners(data);
    } catch (error) {
      console.error('Error fetching partners:', error);
    }
  };

  const fetchOffers = async () => {
    try {
      const data = await partnersApi.getOffers();
      setOffers(data);
    } catch (error) {
      console.error('Error fetching offers:', error);
    }
  };

  const fetchRedemptions = async () => {
    try {
      const data = await partnersApi.getRedemptions();
      setRedemptions(data);
    } catch (error) {
      console.error('Error fetching redemptions:', error);
    }
  };

  const handleOpenPartnerDialog = (partner?: PartnerBusiness) => {
    if (partner) {
      setEditingPartner(partner);
      setPartnerFormData({
        name: partner.name,
        description: partner.description,
        logo_url: partner.logo_url,
        address: partner.address,
        phone: partner.phone,
        is_active: partner.is_active,
      });
    } else {
      setEditingPartner(null);
      setPartnerFormData({
        name: '',
        description: '',
        logo_url: '',
        address: '',
        phone: '',
        is_active: true,
      });
    }
    setOpenPartnerDialog(true);
  };

  const handleOpenOfferDialog = (offer?: PartnerOffer) => {
    if (offer) {
      setEditingOffer(offer);
      setOfferFormData({
        partner_business_id: offer.partner_business_id,
        title: offer.title,
        description: offer.description,
        discount_percentage: offer.discount_percentage,
        promo_code: offer.promo_code,
        valid_from: offer.valid_from,
        valid_until: offer.valid_until,
        usage_limit: offer.usage_limit,
        is_active: offer.is_active,
      });
    } else {
      // Check if we have partners available
      if (partners.length === 0) {
        toast({
          title: "Σφάλμα",
          description: "Πρέπει να δημιουργήσετε πρώτα έναν συνεργάτη",
          variant: "destructive",
        });
        return;
      }
      
      setEditingOffer(null);
      
      // Generate a suggested promo code
      const suggestedPromoCode = `PROMO${Date.now().toString().slice(-6)}`;
      
      // Set default dates (from today, valid for 3 months)
      const today = new Date().toISOString().split('T')[0];
      const threeMonthsLater = new Date();
      threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
      const validUntil = threeMonthsLater.toISOString().split('T')[0];
      
      setOfferFormData({
        partner_business_id: partners[0]?.id || 0,
        title: '',
        description: '',
        discount_percentage: 10,
        promo_code: suggestedPromoCode,
        valid_from: today,
        valid_until: validUntil,
        usage_limit: 100,
        is_active: true,
      });
    }
    setOpenOfferDialog(true);
  };

  const handleSubmitPartner = async () => {
    try {
      if (editingPartner) {
        await partnersApi.updatePartner(editingPartner.id, partnerFormData);
        toast({
          title: "Επιτυχία",
          description: "Ο συνεργάτης ενημερώθηκε",
        });
      } else {
        await partnersApi.createPartner(partnerFormData);
        toast({
          title: "Επιτυχία",
          description: "Ο συνεργάτης δημιουργήθηκε",
        });
      }
      fetchPartners();
      setOpenPartnerDialog(false);
    } catch (error) {
      console.error('Error saving partner:', error);
      toast({
        title: "Σφάλμα",
        description: "Αποτυχία αποθήκευσης",
        variant: "destructive",
      });
    }
  };

  const handleSubmitOffer = async () => {
    try {
      // Validate required fields
      if (!offerFormData.partner_business_id || offerFormData.partner_business_id === 0) {
        toast({
          title: "Σφάλμα",
          description: "Παρακαλώ επιλέξτε συνεργάτη",
          variant: "destructive",
        });
        return;
      }

      if (!offerFormData.title.trim()) {
        toast({
          title: "Σφάλμα",
          description: "Παρακαλώ εισάγετε τίτλο προσφοράς",
          variant: "destructive",
        });
        return;
      }

      if (!offerFormData.promo_code.trim()) {
        toast({
          title: "Σφάλμα",
          description: "Παρακαλώ εισάγετε κωδικό προσφοράς",
          variant: "destructive",
        });
        return;
      }

      if (!offerFormData.valid_from || !offerFormData.valid_until) {
        toast({
          title: "Σφάλμα",
          description: "Παρακαλώ εισάγετε ημερομηνίες ισχύος",
          variant: "destructive",
        });
        return;
      }

      // Prepare data - ensure usage_limit is at least 0
      const dataToSend = {
        ...offerFormData,
        usage_limit: offerFormData.usage_limit || 0,
      };

      if (editingOffer) {
        await partnersApi.updateOffer(editingOffer.id, dataToSend);
        toast({
          title: "Επιτυχία",
          description: "Η προσφορά ενημερώθηκε",
        });
      } else {
        await partnersApi.createOffer(dataToSend);
        toast({
          title: "Επιτυχία",
          description: "Η προσφορά δημιουργήθηκε",
        });
      }
      fetchOffers();
      setOpenOfferDialog(false);
    } catch (error: any) {
      console.error('Error saving offer:', error);
      
      // Handle different types of errors
      let errorMessage = "Αποτυχία αποθήκευσης";
      
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        if (errors.promo_code?.[0]) {
          errorMessage = `Κωδικός προσφοράς: ${errors.promo_code[0]}`;
        } else if (errors.partner_business_id?.[0]) {
          errorMessage = `Συνεργάτης: ${errors.partner_business_id[0]}`;
        } else {
          errorMessage = Object.values(errors)[0]?.[0] || errorMessage;
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast({
        title: "Σφάλμα",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleDeletePartner = async (id: number) => {
    if (window.confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε αυτόν τον συνεργάτη;')) {
      try {
        await partnersApi.deletePartner(id);
        fetchPartners();
        toast({
          title: "Επιτυχία",
          description: "Ο συνεργάτης διαγράφηκε",
        });
      } catch (error) {
        console.error('Error deleting partner:', error);
        toast({
          title: "Σφάλμα",
          description: "Αποτυχία διαγραφής",
          variant: "destructive",
        });
      }
    }
  };

  const handleDeleteOffer = async (id: number) => {
    if (window.confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε αυτή την προσφορά;')) {
      try {
        await partnersApi.deleteOffer(id);
        fetchOffers();
        toast({
          title: "Επιτυχία",
          description: "Η προσφορά διαγράφηκε",
        });
      } catch (error) {
        console.error('Error deleting offer:', error);
        toast({
          title: "Σφάλμα",
          description: "Αποτυχία διαγραφής",
          variant: "destructive",
        });
      }
    }
  };

  const getPartnerName = (partnerId: number) => {
    const partner = partners.find(p => p.id === partnerId);
    return partner?.name || 'N/A';
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
                <h1 className="text-3xl font-bold text-foreground">Συνεργαζόμενες Επιχειρήσεις</h1>
                <p className="text-muted-foreground">
                  Διαχείριση συνεργατών και προσφορών
                </p>
              </div>
              <div className="flex gap-2">
                <Dialog open={openPartnerDialog} onOpenChange={setOpenPartnerDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-primary/90 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Νέος Συνεργάτης
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {editingPartner ? 'Επεξεργασία Συνεργάτη' : 'Νέος Συνεργάτης'}
                      </DialogTitle>
                      <DialogDescription>
                        Συμπληρώστε τα στοιχεία του συνεργάτη
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div>
                        <Label htmlFor="name">Όνομα</Label>
                        <Input
                          id="name"
                          value={partnerFormData.name}
                          onChange={(e) => setPartnerFormData({...partnerFormData, name: e.target.value})}
                          placeholder="π.χ. Health Food Store"
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Περιγραφή</Label>
                        <Textarea
                          id="description"
                          value={partnerFormData.description}
                          onChange={(e) => setPartnerFormData({...partnerFormData, description: e.target.value})}
                          placeholder="Περιγράψτε τον συνεργάτη..."
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="logo_url">URL Logo</Label>
                        <Input
                          id="logo_url"
                          value={partnerFormData.logo_url}
                          onChange={(e) => setPartnerFormData({...partnerFormData, logo_url: e.target.value})}
                          placeholder="https://example.com/logo.png"
                        />
                      </div>
                      <div>
                        <Label htmlFor="address">Διεύθυνση</Label>
                        <Input
                          id="address"
                          value={partnerFormData.address}
                          onChange={(e) => setPartnerFormData({...partnerFormData, address: e.target.value})}
                          placeholder="π.χ. Λεωφ. Αθηνών 100"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Τηλέφωνο</Label>
                        <Input
                          id="phone"
                          value={partnerFormData.phone}
                          onChange={(e) => setPartnerFormData({...partnerFormData, phone: e.target.value})}
                          placeholder="2101234567"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="active"
                          checked={partnerFormData.is_active}
                          onCheckedChange={(checked) => setPartnerFormData({...partnerFormData, is_active: checked})}
                        />
                        <Label htmlFor="active">Ενεργός</Label>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setOpenPartnerDialog(false)}>
                        Ακύρωση
                      </Button>
                      <Button onClick={handleSubmitPartner}>
                        Αποθήκευση
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={openOfferDialog} onOpenChange={setOpenOfferDialog}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline"
                      onClick={() => handleOpenOfferDialog()}
                    >
                      <Tag className="h-4 w-4 mr-2" />
                      Νέα Προσφορά
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {editingOffer ? 'Επεξεργασία Προσφοράς' : 'Νέα Προσφορά'}
                      </DialogTitle>
                      <DialogDescription>
                        Συμπληρώστε τα στοιχεία της προσφοράς
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div>
                        <Label htmlFor="partner">Συνεργάτης</Label>
                        <Select
                          value={offerFormData.partner_business_id.toString()}
                          onValueChange={(value) => setOfferFormData({...offerFormData, partner_business_id: parseInt(value)})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Επιλέξτε συνεργάτη" />
                          </SelectTrigger>
                          <SelectContent>
                            {partners.map((partner) => (
                              <SelectItem key={partner.id} value={partner.id.toString()}>
                                {partner.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="title">Τίτλος</Label>
                        <Input
                          id="title"
                          value={offerFormData.title}
                          onChange={(e) => setOfferFormData({...offerFormData, title: e.target.value})}
                          placeholder="π.χ. 15% έκπτωση"
                        />
                      </div>
                      <div>
                        <Label htmlFor="offer-description">Περιγραφή</Label>
                        <Textarea
                          id="offer-description"
                          value={offerFormData.description}
                          onChange={(e) => setOfferFormData({...offerFormData, description: e.target.value})}
                          placeholder="Περιγράψτε την προσφορά..."
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="discount">Ποσοστό Έκπτωσης (%)</Label>
                          <Input
                            id="discount"
                            type="number"
                            value={offerFormData.discount_percentage}
                            onChange={(e) => setOfferFormData({...offerFormData, discount_percentage: parseInt(e.target.value)})}
                            placeholder="15"
                          />
                        </div>
                        <div>
                          <Label htmlFor="promo_code">Κωδικός Προσφοράς</Label>
                          <Input
                            id="promo_code"
                            value={offerFormData.promo_code}
                            onChange={(e) => setOfferFormData({...offerFormData, promo_code: e.target.value})}
                            placeholder="SWEAT24"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="valid_from">Ισχύει Από</Label>
                          <Input
                            id="valid_from"
                            type="date"
                            value={offerFormData.valid_from}
                            onChange={(e) => setOfferFormData({...offerFormData, valid_from: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="valid_until">Ισχύει Έως</Label>
                          <Input
                            id="valid_until"
                            type="date"
                            value={offerFormData.valid_until}
                            onChange={(e) => setOfferFormData({...offerFormData, valid_until: e.target.value})}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="usage_limit">Όριο Χρήσεων (0 για απεριόριστο)</Label>
                        <Input
                          id="usage_limit"
                          type="number"
                          value={offerFormData.usage_limit}
                          onChange={(e) => setOfferFormData({...offerFormData, usage_limit: parseInt(e.target.value)})}
                          placeholder="0"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="offer-active"
                          checked={offerFormData.is_active}
                          onCheckedChange={(checked) => setOfferFormData({...offerFormData, is_active: checked})}
                        />
                        <Label htmlFor="offer-active">Ενεργή</Label>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setOpenOfferDialog(false)}>
                        Ακύρωση
                      </Button>
                      <Button onClick={handleSubmitOffer}>
                        Αποθήκευση
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <Tabs defaultValue="partners" className="space-y-4">
              <TabsList>
                <TabsTrigger value="partners">Συνεργάτες</TabsTrigger>
                <TabsTrigger value="offers">Προσφορές</TabsTrigger>
                <TabsTrigger value="redemptions">Εξαργυρώσεις</TabsTrigger>
              </TabsList>

              <TabsContent value="partners" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Συνεργάτες</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Logo</TableHead>
                          <TableHead>Όνομα</TableHead>
                          <TableHead>Περιγραφή</TableHead>
                          <TableHead>Διεύθυνση</TableHead>
                          <TableHead>Τηλέφωνο</TableHead>
                          <TableHead className="text-center">Κατάσταση</TableHead>
                          <TableHead className="text-right">Ενέργειες</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {partners.map((partner) => (
                          <TableRow key={partner.id}>
                            <TableCell>
                              <Avatar>
                                <AvatarImage src={partner.logo_url} alt={partner.name} />
                                <AvatarFallback>
                                  <Building2 className="h-4 w-4" />
                                </AvatarFallback>
                              </Avatar>
                            </TableCell>
                            <TableCell className="font-medium">{partner.name}</TableCell>
                            <TableCell>{partner.description}</TableCell>
                            <TableCell>{partner.address}</TableCell>
                            <TableCell>{partner.phone}</TableCell>
                            <TableCell className="text-center">
                              <Badge variant={partner.is_active ? "success" : "secondary"}>
                                {partner.is_active ? 'Ενεργός' : 'Ανενεργός'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleOpenPartnerDialog(partner)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeletePartner(partner.id)}
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

              <TabsContent value="offers" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Προσφορές</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Συνεργάτης</TableHead>
                          <TableHead>Τίτλος</TableHead>
                          <TableHead>Περιγραφή</TableHead>
                          <TableHead className="text-center">Έκπτωση</TableHead>
                          <TableHead>Κωδικός</TableHead>
                          <TableHead className="text-center">Χρήσεις</TableHead>
                          <TableHead>Ισχύει</TableHead>
                          <TableHead className="text-center">Κατάσταση</TableHead>
                          <TableHead className="text-right">Ενέργειες</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {offers.map((offer) => (
                          <TableRow key={offer.id}>
                            <TableCell>{getPartnerName(offer.partner_business_id)}</TableCell>
                            <TableCell className="font-medium">{offer.title}</TableCell>
                            <TableCell>{offer.description}</TableCell>
                            <TableCell className="text-center">{offer.discount_percentage}%</TableCell>
                            <TableCell className="font-mono">{offer.promo_code}</TableCell>
                            <TableCell className="text-center">
                              {offer.used_count || 0}/{offer.usage_limit || '∞'}
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {new Date(offer.valid_from).toLocaleDateString('el-GR')} - 
                                {new Date(offer.valid_until).toLocaleDateString('el-GR')}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant={offer.is_active ? "success" : "secondary"}>
                                {offer.is_active ? 'Ενεργή' : 'Ανενεργή'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleOpenOfferDialog(offer)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteOffer(offer.id)}
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

              <TabsContent value="redemptions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Εξαργυρώσεις</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ημερομηνία</TableHead>
                          <TableHead>Χρήστης</TableHead>
                          <TableHead>Προσφορά</TableHead>
                          <TableHead>Κωδικός Εξαργύρωσης</TableHead>
                          <TableHead>Κωδικός Επαλήθευσης</TableHead>
                          <TableHead className="text-center">Χρησιμοποιήθηκε</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {redemptions.map((redemption) => (
                          <TableRow key={redemption.id}>
                            <TableCell>
                              {new Date(redemption.redeemed_at).toLocaleDateString('el-GR')}
                            </TableCell>
                            <TableCell>{redemption.user?.name || 'N/A'}</TableCell>
                            <TableCell>{redemption.offer?.title || 'N/A'}</TableCell>
                            <TableCell className="font-mono">{redemption.redemption_code}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <QrCode className="h-4 w-4" />
                                <span className="font-mono">{redemption.verification_code}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant={redemption.used_at ? "success" : "secondary"}>
                                {redemption.used_at ? 'Ναι' : 'Όχι'}
                              </Badge>
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