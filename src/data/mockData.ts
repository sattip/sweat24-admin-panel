// apps/admin-panel/src/data/mockData.ts
import { format } from "date-fns";

export type UserPackage = {
  id: string;
  packageId: string;
  name: string;
  assignedDate: string;
  expiryDate: string;
  remainingSessions: number;
  totalSessions: number;
  status: "active" | "paused" | "expired";
};

export type ActivityLog = {
  date: string;
  action: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  membershipType: string;
  joinDate: string;
  remainingSessions: number;
  totalSessions: number;
  status: "active" | "inactive" | "expired";
  lastVisit: string;
  medicalHistory: string;
  avatar: string | null;
  packages: UserPackage[];
  activityLog: ActivityLog[];
};

export type Package = {
  id: string;
  name: string;
  price: number;
  sessions: number;
  duration: number;
  type: string;
  status: "active" | "inactive";
};

export type Booking = {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  className: string;
  instructor: string;
  date: string;
  time: string;
  status: "confirmed" | "pending" | "cancelled" | "waitlist" | "completed";
  type: "group" | "personal";
  attended: boolean | null;
  bookingTime: string;
  location: string;
  avatar: string | null;
  cancellationReason?: string;
};

export type Class = {
  id: string;
  name: string;
  type: string;
  instructor: string;
  date: string;
  time: string;
  duration: number;
  maxParticipants: number;
  currentParticipants: number;
  location: string;
  description: string;
  status: "active" | "cancelled" | "booked";
};

export type Instructor = {
  id: string;
  name: string;
  specialties: string[];
  email?: string;
  phone?: string;
  hourlyRate: number; // Ωριαία αμοιβή σε €
  monthlyBonus?: number; // Μηνιαίο bonus σε €
  commissionRate?: number; // Ποσοστό επί του τζίρου (π.χ. 0.15 για 15%)
  contractType: 'hourly' | 'salary' | 'commission'; // Τύπος σύμβασης
  status: 'active' | 'inactive' | 'vacation';
  joinDate: string;
  totalRevenue: number; // Συνολικός τζίρος που έχει φέρει
  completedSessions: number; // Ολοκληρωμένες συνεδρίες
};

export type WorkTimeEntry = {
  id: string;
  instructorId: string;
  date: string;
  startTime: string;
  endTime: string;
  hoursWorked: number;
  description: string;
  approved: boolean;
  approvedBy?: string;
  approvedAt?: string;
};

export type PayrollAgreement = {
  id: string;
  instructorId: string;
  instructorName: string;
  description: string;
  type: 'bonus' | 'deduction' | 'special_rate';
  amount: number;
  isRecurring: boolean; // Αν επαναλαμβάνεται κάθε μήνα
  startDate: string;
  endDate?: string;
  isActive: boolean;
};

export const mockInstructorsData: Instructor[] = [
  { 
    id: "1", 
    name: "Άλεξ Ροδρίγκεζ", 
    specialties: ["HIIT", "Strength"],
    email: "alex@sweat24.com",
    phone: "6944111222",
    hourlyRate: 25,
    monthlyBonus: 100,
    commissionRate: 0.10,
    contractType: 'hourly',
    status: 'active',
    joinDate: "2020-03-15",
    totalRevenue: 4500,
    completedSessions: 180
  },
  { 
    id: "2", 
    name: "Εμιλι Τσεν", 
    specialties: ["Yoga", "Pilates"],
    email: "emily@sweat24.com",
    phone: "6955222333",
    hourlyRate: 30,
    commissionRate: 0.15,
    contractType: 'commission',
    status: 'active',
    joinDate: "2021-01-20",
    totalRevenue: 3800,
    completedSessions: 145
  },
  { 
    id: "3", 
    name: "Τζέιμς Τέιλορ", 
    specialties: ["Personal Training", "Powerlifting"],
    email: "james@sweat24.com",
    phone: "6966333444",
    hourlyRate: 35,
    monthlyBonus: 150,
    contractType: 'salary',
    status: 'active',
    joinDate: "2019-08-10",
    totalRevenue: 6200,
    completedSessions: 220
  },
  { 
    id: "4", 
    name: "Σάρα Τζόνσον", 
    specialties: ["Group Fitness", "Cardio"],
    email: "sarah@sweat24.com",
    phone: "6977444555",
    hourlyRate: 22,
    monthlyBonus: 50,
    contractType: 'hourly',
    status: 'active',
    joinDate: "2022-02-14",
    totalRevenue: 2100,
    completedSessions: 95
  },
  { 
    id: "5", 
    name: "Μάρκους Ουίλιαμς", 
    specialties: ["CrossFit", "Olympic Lifting"],
    email: "marcus@sweat24.com",
    phone: "6988555666",
    hourlyRate: 28,
    commissionRate: 0.12,
    contractType: 'commission',
    status: 'active',
    joinDate: "2021-09-05",
    totalRevenue: 3200,
    completedSessions: 128
  },
];

