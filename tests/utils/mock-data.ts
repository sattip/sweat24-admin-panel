import type { 
  User, 
  Package, 
  Booking, 
  Instructor, 
  Class as GymClass,
  PaymentInstallment,
  CashRegisterEntry,
  BusinessExpense,
  UserPackage,
  Settings,
  Assessment,
  BodyMeasurement,
  EnduranceTest,
  StrengthLog
} from '@/data/mockData';

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    membership_type: 'Premium',
    status: 'active',
    join_date: '2024-01-15',
    last_visit: '2024-06-28',
    total_visits: 45,
    notes: 'Regular member, prefers morning classes',
    packages: [],
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+0987654321',
    membership_type: 'Basic',
    status: 'active',
    join_date: '2024-02-20',
    last_visit: '2024-06-27',
    total_visits: 30,
    notes: 'Interested in yoga classes',
    packages: [],
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane',
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    phone: '+1122334455',
    membership_type: 'VIP',
    status: 'inactive',
    join_date: '2023-12-01',
    last_visit: '2024-05-15',
    total_visits: 120,
    notes: 'On hold - traveling',
    packages: [],
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
  },
];

// Mock Packages
export const mockPackages: Package[] = [
  {
    id: '1',
    name: 'Monthly Unlimited',
    description: 'Unlimited access to all gym facilities and classes',
    price: 99.99,
    duration: 30,
    class_credits: -1, // -1 for unlimited
    features: ['Unlimited gym access', 'All group classes', 'Locker room access'],
    status: 'active',
  },
  {
    id: '2',
    name: '10 Class Package',
    description: '10 classes valid for 60 days',
    price: 149.99,
    duration: 60,
    class_credits: 10,
    features: ['10 group classes', 'Valid for 60 days', 'Locker room access'],
    status: 'active',
  },
  {
    id: '3',
    name: 'Personal Training 5-Pack',
    description: '5 personal training sessions',
    price: 299.99,
    duration: 90,
    class_credits: 5,
    features: ['5 PT sessions', 'Valid for 90 days', 'Nutrition consultation'],
    status: 'active',
  },
];

// Mock Instructors
export const mockInstructors: Instructor[] = [
  {
    id: '1',
    name: 'Sarah Wilson',
    email: 'sarah@gym.com',
    phone: '+1234567890',
    specialties: ['Yoga', 'Pilates'],
    bio: 'Certified yoga instructor with 10 years of experience',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    rating: 4.8,
    total_classes: 250,
    status: 'active',
  },
  {
    id: '2',
    name: 'Mike Chen',
    email: 'mike@gym.com',
    phone: '+0987654321',
    specialties: ['CrossFit', 'Strength Training'],
    bio: 'Former athlete, specialized in functional fitness',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
    rating: 4.9,
    total_classes: 180,
    status: 'active',
  },
];

// Mock Classes
export const mockClasses: GymClass[] = [
  {
    id: '1',
    name: 'Morning Yoga Flow',
    instructor: 'Sarah Wilson',
    instructor_id: '1',
    date: '2024-06-29',
    time: '07:00',
    duration: 60,
    capacity: 20,
    enrolled: 15,
    type: 'Yoga',
    level: 'All Levels',
    location: 'Studio A',
    status: 'scheduled',
  },
  {
    id: '2',
    name: 'HIIT Training',
    instructor: 'Mike Chen',
    instructor_id: '2',
    date: '2024-06-29',
    time: '18:00',
    duration: 45,
    capacity: 15,
    enrolled: 12,
    type: 'HIIT',
    level: 'Intermediate',
    location: 'Main Gym',
    status: 'scheduled',
  },
];

// Mock Bookings
export const mockBookings: Booking[] = [
  {
    id: '1',
    user_id: '1',
    user_name: 'John Doe',
    class_id: '1',
    class_name: 'Morning Yoga Flow',
    date: '2024-06-29',
    time: '07:00',
    status: 'confirmed',
    checked_in: false,
    instructor: 'Sarah Wilson',
  },
  {
    id: '2',
    user_id: '2',
    user_name: 'Jane Smith',
    class_id: '2',
    class_name: 'HIIT Training',
    date: '2024-06-29',
    time: '18:00',
    status: 'confirmed',
    checked_in: false,
    instructor: 'Mike Chen',
  },
];

// Mock Payment Installments
export const mockPaymentInstallments: PaymentInstallment[] = [
  {
    id: '1',
    customer_id: '1',
    customer_name: 'John Doe',
    total_amount: 299.99,
    paid_amount: 100.00,
    remaining_amount: 199.99,
    installments: 3,
    paid_installments: 1,
    next_payment_date: '2024-07-15',
    status: 'active',
    package_name: 'Personal Training 5-Pack',
  },
];

