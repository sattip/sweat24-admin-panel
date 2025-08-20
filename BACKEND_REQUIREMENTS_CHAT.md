# Backend Requirements για Chat System - Sweat24 Admin Panel

## Επισκόπηση
Έχουμε υλοποιήσει νέες λειτουργίες στο chat system του admin panel που απαιτούν ενημέρωση του backend API για να λειτουργήσουν πλήρως.

## Νέες Λειτουργίες που Προστέθηκαν

### 1. Έναρξη Συνομιλίας από Admin Panel
**Περιγραφή:** Ο admin μπορεί να ξεκινήσει συνομιλία με οποιονδήποτε πελάτη χωρίς να περιμένει ο πελάτης να στείλει πρώτος μήνυμα.

**Frontend Implementation:**
- Κουμπί "Νέα Συνομιλία" στο chat widget
- Κουμπί chat (μωβ εικονίδιο) δίπλα σε κάθε πελάτη στη λίστα πελατών
- Dialog για επιλογή πελάτη και σύνταξη πρώτου μηνύματος

### 2. Notification Badge για Αδιάβαστα Μηνύματα
**Περιγραφή:** Κόκκινο bubble που εμφανίζει τον αριθμό αδιάβαστων μηνυμάτων στο floating chat button.

## Τι Χρειάζεται από το Backend

### 1. Endpoint για Δημιουργία Νέας Συνομιλίας

**Νέο Endpoint Required:**
```
POST /api/v1/admin/chat/conversations
```

**Request Body:**
```json
{
  "user_id": 123,
  "initial_message": "Γεια σου! Θα ήθελα να σε ενημερώσω για..."
}
```

**Expected Response:**
```json
{
  "success": true,
  "conversation": {
    "id": 456,
    "user": {
      "id": 123,
      "name": "Ιωάννης Παπαδόπουλος",
      "email": "john@example.com",
      "avatar": "https://..."
    },
    "messages": [
      {
        "id": 789,
        "content": "Γεια σου! Θα ήθελα να σε ενημερώσω για...",
        "sender_type": "admin",
        "sender": {
          "id": 1,
          "name": "Admin"
        },
        "created_at": "2025-01-19T12:00:00Z",
        "is_read": false
      }
    ],
    "status": "active",
    "last_message_at": "2025-01-19T12:00:00Z",
    "admin_unread_count": 0,
    "user_unread_count": 1
  }
}
```

**Λογική Backend:**
1. Δημιουργία νέας συνομιλίας με τον επιλεγμένο χρήστη
2. Αποθήκευση του αρχικού μηνύματος από τον admin
3. Ορισμός του μηνύματος ως αδιάβαστο για τον χρήστη
4. Επιστροφή της πλήρους συνομιλίας με το μήνυμα

### 2. Διόρθωση Μέτρησης Αδιάβαστων Μηνυμάτων

**Πρόβλημα:** Το endpoint `/api/v1/admin/chat/conversations` επιστρέφει λάθος `admin_unread_count`.

**Τρέχον Endpoint:**
```
GET /api/v1/admin/chat/conversations?status=active
```

**Απαιτούμενη Διόρθωση:**
- Το πεδίο `admin_unread_count` πρέπει να μετράει ΜΟΝΟ τα μηνύματα που:
  1. Είναι από χρήστες (`sender_type: 'user'`)
  2. Δεν έχουν διαβαστεί από τον admin (`is_read_by_admin: false`)
  3. Ανήκουν στη συγκεκριμένη συνομιλία

**Παράδειγμα Σωστής Response:**
```json
{
  "conversations": [
    {
      "id": 1,
      "user": {...},
      "admin_unread_count": 0,  // Πρέπει να είναι 0 αν δεν υπάρχουν αδιάβαστα
      "messages": [...],
      "status": "active"
    }
  ]
}
```

### 3. Endpoint για Mark as Read (Επιβεβαίωση)

**Υπάρχον Endpoint:**
```
PUT /api/v1/admin/chat/conversations/{conversationId}/read
```

**Απαιτούμενη Λειτουργία:**
- Να μαρκάρει ΟΛΑ τα μηνύματα του χρήστη σε αυτή τη συνομιλία ως διαβασμένα από τον admin
- Να ενημερώνει το `admin_unread_count` σε 0

## Database Schema Προτάσεις

### Πίνακας: chat_conversations
```sql
CREATE TABLE chat_conversations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  status ENUM('active', 'resolved', 'archived') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_message_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Πίνακας: chat_messages
```sql
CREATE TABLE chat_messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  conversation_id INT NOT NULL,
  sender_type ENUM('user', 'admin') NOT NULL,
  sender_id INT NOT NULL,
  content TEXT NOT NULL,
  is_read_by_admin BOOLEAN DEFAULT FALSE,
  is_read_by_user BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id)
);
```

## Προτεραιότητες Υλοποίησης

1. **ΥΨΗΛΗ:** Διόρθωση μέτρησης αδιάβαστων μηνυμάτων (admin_unread_count)
2. **ΥΨΗΛΗ:** Endpoint για δημιουργία νέας συνομιλίας από admin
3. **ΜΕΣΑΙΑ:** Βελτιστοποίηση mark as read functionality

## Testing Scenarios

1. **Νέα Συνομιλία:**
   - Admin επιλέγει χρήστη που ΔΕΝ έχει προηγούμενη συνομιλία
   - Admin στέλνει μήνυμα
   - Δημιουργείται νέα συνομιλία
   - Ο χρήστης λαμβάνει notification

2. **Αδιάβαστα Μηνύματα:**
   - Χρήστης στέλνει μήνυμα
   - Admin βλέπει κόκκινο badge με "1"
   - Admin ανοίγει τη συνομιλία
   - Badge εξαφανίζεται (admin_unread_count = 0)

## Επικοινωνία

Για οποιαδήποτε διευκρίνιση ή πρόσθετη πληροφορία, παρακαλώ επικοινωνήστε με την ομάδα frontend.

---

**Version:** 1.13  
**Date:** 19/01/2025  
**Frontend Ready:** ✅ Ναι  
**Backend Required:** ⏳ Αναμένεται υλοποίηση