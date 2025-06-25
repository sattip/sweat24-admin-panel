import { mockOwnerNotifications } from "@/data/mockData";
import type { OwnerNotification } from "@/data/mockData";

export const createOwnerNotification = (notification: Omit<OwnerNotification, 'id' | 'timestamp' | 'isRead'>): OwnerNotification => {
  const newNotification: OwnerNotification = {
    ...notification,
    id: `notif_${Date.now()}`,
    timestamp: new Date().toISOString(),
    isRead: false,
  };
  
  // In a real app, this would be sent to the backend
  mockOwnerNotifications.unshift(newNotification);
  
  return newNotification;
};

export const notifyGracefulCancellation = (
  trainerName: string,
  customerName: string,
  bookingId: string,
  className: string
) => {
  return createOwnerNotification({
    type: 'graceful_cancellation',
    title: 'Χαριστική Ακύρωση από Προπονητή',
    message: `Ο προπονητής ${trainerName} ακύρωσε το ραντεβού "${className}" του πελάτη ${customerName} εντός του χρονικού ορίου χρέωσης.`,
    trainerName,
    customerName,
    bookingId,
    priority: 'high'
  });
};

export const notifyPackageExtension = (
  trainerName: string,
  customerName: string,
  packageId: string,
  packageName: string,
  extensionDays: number
) => {
  return createOwnerNotification({
    type: 'package_extension',
    title: 'Επέκταση Πακέτου από Προπονητή',
    message: `Ο προπονητής ${trainerName} επέκτεινε το πακέτο "${packageName}" του πελάτη ${customerName} κατά ${extensionDays} ημέρες.`,
    trainerName,
    customerName,
    packageId,
    priority: 'medium'
  });
}; 