export const mockClassesData: Class[] = [
  {
    id: "1",
    name: "HIIT Blast",
    type: "group",
    instructor: "Άλεξ Ροδρίγκεζ",
    date: "2024-05-24",
    time: "09:00",
    duration: 45,
    maxParticipants: 12,
    currentParticipants: 8,
    location: "Main Floor",
    description: "Υψηλή ένταση καρδιοαγγειακής προπόνησης",
    status: "active",
  },
  {
    id: "2",
    name: "Yoga Flow",
    type: "group",
    instructor: "Εμιλι Τσεν",
    date: "2024-05-24",
    time: "18:00",
    duration: 60,
    maxParticipants: 15,
    currentParticipants: 12,
    location: "Studio A",
    description: "Ρελακσάρισμα και ευελιξία",
    status: "active",
  },
  {
    id: "3",
    name: "Personal Training",
    type: "personal",
    instructor: "Τζέιμς Τέιλορ",
    date: "2024-05-24",
    time: "16:00",
    duration: 60,
    maxParticipants: 1,
    currentParticipants: 1,
    location: "Weight Room",
    description: "Εξατομικευμένη προπόνηση δύναμης",
    status: "booked",
  },
];

export const mockPackagesData: Package[] = [
  {
    id: "pkg_01",
    name: "Personal Training - 12 Συνεδρίες",
    price: 300,
    sessions: 12,
    duration: 90, // σε ημέρες
    type: "Personal",
    status: "active",
  },
  {
    id: "pkg_02",
    name: "Group Fitness Pass - 1 Μήνας",
    price: 80,
    sessions: Infinity, // Απεριόριστες
    duration: 30,
    type: "Group",
    status: "active",
  },
  {
    id: "pkg_03",
    name: "Yoga & Pilates - 10 Συνεδρίες",
    price: 150,
    sessions: 10,
    duration: 60,
    type: "Yoga/Pilates",
    status: "active",
  },
  {
    id: "pkg_04",
    name: "Δοκιμαστικό Πακέτο",
    price: 20,
    sessions: 3,
    duration: 14,
    type: "Trial",
    status: "inactive",
  },
];

