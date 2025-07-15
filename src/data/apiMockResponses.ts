// API Mock Responses for React Apps
// This file provides mock responses for cases where Laravel APIs aren't fully implemented
// or when you need to test frontend functionality without backend dependencies

import { format, addDays, subDays } from 'date-fns';

// Mock API Response Types
export interface MockApiResponse<T> {
  data: T;
  status: 'success' | 'error';
  message?: string;
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

// Dashboard Statistics Mock
export const mockDashboardStats = {
  overview: {
    totalMembers: 156,
    activeMembers: 134,
    totalRevenue: 18750.00,
    monthlyRevenue: 12340.00,
    todayBookings: 23,
    upcomingClasses: 8,
    expiringPackages: 12,
    pendingPayments: 5
  },
  revenueChart: {
    labels: ['Ιαν', 'Φεβ', 'Μαρ', 'Απρ', 'Μαι', 'Ιουν'],
    data: [8500, 9200, 11200, 10800, 12340, 13500],
    target: 15000
  },
  membershipDistribution: {
    Basic: 45,
    Premium: 67,
    Student: 23,
    Trial: 21
  },
  classAttendance: {
    labels: ['Δευ', 'Τρι', 'Τετ', 'Πεμ', 'Παρ', 'Σαβ', 'Κυρ'],
    data: [78, 85, 92, 88, 95, 102, 76]
  },
  topClasses: [
    { name: 'HIIT Blast', bookings: 145, revenue: 2340.00 },
    { name: 'Yoga Flow', bookings: 123, revenue: 1980.00 },
    { name: 'Personal Training', bookings: 89, revenue: 4450.00 },
    { name: 'Pilates Core', bookings: 78, revenue: 1560.00 },
    { name: 'EMS Training', bookings: 56, revenue: 1680.00 }
  ],
  recentActivity: [
    {
      id: '1',
      type: 'user_registration',
      description: 'Νέα εγγραφή: Μαρία Παπαδάκη',
      timestamp: new Date().toISOString(),
      icon: 'user-plus'
    },
    {
      id: '2',
      type: 'package_purchase',
      description: 'Αγορά πακέτου: Premium 6 μήνες',
      timestamp: subDays(new Date(), 1).toISOString(),
      icon: 'shopping-cart'
    },
    {
      id: '3',
      type: 'class_booking',
      description: 'Κράτηση: HIIT Blast - Γιάννης Κ.',
      timestamp: subDays(new Date(), 2).toISOString(),
      icon: 'calendar'
    }
  ]
};

// Enhanced User Management Mock
export const mockUsersApi = {
  getUsers: (): MockApiResponse<any[]> => ({
    data: [
      {
        id: 1,
        name: 'Γιάννης Παπαδόπουλος',
        email: 'giannis@email.com',
        phone: '6944123456',
        role: 'member',
        membership_type: 'Premium',
        status: 'active',
        join_date: '2024-01-15',
        last_visit: '2024-07-06',
        total_sessions: 45,
        remaining_sessions: 8,
        packages: [
          {
            id: 1,
            name: 'Premium Membership 6 μήνες',
            status: 'active',
            expires_at: '2024-08-15',
            remaining_sessions: 8
          }
        ],
        avatar: null,
        medical_history: 'Χωρίς ιδιαίτερες παθήσεις'
      },
      {
        id: 2,
        name: 'Μαρία Κωνσταντίνου',
        email: 'maria@email.com',
        phone: '6955234567',
        role: 'member',
        membership_type: 'Basic',
        status: 'active',
        join_date: '2024-02-10',
        last_visit: '2024-07-05',
        total_sessions: 28,
        remaining_sessions: 3,
        packages: [
          {
            id: 2,
            name: 'Yoga & Pilates 10 συνεδρίες',
            status: 'active',
            expires_at: '2024-08-10',
            remaining_sessions: 3
          }
        ],
        avatar: null,
        medical_history: 'Πρόβλημα στη μέση'
      }
    ],
    status: 'success',
    pagination: {
      current_page: 1,
      per_page: 10,
      total: 156,
      last_page: 16
    }
  }),

  createUser: (userData: any): MockApiResponse<any> => ({
    data: {
      id: Date.now(),
      ...userData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    status: 'success',
    message: 'Ο χρήστης δημιουργήθηκε επιτυχώς'
  }),

  updateUser: (id: number, userData: any): MockApiResponse<any> => ({
    data: {
      id,
      ...userData,
      updated_at: new Date().toISOString()
    },
    status: 'success',
    message: 'Ο χρήστης ενημερώθηκε επιτυχώς'
  }),

  deleteUser: (id: number): MockApiResponse<null> => ({
    data: null,
    status: 'success',
    message: 'Ο χρήστης διαγράφηκε επιτυχώς'
  })
};

// Enhanced Bookings Mock
export const mockBookingsApi = {
  getBookings: (): MockApiResponse<any[]> => ({
    data: [
      {
        id: 1,
        user_id: 1,
        class_id: 1,
        customer_name: 'Γιάννης Παπαδόπουλος',
        customer_email: 'giannis@email.com',
        class_name: 'HIIT Blast',
        instructor: 'Άλεξ Ροδρίγκεζ',
        date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
        time: '09:00',
        status: 'confirmed',
        type: 'group',
        location: 'Main Floor',
        booking_time: subDays(new Date(), 2).toISOString(),
        attended: null,
        can_cancel: true,
        can_reschedule: true
      },
      {
        id: 2,
        user_id: 2,
        class_id: 2,
        customer_name: 'Μαρία Κωνσταντίνου',
        customer_email: 'maria@email.com',
        class_name: 'Yoga Flow',
        instructor: 'Εμιλι Τσεν',
        date: format(new Date(), 'yyyy-MM-dd'),
        time: '18:00',
        status: 'confirmed',
        type: 'group',
        location: 'Studio A',
        booking_time: subDays(new Date(), 1).toISOString(),
        attended: null,
        can_cancel: true,
        can_reschedule: true
      }
    ],
    status: 'success',
    pagination: {
      current_page: 1,
      per_page: 20,
      total: 87,
      last_page: 5
    }
  }),

  createBooking: (bookingData: any): MockApiResponse<any> => ({
    data: {
      id: Date.now(),
      ...bookingData,
      booking_time: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    status: 'success',
    message: 'Η κράτηση δημιουργήθηκε επιτυχώς'
  }),

  cancelBooking: (id: number): MockApiResponse<any> => ({
    data: {
      id,
      status: 'cancelled',
      cancelled_at: new Date().toISOString()
    },
    status: 'success',
    message: 'Η κράτηση ακυρώθηκε επιτυχώς'
  }),

  rescheduleBooking: (id: number, newDateTime: { date: string; time: string }): MockApiResponse<any> => ({
    data: {
      id,
      ...newDateTime,
      rescheduled_at: new Date().toISOString()
    },
    status: 'success',
    message: 'Η κράτηση μετακινήθηκε επιτυχώς'
  })
};

// Enhanced Classes Mock
export const mockClassesApi = {
  getClasses: (): MockApiResponse<any[]> => ({
    data: [
      {
        id: 1,
        name: 'HIIT Blast',
        type: 'group',
        instructor: 'Άλεξ Ροδρίγκεζ',
        date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
        time: '09:00',
        duration: 45,
        max_participants: 12,
        current_participants: 8,
        location: 'Main Floor',
        description: 'Υψηλής έντασης καρδιοαγγειακή προπόνηση',
        status: 'active',
        price: 0, // Included in membership
        waitlist_count: 0,
        available_spots: 4
      },
      {
        id: 2,
        name: 'Yoga Flow',
        type: 'group',
        instructor: 'Εμιλι Τσεν',
        date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
        time: '18:00',
        duration: 60,
        max_participants: 15,
        current_participants: 12,
        location: 'Studio A',
        description: 'Ρελακσάρισμα και ευελιξία',
        status: 'active',
        price: 0,
        waitlist_count: 2,
        available_spots: 3
      }
    ],
    status: 'success',
    pagination: {
      current_page: 1,
      per_page: 20,
      total: 45,
      last_page: 3
    }
  }),

  createClass: (classData: any): MockApiResponse<any> => ({
    data: {
      id: Date.now(),
      ...classData,
      current_participants: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    status: 'success',
    message: 'Το μάθημα δημιουργήθηκε επιτυχώς'
  }),

  updateClass: (id: number, classData: any): MockApiResponse<any> => ({
    data: {
      id,
      ...classData,
      updated_at: new Date().toISOString()
    },
    status: 'success',
    message: 'Το μάθημα ενημερώθηκε επιτυχώς'
  }),

  deleteClass: (id: number): MockApiResponse<null> => ({
    data: null,
    status: 'success',
    message: 'Το μάθημα διαγράφηκε επιτυχώς'
  })
};

// Enhanced Packages Mock
export const mockPackagesApi = {
  getPackages: (): MockApiResponse<any[]> => ({
    data: [
      {
        id: 1,
        name: 'Basic Membership 1 μήνας',
        price: 50.00,
        duration: 30,
        sessions: null,
        type: 'membership',
        status: 'active',
        description: 'Βασική μηνιαία συνδρομή',
        features: ['Πρόσβαση σε ομαδικά μαθήματα', 'Χρήση εξοπλισμού'],
        popular: false,
        discount: null
      },
      {
        id: 2,
        name: 'Premium Membership 6 μήνες',
        price: 300.00,
        duration: 180,
        sessions: null,
        type: 'membership',
        status: 'active',
        description: 'Premium εξαμηνιαία συνδρομή',
        features: ['Όλα τα ομαδικά μαθήματα', 'Προτεραιότητα κρατήσεων', 'Δωρεάν διατροφική συμβουλή'],
        popular: true,
        discount: 17
      },
      {
        id: 3,
        name: 'Personal Training 8 συνεδρίες',
        price: 300.00,
        duration: 90,
        sessions: 8,
        type: 'personal',
        status: 'active',
        description: 'Πακέτο προσωπικών προπονήσεων',
        features: ['8 προσωπικές προπονήσεις', 'Εξατομικευμένο πρόγραμμα', 'Διατροφικές συμβουλές'],
        popular: false,
        discount: 6
      }
    ],
    status: 'success',
    pagination: {
      current_page: 1,
      per_page: 10,
      total: 11,
      last_page: 2
    }
  }),

  createPackage: (packageData: any): MockApiResponse<any> => ({
    data: {
      id: Date.now(),
      ...packageData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    status: 'success',
    message: 'Το πακέτο δημιουργήθηκε επιτυχώς'
  }),

  updatePackage: (id: number, packageData: any): MockApiResponse<any> => ({
    data: {
      id,
      ...packageData,
      updated_at: new Date().toISOString()
    },
    status: 'success',
    message: 'Το πακέτο ενημερώθηκε επιτυχώς'
  }),

  deletePackage: (id: number): MockApiResponse<null> => ({
    data: null,
    status: 'success',
    message: 'Το πακέτο διαγράφηκε επιτυχώς'
  })
};

// Enhanced Notifications Mock
export const mockNotificationsApi = {
  getNotifications: (): MockApiResponse<any[]> => ({
    data: [
      {
        id: 1,
        title: 'Καλωσόρισμα νέων μελών',
        message: 'Καλώς ήρθατε στο SWEAT24! Είμαστε ενθουσιασμένοι...',
        type: 'welcome',
        priority: 'medium',
        status: 'sent',
        target_audience: 'new_members',
        delivery_method: ['email', 'in_app'],
        scheduled_for: null,
        sent_at: subDays(new Date(), 2).toISOString(),
        recipients_count: 23,
        opened_count: 18,
        clicked_count: 12,
        created_at: subDays(new Date(), 3).toISOString()
      },
      {
        id: 2,
        title: 'Υπενθύμιση λήξης πακέτου',
        message: 'Το πακέτο σας λήγει σε 7 ημέρες...',
        type: 'package_expiry',
        priority: 'high',
        status: 'scheduled',
        target_audience: 'expiring_packages',
        delivery_method: ['email', 'sms'],
        scheduled_for: addDays(new Date(), 1).toISOString(),
        sent_at: null,
        recipients_count: 12,
        opened_count: 0,
        clicked_count: 0,
        created_at: subDays(new Date(), 1).toISOString()
      },
      {
        id: 3,
        title: 'Νέα μαθήματα EMS',
        message: 'Ανακαλύψτε την τεχνολογία EMS...',
        type: 'new_service',
        priority: 'medium',
        status: 'draft',
        target_audience: 'premium_members',
        delivery_method: ['email', 'in_app'],
        scheduled_for: null,
        sent_at: null,
        recipients_count: 0,
        opened_count: 0,
        clicked_count: 0,
        created_at: new Date().toISOString()
      }
    ],
    status: 'success',
    pagination: {
      current_page: 1,
      per_page: 10,
      total: 28,
      last_page: 3
    }
  }),

  sendNotification: (id: number): MockApiResponse<any> => ({
    data: {
      id,
      status: 'sent',
      sent_at: new Date().toISOString()
    },
    status: 'success',
    message: 'Η ειδοποίηση στάλθηκε επιτυχώς'
  }),

  createNotification: (notificationData: any): MockApiResponse<any> => ({
    data: {
      id: Date.now(),
      ...notificationData,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    status: 'success',
    message: 'Η ειδοποίηση δημιουργήθηκε επιτυχώς'
  })
};

// Enhanced Financial Mock
export const mockFinancialApi = {
  getCashRegister: (): MockApiResponse<any> => ({
    data: {
      current_balance: 1250.75,
      today_income: 340.00,
      today_withdrawals: 150.00,
      entries: [
        {
          id: 1,
          type: 'income',
          amount: 50.00,
          description: 'Πληρωμή πακέτου - Μαρία Κ.',
          category: 'Package Payment',
          timestamp: new Date().toISOString(),
          payment_method: 'card',
          user_name: 'Admin'
        },
        {
          id: 2,
          type: 'income',
          amount: 40.00,
          description: 'Personal Training - Γιάννης Π.',
          category: 'Personal Training',
          timestamp: subDays(new Date(), 1).toISOString(),
          payment_method: 'cash',
          user_name: 'Admin'
        }
      ]
    },
    status: 'success'
  }),

  addCashEntry: (entryData: any): MockApiResponse<any> => ({
    data: {
      id: Date.now(),
      ...entryData,
      timestamp: new Date().toISOString(),
      created_at: new Date().toISOString()
    },
    status: 'success',
    message: 'Η καταχώρηση προστέθηκε επιτυχώς'
  }),

  getExpenses: (): MockApiResponse<any[]> => ({
    data: [
      {
        id: 1,
        category: 'utilities',
        subcategory: 'Ηλεκτρικό ρεύμα',
        description: 'Λογαριασμός ΔΕΗ Ιουλίου',
        amount: 320.00,
        date: format(subDays(new Date(), 5), 'yyyy-MM-dd'),
        vendor: 'ΔΕΗ',
        payment_method: 'transfer',
        approved: true,
        approved_by: 'Admin',
        receipt_url: null
      },
      {
        id: 2,
        category: 'equipment',
        subcategory: 'Συντήρηση μηχανημάτων',
        description: 'Επισκευή treadmill #3',
        amount: 150.00,
        date: format(subDays(new Date(), 3), 'yyyy-MM-dd'),
        vendor: 'TechnoGym Service',
        payment_method: 'cash',
        approved: true,
        approved_by: 'Admin',
        receipt_url: null
      }
    ],
    status: 'success',
    pagination: {
      current_page: 1,
      per_page: 20,
      total: 156,
      last_page: 8
    }
  }),

  addExpense: (expenseData: any): MockApiResponse<any> => ({
    data: {
      id: Date.now(),
      ...expenseData,
      approved: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    status: 'success',
    message: 'Το έξοδο καταχωρήθηκε επιτυχώς'
  })
};

// Enhanced Reports Mock
export const mockReportsApi = {
  getRevenueReport: (params: any): MockApiResponse<any> => ({
    data: {
      total_revenue: 45680.00,
      revenue_by_category: {
        'Package Sales': 32450.00,
        'Personal Training': 8940.00,
        'Retail Sales': 2890.00,
        'Day Passes': 1400.00
      },
      monthly_trend: [
        { month: 'Ιαν', revenue: 6800.00 },
        { month: 'Φεβ', revenue: 7200.00 },
        { month: 'Μαρ', revenue: 8100.00 },
        { month: 'Απρ', revenue: 7800.00 },
        { month: 'Μαι', revenue: 8400.00 },
        { month: 'Ιουν', revenue: 7380.00 }
      ],
      top_packages: [
        { name: 'Premium Membership 6 μήνες', sales: 45, revenue: 13500.00 },
        { name: 'Basic Membership 1 μήνας', sales: 89, revenue: 4450.00 },
        { name: 'Personal Training 8 συνεδρίες', sales: 23, revenue: 6900.00 }
      ]
    },
    status: 'success'
  }),

  getMembershipReport: (params: any): MockApiResponse<any> => ({
    data: {
      total_members: 156,
      active_members: 134,
      new_members_this_month: 12,
      retention_rate: 87.5,
      membership_distribution: {
        'Basic': 45,
        'Premium': 67,
        'Student': 23,
        'Trial': 21
      },
      age_distribution: {
        '18-25': 23,
        '26-35': 45,
        '36-45': 34,
        '46-55': 28,
        '56+': 26
      },
      monthly_growth: [
        { month: 'Ιαν', new_members: 8, cancelled: 3 },
        { month: 'Φεβ', new_members: 12, cancelled: 2 },
        { month: 'Μαρ', new_members: 15, cancelled: 4 },
        { month: 'Απρ', new_members: 10, cancelled: 6 },
        { month: 'Μαι', new_members: 14, cancelled: 3 },
        { month: 'Ιουν', new_members: 12, cancelled: 5 }
      ]
    },
    status: 'success'
  })
};

// Export all mock APIs
export const mockApiResponses = {
  dashboard: mockDashboardStats,
  users: mockUsersApi,
  bookings: mockBookingsApi,
  classes: mockClassesApi,
  packages: mockPackagesApi,
  notifications: mockNotificationsApi,
  financial: mockFinancialApi,
  reports: mockReportsApi
};

// Utility function to simulate API delay
export const simulateApiDelay = (ms: number = 500): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Error responses for testing
export const mockErrorResponses = {
  unauthorized: {
    data: null,
    status: 'error' as const,
    message: 'Μη εξουσιοδοτημένη πρόσβαση'
  },
  validation: {
    data: null,
    status: 'error' as const,
    message: 'Σφάλμα επικύρωσης δεδομένων',
    errors: {
      email: ['Το email είναι υποχρεωτικό'],
      phone: ['Το τηλέφωνο πρέπει να έχει 10 ψηφία']
    }
  },
  server: {
    data: null,
    status: 'error' as const,
    message: 'Σφάλμα διακομιστή. Παρακαλώ δοκιμάστε ξανά.'
  },
  notFound: {
    data: null,
    status: 'error' as const,
    message: 'Δεν βρέθηκε το αιτούμενο περιεχόμενο'
  }
};

// Helper function to randomly return error responses for testing
export const withRandomError = <T>(
  response: MockApiResponse<T>,
  errorProbability: number = 0.1
): MockApiResponse<T> => {
  if (Math.random() < errorProbability) {
    const errors = Object.values(mockErrorResponses);
    return errors[Math.floor(Math.random() * errors.length)] as MockApiResponse<T>;
  }
  return response;
};