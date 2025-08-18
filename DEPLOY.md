# 🚀 Sweat24 Admin Panel - Deploy Guide

## Version Indicator System

Κάθε deploy δημιουργεί αυτόματα ένα version indicator που εμφανίζεται στο κάτω δεξιά μέρος του admin panel.

### 🎯 Features
- **Visual version badge** στο UI (π.χ. "🚀 v1")
- **Auto-increment** ή manual version numbering
- **Build tracking** με date & build ID
- **Git integration** για auto-commit

## 📋 Τρόποι Deploy

### 1. Auto-increment Version
```bash
./deploy.sh
```
Αυτόματα αυξάνει το minor version (v1.1 → v1.2)

### 2. Manual Version
```bash
./deploy.sh v2
./deploy.sh v1.5
./deploy.sh v2.1
```

### 3. Traditional Build (χωρίς version update)
```bash
npm run build
```

## 🔧 Τι κάνει το Deploy Script

1. ✅ **Version Update** - Ενημερώνει το `src/config/version.ts`
2. ✅ **Build Process** - Τρέχει `npm run build`
3. ✅ **Git Commit** - Commit του version bump (αν υπάρχει git)
4. ✅ **Deploy Summary** - Εμφανίζει deploy info

## 📍 Version Indicator Locations

- **Position**: Fixed bottom-right corner
- **Style**: Badge με backdrop blur
- **Content**: 🚀 + version number
- **Visibility**: Σε όλες τις σελίδες του admin panel

## 🎨 Customization

### Αλλαγή εμφάνισης version indicator:
```typescript
// src/components/VersionIndicator.tsx
<Badge className="bg-white/90 backdrop-blur-sm border-blue-200">
  <span className="text-xs font-mono">🚀 {version}</span>
</Badge>
```

### Αλλαγή position:
```typescript
// src/components/VersionIndicator.tsx
<div className="fixed bottom-4 right-4 z-50">
```

### Manual version change:
```typescript
// src/config/version.ts
export const APP_VERSION = "v2.0"; // Change this
```

## 📊 Deploy History Tracking

Κάθε deploy δημιουργεί:
- **APP_VERSION**: Human-readable version
- **BUILD_DATE**: ISO timestamp του build
- **BUILD_ID**: Unique 6-char identifier

Αυτές οι πληροφορίες είναι διαθέσιμες στο browser console:
```javascript
import { APP_VERSION, BUILD_DATE, BUILD_ID } from '@/config/version';
console.log('Deploy Info:', { APP_VERSION, BUILD_DATE, BUILD_ID });
```

## ✅ Benefits

1. **Visual Confirmation** - Βλέπεις άμεσα την τρέχουσα version
2. **Deploy Tracking** - Εύκολη παρακολούθηση deploys
3. **Debug Help** - Γρήγορη ταυτοποίηση version σε production
4. **User Confidence** - Οι χρήστες βλέπουν ότι το app ενημερώνεται

## 🚀 Production Deploy Flow

```bash
# 1. Test τις αλλαγές τοπικά
npm run dev

# 2. Deploy με νέα version
./deploy.sh v1

# 3. Verify στο production site
# Θα βλέπεις "🚀 v1" στο κάτω δεξιά!
```

**Το version indicator σου δίνει instant confirmation ότι το deploy ήταν επιτυχές! 🎉**