export const mockUsersData: User[] = [
  {
    id: "1",
    name: "Γιάννης Παπαδόπουλος",
    email: "giannis@email.com",
    phone: "6944123456",
    membershipType: "Premium",
    joinDate: "2024-01-15",
    remainingSessions: 8, // This is legacy, we should rely on package data
    totalSessions: 20, // This is legacy, we should rely on package data
    status: "active",
    lastVisit: "2024-05-20",
    medicalHistory: "Χωρίς ιδιαίτερες παθήσεις",
    avatar: null,
    packages: [
        { id: "userPkg_1", packageId: "pkg_01", name: "Personal Training - 12 Συνεδρίες", assignedDate: "2024-03-01", expiryDate: "2024-05-30", remainingSessions: 5, totalSessions: 12, status: "active" },
        { id: "userPkg_2", packageId: "pkg_02", name: "Group Fitness Pass - 1 Μήνας", assignedDate: "2024-02-01", expiryDate: "2024-03-01", remainingSessions: 0, totalSessions: Infinity, status: "expired" },
    ],
    activityLog: [
        { date: "2024-03-01", action: "Αγορά πακέτου 'Personal Training - 12 Συνεδρίες'" },
        { date: "2024-03-05", action: "Check-in: Personal Training" },
    ]
  },
  {
    id: "2",
    name: "Μαρία Κωνσταντίνου",
    email: "maria@email.com",
    phone: "6955234567",
    membershipType: "Basic",
    joinDate: "2024-02-10",
    remainingSessions: 3,
    totalSessions: 10,
    status: "active",
    lastVisit: "2024-05-18",
    medicalHistory: "Πρόβλημα στη μέση",
    avatar: null,
    packages: [
        { id: "userPkg_3", packageId: "pkg_03", name: "Yoga & Pilates - 10 Συνεδρίες", assignedDate: "2024-05-01", expiryDate: "2024-07-01", remainingSessions: 8, totalSessions: 10, status: "active" },
    ],
    activityLog: [
        { date: "2024-05-01", action: "Αγορά πακέτου 'Yoga & Pilates - 10 Συνεδρίες'" },
    ]
  },
  {
    id: "3",
    name: "Κώστας Δημητρίου",
    email: "kostas@email.com",
    phone: "6966345678",
    membershipType: "Premium",
    joinDate: "2024-03-05",
    remainingSessions: 0,
    totalSessions: 15,
    status: "expired",
    lastVisit: "2024-05-10",
    medicalHistory: "Αθλητικός τραυματισμός γόνατος",
    avatar: null,
    packages: [],
    activityLog: []
  },
  {
    id: "4",
    name: "Κώστας Νέος",
    email: "kostas.neos@email.com",
    phone: "6977111222",
    membershipType: "Basic",
    joinDate: "2024-05-24",
    remainingSessions: 0,
    totalSessions: 0,
    status: "active",
    lastVisit: "2024-05-24",
    medicalHistory: "Χωρίς ιδιαίτερες παθήσεις",
    avatar: null,
    packages: [],
    activityLog: [
      { date: "2024-05-24", action: "Εγγραφή στο γυμναστήριο" },
    ]
  },
];

export const mockBookingsData: Booking[] = [
  {
    id: "1",
    userId: "1",
    customerName: "Γιάννης Παπαδόπουλος",
    customerEmail: "giannis@email.com",
    className: "HIIT Blast",
    instructor: "Άλεξ Ροδρίγκεζ",
    date: "2024-05-24",
    time: "09:00",
    status: "confirmed",
    type: "group",
    attended: null,
    bookingTime: "2024-05-23T14:30:00",
    location: "Main Floor",
    avatar: null,
  },
  {
    id: "2",
    userId: "2",
    customerName: "Μαρία Κωνσταντίνου",
    customerEmail: "maria@email.com",
    className: "Yoga Flow",
    instructor: "Εμιλι Τσεν",
    date: "2024-05-24",
    time: "18:00",
    status: "confirmed",
    type: "group",
    attended: true,
    bookingTime: "2024-05-22T10:15:00",
    location: "Studio A",
    avatar: null,
  },
  {
    id: "3",
    userId: "3",
    customerName: "Κώστας Δημητρίου",
    customerEmail: "kostas@email.com",
    className: "Personal Training",
    instructor: "Τζέιμς Τέιλορ",
    date: "2024-05-23",
    time: "16:00",
    status: "cancelled",
    type: "personal",
    attended: false,
    bookingTime: "2024-05-20T09:45:00",
    location: "Weight Room",
    avatar: null,
    cancellationReason: "Ακύρωση εντός 6 ωρών - χρεώθηκε",
  },
    {
    id: "4",
    userId: "1", // Another booking for user 1
    customerName: "Γιάννης Παπαδόπουλος",
    customerEmail: "giannis@email.com",
    className: "Personal Training",
    instructor: "Τζέιμς Τέιλορ",
    date: format(new Date(), "yyyy-MM-dd"), // Today's date for testing check-in
    time: "11:00",
    status: "confirmed",
    type: "personal",
    attended: null,
    bookingTime: "2024-05-25T10:00:00",
    location: "Weight Room",
    avatar: null,
  },
  {
    id: "5",
    userId: "3", // Booking for user with no active packages
    customerName: "Κώστας Δημητρίου",
    customerEmail: "kostas@email.com",
    className: "CrossFit Intro",
    instructor: "Άλεξ Ροδρίγκεζ",
    date: format(new Date(), "yyyy-MM-dd"), // Today's date for testing check-in
    time: "17:00",
    status: "confirmed",
    type: "group",
    attended: null,
    bookingTime: "2024-05-26T11:00:00",
    location: "Main Floor",
    avatar: null,
  },
];