// Mock Cash Register Entries
export const mockCashRegisterEntries: CashRegisterEntry[] = [
  {
    id: '1',
    date: '2024-06-29',
    time: '10:30',
    type: 'income',
    category: 'membership',
    amount: 99.99,
    description: 'Monthly membership - John Doe',
    payment_method: 'card',
    recorded_by: 'Admin',
  },
  {
    id: '2',
    date: '2024-06-29',
    time: '14:15',
    type: 'expense',
    category: 'supplies',
    amount: 45.50,
    description: 'Cleaning supplies',
    payment_method: 'cash',
    recorded_by: 'Admin',
  },
];

// Mock Business Expenses
export const mockBusinessExpenses: BusinessExpense[] = [
  {
    id: '1',
    date: '2024-06-28',
    category: 'equipment',
    amount: 1250.00,
    description: 'New treadmill for cardio zone',
    vendor: 'Fitness Equipment Co.',
    invoice_number: 'INV-2024-0628',
    payment_method: 'bank_transfer',
    status: 'paid',
    approved: true,
    approved_by: 'Owner',
    notes: 'Replacement for broken unit',
  },
];

// Mock User Packages
export const mockUserPackages: UserPackage[] = [
  {
    id: '1',
    user_id: '1',
    package_id: '1',
    purchase_date: '2024-06-01',
    expiry_date: '2024-07-01',
    credits_total: -1,
    credits_used: 0,
    status: 'active',
  },
  {
    id: '2',
    user_id: '2',
    package_id: '2',
    purchase_date: '2024-06-15',
    expiry_date: '2024-08-14',
    credits_total: 10,
    credits_used: 3,
    status: 'active',
  },
];

// Mock Settings
export const mockSettings: Settings = {
  gym: {
    name: 'SWEAT24 Fitness',
    address: '123 Fitness Street, Athens, Greece',
    phone: '+30 210 1234567',
    email: 'info@sweat24.gr',
    website: 'https://sweat24.gr',
    social: {
      facebook: 'https://facebook.com/sweat24',
      instagram: 'https://instagram.com/sweat24',
      youtube: 'https://youtube.com/sweat24',
    },
  },
  system: {
    timezone: 'Europe/Athens',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    currency: 'EUR',
    language: 'el',
    sessionTimeout: 30,
    maintenanceMode: false,
  },
  pricing: {
    taxRate: 24,
    defaultPaymentTerms: 30,
    lateFeePercentage: 5,
    cancellationFee: 10,
  },
};

// Mock Assessments
export const mockBodyMeasurement: BodyMeasurement = {
  id: '1',
  type: 'body_measurement',
  clientId: '1',
  trainerId: '1',
  date: '2024-06-29',
  notes: 'Initial assessment',
  weight: 75.5,
  height: 175,
  bodyFat: 18.5,
  muscleMass: 62.5,
  measurements: {
    chest: 102,
    waist: 85,
    hips: 98,
    leftArm: 32,
    rightArm: 32.5,
    leftThigh: 58,
    rightThigh: 58.5,
    leftCalf: 38,
    rightCalf: 38.5,
  },
};

export const mockEnduranceTest: EnduranceTest = {
  id: '2',
  type: 'endurance',
  clientId: '1',
  trainerId: '1',
  date: '2024-06-29',
  notes: 'Good cardiovascular condition',
  testType: 'Cooper Test',
  duration: 12,
  distance: 2800,
  heartRateMax: 185,
  heartRateAvg: 165,
  vo2Max: 48.5,
};

export const mockStrengthLog: StrengthLog = {
  id: '3',
  type: 'strength',
  clientId: '1',
  trainerId: '1',
  date: '2024-06-29',
  notes: 'Focus on upper body next session',
  exercises: [
    {
      name: 'Bench Press',
      sets: 3,
      reps: [10, 8, 6],
      weight: [60, 70, 80],
      restTime: 120,
    },
    {
      name: 'Squat',
      sets: 4,
      reps: [12, 10, 10, 8],
      weight: [80, 90, 90, 100],
      restTime: 180,
    },
  ],
  totalVolume: 4320,
  workoutDuration: 45,
};

export const mockAssessments: Assessment[] = [
  mockBodyMeasurement,
  mockEnduranceTest,
  mockStrengthLog,
];

// Mock search results
export const mockSearchResults = {
  users: [
    { ...mockUsers[0], type: 'user' as const },
    { ...mockUsers[1], type: 'user' as const },
  ],
  classes: [
    { ...mockClasses[0], type: 'class' as const },
  ],
  bookings: [
    { ...mockBookings[0], type: 'booking' as const },
  ],
};

// Helper to generate paginated response
export const createPaginatedResponse = <T>(
  items: T[],
  page: number = 1,
  perPage: number = 10
) => {
  const start = (page - 1) * perPage;
  const end = start + perPage;
  const paginatedItems = items.slice(start, end);

  return {
    data: paginatedItems,
    meta: {
      current_page: page,
      last_page: Math.ceil(items.length / perPage),
      per_page: perPage,
      total: items.length,
      from: start + 1,
      to: Math.min(end, items.length),
    },
  };
};