import { Tag, Calendar, Info, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

export const NOTIFICATION_TYPES = {
  info: "Πληροφορία",
  warning: "Προειδοποίηση", 
  success: "Επιτυχία",
  error: "Σφάλμα",
  offer: "Προσφορά",
  party_event: "Πάρτι/Εκδήλωση"
} as const;

export const NOTIFICATION_ICONS = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle,
  error: XCircle,
  offer: Tag,
  party_event: Calendar,
} as const;

export const NOTIFICATION_COLORS = {
  info: "bg-blue-50 text-blue-800",
  warning: "bg-yellow-50 text-yellow-800",
  success: "bg-green-50 text-green-800",
  error: "bg-red-50 text-red-800",
  offer: "bg-purple-50 text-purple-800",
  party_event: "bg-pink-50 text-pink-800",
} as const;

export const NOTIFICATION_EMOJIS = {
  info: "ℹ️",
  warning: "⚠️",
  success: "✅",
  error: "❌",
  offer: "🏷️",
  party_event: "🎉",
} as const;

export type NotificationType = keyof typeof NOTIFICATION_TYPES; 