export type OwnerNotification = {
  id: string;
  type: 'graceful_cancellation' | 'package_extension' | 'general';
  title: string;
  message: string;
  trainerName: string;
  customerName: string;
  bookingId?: string;
  packageId?: string;
  timestamp: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
};

export const mockOwnerNotifications: OwnerNotification[] = [
  {
    id: "notif_1",
    type: "graceful_cancellation",
    title: "Χαριστική Ακύρωση από Προπονητή",
    message: "Ο προπονητής Τζέιμς Τέιλορ ακύρωσε το ραντεβού του πελάτη Γιάννης Παπαδόπουλος εντός του χρονικού ορίου χρέωσης.",
    trainerName: "Τζέιμς Τέιλορ",
    customerName: "Γιάννης Παπαδόπουλος",
    bookingId: "booking_demo_1",
    timestamp: "2024-05-24T10:30:00Z",
    isRead: false,
    priority: "high"
  },
  {
    id: "notif_2", 
    type: "package_extension",
    title: "Επέκταση Πακέτου από Προπονητή",
    message: "Ο προπονητής Εμιλι Τσεν επέκτεινε το πακέτο του πελάτη Μαρία Κωνσταντίνου κατά 7 ημέρες.",
    trainerName: "Εμιλι Τσεν",
    customerName: "Μαρία Κωνσταντίνου", 
    packageId: "userPkg_3",
    timestamp: "2024-05-23T14:15:00Z",
    isRead: true,
    priority: "medium"
  }
];

export const mockWorkTimeEntries: WorkTimeEntry[] = [
  {
    id: "wte_1",
    instructorId: "1",
    date: "2024-05-24",
    startTime: "09:00",
    endTime: "17:00",
    hoursWorked: 8,
    description: "Προπονήσεις HIIT και Strength Training",
    approved: true,
    approvedBy: "Διαχειριστής",
    approvedAt: "2024-05-24T18:00:00Z"
  },
  {
    id: "wte_2",
    instructorId: "2",
    date: "2024-05-24",
    startTime: "10:00",
    endTime: "18:00",
    hoursWorked: 8,
    description: "Yoga Flow και Pilates μαθήματα",
    approved: false
  },
  {
    id: "wte_3",
    instructorId: "3",
    date: "2024-05-23",
    startTime: "06:00",
    endTime: "14:00",
    hoursWorked: 8,
    description: "Personal Training sessions",
    approved: true,
    approvedBy: "Διαχειριστής",
    approvedAt: "2024-05-23T15:00:00Z"
  }
];

export const mockPayrollAgreements: PayrollAgreement[] = [
  {
    id: "pa_1",
    instructorId: "1",
    instructorName: "Άλεξ Ροδρίγκεζ",
    description: "Έξτρα bonus για υψηλή απόδοση",
    type: "bonus",
    amount: 100,
    isRecurring: true,
    startDate: "2024-01-01",
    isActive: true
  },
  {
    id: "pa_2",
    instructorId: "3",
    instructorName: "Τζέιμς Τέιλορ",
    description: "Ειδική αμοιβή για εκπαίδευση νέων προπονητών",
    type: "bonus",
    amount: 150,
    isRecurring: true,
    startDate: "2024-03-01",
    isActive: true
  },
  {
    id: "pa_3",
    instructorId: "2",
    instructorName: "Εμιλι Τσεν",
    description: "Προσωρινό έξτρα για καλοκαιρινή περίοδο",
    type: "bonus",
    amount: 200,
    isRecurring: false,
    startDate: "2024-06-01",
    endDate: "2024-08-31",
    isActive: true
  }
];

export type PaymentInstallment = {
  id: string;
  customerId: string;
  customerName: string;
  packageId: string;
  packageName: string;
  installmentNumber: number;
  totalInstallments: number;
  amount: number;
  dueDate: string;
  paidDate?: string;
  paymentMethod?: 'cash' | 'card' | 'transfer';
  status: 'pending' | 'paid' | 'overdue';
  notes?: string;
};

export type CashRegisterEntry = {
  id: string;
  type: 'income' | 'withdrawal';
  amount: number;
  description: string;
  category: string;
  timestamp: string;
  userId: string; // Διαχειριστής που έκανε την καταχώρηση
  paymentMethod?: 'cash' | 'card' | 'transfer';
  relatedEntityId?: string; // ID πελάτη ή πακέτου αν σχετίζεται
  relatedEntityType?: 'customer' | 'package' | 'expense' | 'other';
};

