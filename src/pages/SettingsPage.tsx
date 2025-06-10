import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminHeader } from "@/components/AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
  Settings,
  Building,
  Users,
  Bell,
  Clock,
  Euro,
  Shield,
  Save,
  Upload,
  Download,
  Smartphone,
  Mail,
  Calendar,
  Palette,
  Database,
} from "lucide-react";

export function SettingsPage() {
  const [gymSettings, setGymSettings] = useState({
    name: "Sweat24 Γυμναστήριο",
    address: "Λεωφόρος Αθηνών 123, Αθήνα",
    phone: "210 1234567",
    email: "info@sweat24.gr",
    website: "www.sweat24.gr",
    openingHours: "06:00 - 23:00",
    maxCapacity: 50,
    enableWaitlist: true,
    cancellationPolicy: 24, // ώρες
    enableNotifications: true,
    enableSMS: true,
    enableEmail: true,
  });

  const [systemSettings, setSystemSettings] = useState({
    autoBackup: true,
    backupFrequency: "καθημερινά",
    sessionTimeout: 60, // λεπτά
    enableLogging: true,
    debugMode: false,
    maintenanceMode: false,
    maxFileSize: 10, // MB
    allowedFileTypes: "jpg,png,pdf",
  });

  const [pricingSettings, setPricingSettings] = useState({
    basicPackage: 50.00,
    premiumPackage: 80.00,
    unlimitedPackage: 120.00,
    personalTraining: 35.00,
    emsSession: 25.00,
    pilatesSession: 20.00,
    trialSession: 10.00,
    currency: "EUR",
    taxRate: 24, // %
  });

  const handleSaveSettings = (section: string) => {
    // Εδώ θα προστεθεί η λογική αποθήκευσης
    console.log(`Αποθήκευση ρυθμίσεων ${section}`);
    alert(`Οι ρυθμίσεις ${section} αποθηκεύτηκαν επιτυχώς!`);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <AdminHeader />
          <main className="flex-1 p-6 space-y-6">
            {/* Κεφαλίδα */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Ρυθμίσεις Συστήματος</h1>
                <p className="text-muted-foreground">
                  Διαχείριση γενικών ρυθμίσεων και παραμέτρων του γυμναστηρίου
                </p>
              </div>
              <Button className="bg-primary hover:bg-primary/90">
                <Save className="h-4 w-4 mr-2" />
                Αποθήκευση Όλων
              </Button>
            </div>

            {/* Καρτέλες Ρυθμίσεων */}
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general">Γενικά</TabsTrigger>
                <TabsTrigger value="pricing">Ρυθμίσεις Χρεώσεων</TabsTrigger>
                <TabsTrigger value="system">Σύστημα</TabsTrigger>
                <TabsTrigger value="backup">Αντίγραφα</TabsTrigger>
              </TabsList>

              {/* Γενικές Ρυθμίσεις */}
              <TabsContent value="general" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      Στοιχεία Γυμναστηρίου
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Όνομα Γυμναστηρίου</Label>
                        <Input
                          value={gymSettings.name}
                          onChange={(e) => setGymSettings({...gymSettings, name: e.target.value})}
                          placeholder="Εισάγετε το όνομα του γυμναστηρίου"
                        />
                      </div>
                      <div>
                        <Label>Τηλέφωνο</Label>
                        <Input
                          value={gymSettings.phone}
                          onChange={(e) => setGymSettings({...gymSettings, phone: e.target.value})}
                          placeholder="π.χ. 210 1234567"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Διεύθυνση</Label>
                      <Input
                        value={gymSettings.address}
                        onChange={(e) => setGymSettings({...gymSettings, address: e.target.value})}
                        placeholder="Εισάγετε την πλήρη διεύθυνση"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Ηλεκτρονικό Ταχυδρομείο</Label>
                        <Input
                          type="email"
                          value={gymSettings.email}
                          onChange={(e) => setGymSettings({...gymSettings, email: e.target.value})}
                          placeholder="π.χ. info@sweat24.gr"
                        />
                      </div>
                      <div>
                        <Label>Ιστοσελίδα</Label>
                        <Input
                          value={gymSettings.website}
                          onChange={(e) => setGymSettings({...gymSettings, website: e.target.value})}
                          placeholder="π.χ. www.sweat24.gr"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Ώρες Λειτουργίας</Label>
                        <Input
                          value={gymSettings.openingHours}
                          onChange={(e) => setGymSettings({...gymSettings, openingHours: e.target.value})}
                          placeholder="π.χ. 06:00 - 23:00"
                        />
                      </div>
                      <div>
                        <Label>Μέγιστη Χωρητικότητα</Label>
                        <Input
                          type="number"
                          value={gymSettings.maxCapacity}
                          onChange={(e) => setGymSettings({...gymSettings, maxCapacity: parseInt(e.target.value)})}
                          placeholder="π.χ. 50"
                        />
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleSaveSettings("γυμναστηρίου")}
                      className="w-fit"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Αποθήκευση Στοιχείων
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Πολιτικές Κρατήσεων
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Ενεργοποίηση Λίστας Αναμονής</Label>
                        <p className="text-sm text-muted-foreground">Επιτρέπει στους πελάτες να μπουν σε λίστα αναμονής όταν το μάθημα είναι γεμάτο</p>
                      </div>
                      <Switch
                        checked={gymSettings.enableWaitlist}
                        onCheckedChange={(checked) => setGymSettings({...gymSettings, enableWaitlist: checked})}
                      />
                    </div>
                    <div>
                      <Label>Πολιτική Ακύρωσης (ώρες πριν την έναρξη)</Label>
                      <Select 
                        value={gymSettings.cancellationPolicy.toString()} 
                        onValueChange={(value) => setGymSettings({...gymSettings, cancellationPolicy: parseInt(value)})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Επιλέξτε χρονικό όριο" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">2 ώρες</SelectItem>
                          <SelectItem value="4">4 ώρες</SelectItem>
                          <SelectItem value="12">12 ώρες</SelectItem>
                          <SelectItem value="24">24 ώρες</SelectItem>
                          <SelectItem value="48">48 ώρες</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Μηνύματα SMS</Label>
                        <p className="text-sm text-muted-foreground">Αποστολή SMS για κρατήσεις και υπενθυμίσεις</p>
                      </div>
                      <Switch
                        checked={gymSettings.enableSMS}
                        onCheckedChange={(checked) => setGymSettings({...gymSettings, enableSMS: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Ειδοποιήσεις Email</Label>
                        <p className="text-sm text-muted-foreground">Αποστολή email για ενημερώσεις και υπενθυμίσεις</p>
                      </div>
                      <Switch
                        checked={gymSettings.enableEmail}
                        onCheckedChange={(checked) => setGymSettings({...gymSettings, enableEmail: checked})}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Ρυθμίσεις Τιμολογίου */}
              <TabsContent value="pricing" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Euro className="h-5 w-5" />
                      Ρυθμίσεις Χρεώσεων και Τιμολογίου
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <h3 className="text-lg font-semibold text-primary">Πακέτα Συνδρομών</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Βασικό Πακέτο (€)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={pricingSettings.basicPackage}
                          onChange={(e) => setPricingSettings({...pricingSettings, basicPackage: parseFloat(e.target.value)})}
                          placeholder="π.χ. 50.00"
                        />
                        <p className="text-xs text-muted-foreground mt-1">10 επισκέψεις τον μήνα</p>
                      </div>
                      <div>
                        <Label>Πρέμιουμ Πακέτο (€)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={pricingSettings.premiumPackage}
                          onChange={(e) => setPricingSettings({...pricingSettings, premiumPackage: parseFloat(e.target.value)})}
                          placeholder="π.χ. 80.00"
                        />
                        <p className="text-xs text-muted-foreground mt-1">20 επισκέψεις τον μήνα</p>
                      </div>
                      <div>
                        <Label>Απεριόριστο Πακέτο (€)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={pricingSettings.unlimitedPackage}
                          onChange={(e) => setPricingSettings({...pricingSettings, unlimitedPackage: parseFloat(e.target.value)})}
                          placeholder="π.χ. 120.00"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Απεριόριστες επισκέψεις</p>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-primary">Ειδικές Υπηρεσίες</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Προσωπική Προπόνηση (€)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={pricingSettings.personalTraining}
                          onChange={(e) => setPricingSettings({...pricingSettings, personalTraining: parseFloat(e.target.value)})}
                          placeholder="π.χ. 35.00"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Ανά συνεδρία 1 ώρας</p>
                      </div>
                      <div>
                        <Label>Συνεδρία EMS (€)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={pricingSettings.emsSession}
                          onChange={(e) => setPricingSettings({...pricingSettings, emsSession: parseFloat(e.target.value)})}
                          placeholder="π.χ. 25.00"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Ανά συνεδρία 20 λεπτών</p>
                      </div>
                      <div>
                        <Label>Συνεδρία Pilates (€)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={pricingSettings.pilatesSession}
                          onChange={(e) => setPricingSettings({...pricingSettings, pilatesSession: parseFloat(e.target.value)})}
                          placeholder="π.χ. 20.00"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Ανά συνεδρία 45 λεπτών</p>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-primary">Λοιπές Χρεώσεις</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Δοκιμαστική Συνεδρία (€)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={pricingSettings.trialSession}
                          onChange={(e) => setPricingSettings({...pricingSettings, trialSession: parseFloat(e.target.value)})}
                          placeholder="π.χ. 10.00"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Για νέους πελάτες</p>
                      </div>
                      <div>
                        <Label>Νόμισμα</Label>
                        <Select value={pricingSettings.currency} onValueChange={(value) => setPricingSettings({...pricingSettings, currency: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Επιλέξτε νόμισμα" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="EUR">Ευρώ (€)</SelectItem>
                            <SelectItem value="USD">Δολάριο ΗΠΑ ($)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Συντελεστής ΦΠΑ (%)</Label>
                        <Input
                          type="number"
                          value={pricingSettings.taxRate}
                          onChange={(e) => setPricingSettings({...pricingSettings, taxRate: parseFloat(e.target.value)})}
                          placeholder="π.χ. 24"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Τρέχων συντελεστής ΦΠΑ</p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleSaveSettings("τιμολογίου")}
                      className="w-fit"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Αποθήκευση Τιμών
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Ρυθμίσεις Συστήματος */}
              <TabsContent value="system" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Ρυθμίσεις Συστήματος και Ασφάλειας
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Αυτόματο Αντίγραφο Ασφαλείας</Label>
                        <p className="text-sm text-muted-foreground">Καθημερινή αυτόματη δημιουργία αντιγράφων ασφαλείας</p>
                      </div>
                      <Switch
                        checked={systemSettings.autoBackup}
                        onCheckedChange={(checked) => setSystemSettings({...systemSettings, autoBackup: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Λειτουργία Συντήρησης</Label>
                        <p className="text-sm text-muted-foreground">Απενεργοποίηση πρόσβασης χρηστών για συντήρηση συστήματος</p>
                      </div>
                      <Switch
                        checked={systemSettings.maintenanceMode}
                        onCheckedChange={(checked) => setSystemSettings({...systemSettings, maintenanceMode: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Λειτουργία Αποσφαλμάτωσης</Label>
                        <p className="text-sm text-muted-foreground">Αποθήκευση αναλυτικών αρχείων καταγραφής για τεχνική υποστήριξη</p>
                      </div>
                      <Switch
                        checked={systemSettings.debugMode}
                        onCheckedChange={(checked) => setSystemSettings({...systemSettings, debugMode: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Καταγραφή Δραστηριοτήτων</Label>
                        <p className="text-sm text-muted-foreground">Αποθήκευση αρχείων καταγραφής για όλες τις δραστηριότητες</p>
                      </div>
                      <Switch
                        checked={systemSettings.enableLogging}
                        onCheckedChange={(checked) => setSystemSettings({...systemSettings, enableLogging: checked})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Χρονικό Όριο Συνεδρίας (λεπτά)</Label>
                        <Input
                          type="number"
                          value={systemSettings.sessionTimeout}
                          onChange={(e) => setSystemSettings({...systemSettings, sessionTimeout: parseInt(e.target.value)})}
                          placeholder="π.χ. 60"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Αυτόματη αποσύνδεση μετά από αδράνεια</p>
                      </div>
                      <div>
                        <Label>Μέγιστο Μέγεθος Αρχείου (MB)</Label>
                        <Input
                          type="number"
                          value={systemSettings.maxFileSize}
                          onChange={(e) => setSystemSettings({...systemSettings, maxFileSize: parseInt(e.target.value)})}
                          placeholder="π.χ. 10"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Μέγιστο μέγεθος για μεταφόρτωση αρχείων</p>
                      </div>
                    </div>
                    <div>
                      <Label>Επιτρεπόμενοι Τύποι Αρχείων</Label>
                      <Input
                        value={systemSettings.allowedFileTypes}
                        onChange={(e) => setSystemSettings({...systemSettings, allowedFileTypes: e.target.value})}
                        placeholder="π.χ. jpg,png,pdf,doc"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Διαχωρίστε με κόμμα τους επιτρεπόμενους τύπους</p>
                    </div>
                    <Button 
                      onClick={() => handleSaveSettings("συστήματος")}
                      className="w-fit"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Αποθήκευση Ρυθμίσεων
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Ρυθμίσεις Αντιγράφων Ασφαλείας */}
              <TabsContent value="backup" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      Διαχείριση Αντιγράφων Ασφαλείας
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Button className="h-16 flex flex-col items-center">
                        <Download className="h-6 w-6 mb-2" />
                        Δημιουργία Αντιγράφου
                      </Button>
                      <Button variant="outline" className="h-16 flex flex-col items-center">
                        <Upload className="h-6 w-6 mb-2" />
                        Επαναφορά από Αντίγραφο
                      </Button>
                    </div>
                    <div>
                      <Label>Συχνότητα Αυτόματου Αντιγράφου</Label>
                      <Select 
                        value={systemSettings.backupFrequency} 
                        onValueChange={(value) => setSystemSettings({...systemSettings, backupFrequency: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Επιλέξτε συχνότητα" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="καθημερινά">Καθημερινά</SelectItem>
                          <SelectItem value="εβδομαδιαία">Εβδομαδιαία</SelectItem>
                          <SelectItem value="μηνιαία">Μηνιαία</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Πρόσφατα Αντίγραφα Ασφαλείας</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>αντιγραφο_2024_05_24.sql</span>
                          <Badge variant="outline">2.3 MB</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>αντιγραφο_2024_05_23.sql</span>
                          <Badge variant="outline">2.1 MB</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>αντιγραφο_2024_05_22.sql</span>
                          <Badge variant="outline">2.0 MB</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                      <h4 className="font-medium text-yellow-800 mb-1">Σημαντική Υπενθύμιση</h4>
                      <p className="text-sm text-yellow-700">
                        Συνιστάται η τακτική δημιουργία αντιγράφων ασφαλείας και η φύλαξή τους σε εξωτερικό χώρο αποθήκευσης.
                      </p>
                    </div>
                    <Button 
                      onClick={() => handleSaveSettings("αντιγράφων")}
                      className="w-fit"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Αποθήκευση Ρυθμίσεων
                    </Button>
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