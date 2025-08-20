import { differenceInYears, parseISO, format } from 'date-fns';
import { el } from 'date-fns/locale';

// Gender Display Helper
export function getGenderDisplay(gender: string | null): string {
  const genderMap = {
    'male': 'Άνδρας',
    'female': 'Γυναίκα', 
    'other': 'Άλλο',
    'prefer_not_to_say': 'Προτιμώ να μη το πω'
  };
  return genderMap[gender as keyof typeof genderMap] || 'Μη καθορισμένο';
}

// Age Calculation
export function calculateAge(dateOfBirth: string | null): number | null {
  if (!dateOfBirth) return null;
  try {
    const birthDate = parseISO(dateOfBirth);
    const age = differenceInYears(new Date(), birthDate);
    return age >= 0 ? age : null;
  } catch {
    return null;
  }
}

// Date Formatting
export function formatGreekDate(dateString: string | null): string {
  if (!dateString) return 'Μη καθορισμένο';
  try {
    return format(parseISO(dateString), 'dd/MM/yyyy', { locale: el });
  } catch {
    return 'Άκυρη ημερομηνία';
  }
}

// Timestamp Formatting  
export function formatGreekTimestamp(timestampString: string | null): string {
  if (!timestampString) return 'Μη καθορισμένο';
  try {
    return format(parseISO(timestampString), 'dd/MM/yyyy HH:mm', { locale: el });
  } catch {
    return 'Άκυρη ημερομηνία';
  }
}

// Name Lock Check
export function isNameLocked(user: any): boolean {
  return user.registration_status === 'completed' && user.approved_at !== null;
}

// Validation Helpers
export function validateWeight(value: string | number): boolean {
  if (!value) return true; // Optional field
  const num = parseFloat(value.toString());
  return num >= 30 && num <= 300;
}

export function validateHeight(value: string | number): boolean {
  if (!value) return true; // Optional field
  const num = parseFloat(value.toString());
  return num >= 100 && num <= 250;
}

// Weight/Height Display Helpers
export function formatWeight(weight: number | null): string {
  return weight ? `${weight} kg` : 'Μη καθορισμένο';
}

export function formatHeight(height: number | null): string {
  return height ? `${height} cm` : 'Μη καθορισμένο';
}

// Age Display Helper
export function formatAge(dateOfBirth: string | null): string {
  const age = calculateAge(dateOfBirth);
  return age !== null ? `${age} ετών` : 'Άγνωστη ηλικία';
}

// Safe Display Helper - για null/undefined values
export function displayField(value: any, fallback: string = 'Μη καθορισμένο'): string {
  return value !== null && value !== undefined && value !== '' ? value : fallback;
}

// Registration Date Helper - handles both created_at and joinDate
export function formatRegistrationDate(user: any): string {
  if (user.created_at) {
    return formatGreekDate(user.created_at.split('T')[0]);
  } else if (user.joinDate) {
    return formatGreekDate(user.joinDate);
  } else if (user.join_date) {
    return formatGreekDate(user.join_date);
  }
  return 'Μη καθορισμένο';
}