export type BusinessExpense = {
  id: string;
  category: 'utilities' | 'equipment' | 'maintenance' | 'supplies' | 'marketing' | 'other';
  subcategory: string;
  description: string;
  amount: number;
  date: string;
  vendor?: string;
  receipt?: string; // URL αποδείξης
  paymentMethod: 'cash' | 'card' | 'transfer';
  approved: boolean;
  approvedBy?: string;
  notes?: string;
};

export type CustomerPricingAccess = {
  customerId: string;
  customerName: string;
  hasAccess: boolean;
  firstPurchaseDate?: string;
  firstPurchaseAmount?: number;
  unlockedBy: string; // ID διαχειριστή
  unlockedAt: string;
  notes?: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
};

export const mockCustomers: Customer[] = [
  {
    id: "1",
    name: "Μαρία Παπαδοπούλου",
    email: "maria@example.com",
    phone: "6944123456",
    status: "active"
  },
  {
    id: "2", 
    name: "Γιάννης Κωνσταντίνου",
    email: "giannis@example.com",
    phone: "6955654321",
    status: "active"
  },
  {
    id: "3",
    name: "Άννα Μιχαήλ",
    email: "anna@example.com", 
    phone: "6966789123",
    status: "active"
  },
  {
    id: "4",
    name: "Κώστας Νέος",
    email: "kostas@example.com",
    phone: "6977111222",
    status: "active"
  }
];

export type GymPackage = {
  id: string;
  name: string;
  price: number;
  duration: number; // σε ημέρες
  sessions?: number; // αριθμός συνεδριών, undefined για απεριόριστες
  type: 'membership' | 'personal' | 'special';
  description: string;
};

export const mockGymPackages: GymPackage[] = [
  {
    id: "pkg_basic_1m",
    name: "Basic Membership 1 μήνας",
    price: 50,
    duration: 30,
    type: "membership",
    description: "Βασική συνδρομή για ομαδικά μαθήματα"
  },
  {
    id: "pkg_basic_3m",
    name: "Basic Membership 3 μήνες",
    price: 140,
    duration: 90,
    type: "membership",
    description: "Βασική συνδρομή 3 μηνών με έκπτωση"
  },
  {
    id: "pkg_premium_6m",
    name: "Premium Membership 6 μήνες",
    price: 300,
    duration: 180,
    type: "membership",
    description: "Premium πρόσβαση σε όλες τις υπηρεσίες"
  },
  {
    id: "pkg_personal_8",
    name: "Personal Training 8 συνεδρίες",
    price: 240,
    duration: 60,
    sessions: 8,
    type: "personal",
    description: "8 προσωπικές προπονήσεις"
  },
  {
    id: "pkg_personal_12",
    name: "Personal Training 12 συνεδρίες",
    price: 350,
    duration: 90,
    sessions: 12,
    type: "personal",
    description: "12 προσωπικές προπονήσεις με έκπτωση"
  }
];

export const mockPaymentInstallments: PaymentInstallment[] = [
  {
    id: "inst_1",
    customerId: "1",
    customerName: "Μαρία Παπαδοπούλου",
    packageId: "pkg_premium",
    packageName: "Premium Membership 6 μήνες",
    installmentNumber: 1,
    totalInstallments: 3,
    amount: 200,
    dueDate: "2024-05-15",
    paidDate: "2024-05-14",
    paymentMethod: "card",
    status: "paid",
    notes: "Πληρωμή πρώτης δόσης"
  },
  {
    id: "inst_2",
    customerId: "1",
    customerName: "Μαρία Παπαδοπούλου",
    packageId: "pkg_premium",
    packageName: "Premium Membership 6 μήνες",
    installmentNumber: 2,
    totalInstallments: 3,
    amount: 200,
    dueDate: "2024-06-15",
    status: "pending"
  },
  {
    id: "inst_3",
    customerId: "2",
    customerName: "Γιάννης Κωνσταντίνου",
    packageId: "pkg_basic",
    packageName: "Basic Membership 3 μήνες",
    installmentNumber: 1,
    totalInstallments: 1,
    amount: 150,
    dueDate: "2024-05-20",
    status: "overdue"
  },
  {
    id: "inst_4",
    customerId: "4",
    customerName: "Κώστας Νέος",
    packageId: "pkg_basic_1m",
    packageName: "Basic Membership 1 μήνας",
    installmentNumber: 1,
    totalInstallments: 1,
    amount: 50,
    dueDate: "2024-05-25",
    status: "pending",
    notes: "Πρώτη αγορά νέου πελάτη - θα ξεκλειδώσει τον τιμοκατάλογο"
  }
];

