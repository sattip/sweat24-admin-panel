// Temporary mock search service for demonstration
// This will be replaced when the Laravel backend search endpoint is implemented

import type { User, Class as GymClass, Booking } from '@/data/mockData';

// Sample mock data for search demonstration
const mockUsers: User[] = [
  {
    id: "1",
    name: "Μαρία Παπαδοπούλου",
    email: "maria@example.com",
    phone: "+30 6974 123 456",
    status: "active",
    membershipType: "premium",
    joinDate: "2024-01-15",
    membershipExpiry: "2025-01-15",
    remainingClasses: 12,
    emergencyContact: "Νίκος Παπαδόπουλος - +30 6974 123 457",
    notes: "",
    avatar: "",
    address: "Αθήνα",
    birthDate: "1990-05-15"
  },
  {
    id: "2",
    name: "Γιάννης Κωνσταντίνου",
    email: "giannis@example.com",
    phone: "+30 6974 234 567",
    status: "active",
    membershipType: "basic",
    joinDate: "2024-02-01",
    membershipExpiry: "2025-02-01",
    remainingClasses: 8,
    emergencyContact: "Ελένη Κωνσταντίνου - +30 6974 234 568",
    notes: "",
    avatar: "",
    address: "Θεσσαλονίκη",
    birthDate: "1985-03-20"
  }
];

const mockClasses: GymClass[] = [
  {
    id: "1",
    title: "CrossFit",
    instructor: "Αλέξανδρος Νικολάου",
    date: new Date().toISOString(),
    time: "10:00",
    duration: 60,
    capacity: 15,
    enrolled: 12,
    status: "scheduled",
    type: "crossfit",
    location: "Κύρια Αίθουσα"
  },
  {
    id: "2",
    title: "Yoga Flow",
    instructor: "Σοφία Δημητρίου",
    date: new Date().toISOString(),
    time: "18:00",
    duration: 75,
    capacity: 20,
    enrolled: 18,
    status: "scheduled",
    type: "yoga",
    location: "Studio 2"
  }
];

const mockBookings: Booking[] = [
  {
    id: "1",
    userId: "1",
    userName: "Μαρία Παπαδοπούλου",
    classId: "1",
    className: "CrossFit",
    date: new Date().toISOString(),
    time: "10:00",
    status: "confirmed",
    checkedIn: false,
    paymentStatus: "paid"
  },
  {
    id: "2",
    userId: "2",
    userName: "Γιάννης Κωνσταντίνου",
    classId: "2",
    className: "Yoga Flow",
    date: new Date().toISOString(),
    time: "18:00",
    status: "confirmed",
    checkedIn: false,
    paymentStatus: "paid"
  }
];

export async function mockGlobalSearch(query: string): Promise<{
  users: Array<User & { type: 'user' }>;
  classes: Array<GymClass & { type: 'class' }>;
  bookings: Array<Booking & { type: 'booking' }>;
}> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const lowerQuery = query.toLowerCase();

  // Search users
  const users = mockUsers
    .filter(user => 
      user.name.toLowerCase().includes(lowerQuery) ||
      user.email.toLowerCase().includes(lowerQuery) ||
      user.phone.includes(query)
    )
    .map(user => ({ ...user, type: 'user' as const }));

  // Search classes
  const classes = mockClasses
    .filter(cls => 
      cls.title.toLowerCase().includes(lowerQuery) ||
      cls.instructor.toLowerCase().includes(lowerQuery) ||
      cls.type.toLowerCase().includes(lowerQuery)
    )
    .map(cls => ({ ...cls, type: 'class' as const }));

  // Search bookings
  const bookings = mockBookings
    .filter(booking => 
      booking.userName.toLowerCase().includes(lowerQuery) ||
      booking.className.toLowerCase().includes(lowerQuery)
    )
    .map(booking => ({ ...booking, type: 'booking' as const }));

  return {
    users,
    classes,
    bookings
  };
}