export const mockCashRegisterEntries: CashRegisterEntry[] = [
  {
    id: "cr_1",
    type: "income",
    amount: 200,
    description: "Πληρωμή πακέτου - Μαρία Παπαδοπούλου",
    category: "Package Payment",
    timestamp: "2024-05-24T10:30:00Z",
    userId: "admin1",
    paymentMethod: "card",
    relatedEntityId: "1",
    relatedEntityType: "customer"
  },
  {
    id: "cr_2",
    type: "income",
    amount: 50,
    description: "Personal Training - Άλεξ Ροδρίγκεζ",
    category: "Personal Training",
    timestamp: "2024-05-24T14:00:00Z",
    userId: "admin1",
    paymentMethod: "cash",
    relatedEntityId: "1",
    relatedEntityType: "customer"
  },
  {
    id: "cr_3",
    type: "withdrawal",
    amount: 500,
    description: "Ανάληψη ιδιοκτήτη",
    category: "Owner Withdrawal",
    timestamp: "2024-05-24T16:00:00Z",
    userId: "admin1",
    paymentMethod: "cash"
  },
  {
    id: "cr_4",
    type: "income",
    amount: 25,
    description: "Πώληση supplements",
    category: "Retail Sales",
    timestamp: "2024-05-24T11:15:00Z",
    userId: "admin1",
    paymentMethod: "cash"
  }
];

export const mockBusinessExpenses: BusinessExpense[] = [
  {
    id: "exp_1",
    category: "utilities",
    subcategory: "Ηλεκτρικό ρεύμα",
    description: "Λογαριασμός ΔΕΗ Μαΐου",
    amount: 320,
    date: "2024-05-20",
    vendor: "ΔΕΗ",
    paymentMethod: "transfer",
    approved: true,
    approvedBy: "admin1"
  },
  {
    id: "exp_2",
    category: "equipment",
    subcategory: "Συντήρηση μηχανημάτων",
    description: "Επισκευή treadmill #3",
    amount: 150,
    date: "2024-05-22",
    vendor: "TechnoGym Service",
    paymentMethod: "cash",
    approved: true,
    approvedBy: "admin1"
  },
  {
    id: "exp_3",
    category: "supplies",
    subcategory: "Καθαριστικά",
    description: "Καθαριστικά προϊόντα",
    amount: 80,
    date: "2024-05-23",
    vendor: "CleanPro",
    paymentMethod: "card",
    approved: false,
    notes: "Εκκρεμεί έγκριση"
  }
];

export const mockCustomerPricingAccess: CustomerPricingAccess[] = [
  {
    customerId: "1",
    customerName: "Μαρία Παπαδοπούλου",
    hasAccess: true,
    firstPurchaseDate: "2024-05-14",
    firstPurchaseAmount: 200,
    unlockedBy: "admin1",
    unlockedAt: "2024-05-14T10:30:00Z",
    notes: "Αυτόματο ξεκλείδωμα μετά την πρώτη πληρωμή"
  },
  {
    customerId: "2",
    customerName: "Γιάννης Κωνσταντίνου",
    hasAccess: false,
    unlockedBy: "",
    unlockedAt: "",
    notes: "Εκκρεμεί πρώτη πληρωμή"
  },
  {
    customerId: "3",
    customerName: "Άννα Μιχαήλ",
    hasAccess: true,
    firstPurchaseDate: "2024-04-10",
    firstPurchaseAmount: 300,
    unlockedBy: "admin1", 
    unlockedAt: "2024-04-10T14:20:00Z",
    notes: "Χειροκίνητο ξεκλείδωμα - VIP πελάτης"
  },
  {
    customerId: "4",
    customerName: "Κώστας Νέος",
    hasAccess: false,
    unlockedBy: "",
    unlockedAt: "",
    notes: "Νέος πελάτης - εκκρεμεί πρώτη πληρωμή"
  }
]; 